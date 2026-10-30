import React, { useEffect, useState, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronDown, Loader2, UploadCloud, X, FileEdit, FilePlus2 } from "lucide-react";
import { uploadFile, type UploadProgress, deleteFiles } from "../services/s3Service";
import { showError, showSuccess, showLoading, closeAlert, getApiErrorMessage } from "../utils/swalHelper";

export interface FieldConfig<T> {
  name: keyof T;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "email" | "password" | "file" | "multi-image";
  readOnly?: boolean;
  accept?: string; // file types
  multiple?: boolean;
  maxFileSize?: number; // Max file size in MB
  maxFiles?: number; // Max number of files for multi-image
}

interface FileUploadState {
  file: File;
  preview: string;
  progress: number;
  uploading: boolean;
  error?: string;
}

interface CRUDFormProps<T> {
  fetchItem?: (id: string) => Promise<T>;
  createItem: (data: Omit<T, "_id">) => Promise<T>;
  updateItem: (id: string, data: Partial<T>) => Promise<T>;
  fields: FieldConfig<T>[];
  entityName: string;
  onChangeField?: (field: keyof T, value: string | File | File[], form: Partial<T>) => Partial<T>;
  extraSelectOptions?: { [key in keyof T]?: { _id: string; name: string }[] };
}

const normalizeImages = (input: string | string[]): string[] => {
  const result: string[] = [];

  const walk = (v: string | string[]) => {
    if (!v) return;

    if (typeof v === "string") {
      // JSON array string
      if (v.startsWith("[") && v.endsWith("]")) {
        try {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) {
            parsed.forEach(walk);
            return;
          }
        } catch {
          // ignore invalid JSON
        }
      }

      // comma-separated
      if (v.includes(",")) {
        v.split(",").map(s => s.trim()).filter(Boolean).forEach(walk);
        return;
      }

      result.push(v);
      return;
    }

    if (Array.isArray(v)) {
      v.forEach(walk);
    }
  };

  walk(input);
  return result;
};


function CRUDForm<T>({
  fetchItem,
  createItem,
  updateItem,
  fields,
  entityName,
  onChangeField,
  extraSelectOptions,
}: CRUDFormProps<T>) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<T>>({});
  const [uploadStates, setUploadStates] = useState<{ [key: string]: FileUploadState[] }>({});
  const [isDragging, setIsDragging] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track original image URLs for edit mode to detect removed images
  const originalImagesRef = useRef<{ [key: string]: string[] }>({});

  // Initialize form
  useEffect(() => {
    if (id && fetchItem) {
      (async () => {
        const data = await fetchItem(id);
        const processed: Partial<T> = { ...data };
  
        fields.forEach(f => {
          if (f.type === "file" || f.type === "multi-image") {
            const fieldKey = String(f.name);
            const urls = normalizeImages(processed[f.name] as string | string[]);
  
            if (urls.length > 0) {
              (processed as Record<string, unknown>)[f.name as string] = urls as unknown as T[keyof T];
              originalImagesRef.current[fieldKey] = urls;
  
              setUploadStates(prev => ({
                ...prev,
                [fieldKey]: urls.map((url, idx) => ({
                  file: new File([], `existing-${idx}.jpg`),
                  preview: url,
                  progress: 100,
                  uploading: false,
                })),
              }));
            }
          }
        });
  
        setForm(processed);
      })();
    } else {
      const initial = fields.reduce((acc, f) => {
        acc[f.name] = "" as unknown as T[keyof T];
        return acc;
      }, {} as Partial<T>);
      setForm(initial);
    }
  }, [id, fetchItem, fields]);
  

  // Handle text, textarea, select changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let updatedForm: Partial<T> = { ...form, [name as keyof T]: value as T[keyof T] };

    if (onChangeField) {
      updatedForm = onChangeField(name as keyof T, value, updatedForm);
    }

    setForm(updatedForm);
  };

  // Validate file size
  const validateFile = (file: File, field: FieldConfig<T>): string | null => {
    if (field.maxFileSize) {
      const maxSizeBytes = field.maxFileSize * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSizeBytes) {
        return `File "${file.name}" exceeds maximum size of ${field.maxFileSize}MB`;
      }
    }
    return null;
  };

  // Handle file / multi-image selection with validation
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: FieldConfig<T>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const fieldKey = String(field.name);
    const validationErrors: string[] = [];

    // Validate each file
    fileArray.forEach(file => {
      const error = validateFile(file, field);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(prev => ({ ...prev, [fieldKey]: validationErrors.join(", ") }));
      return;
    }

    // Clear previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldKey];
      return newErrors;
    });

    // Check max files limit
    const currentFiles = uploadStates[fieldKey] || [];
    if (field.multiple && field.maxFiles && currentFiles.length + fileArray.length > field.maxFiles) {
      setErrors(prev => ({
        ...prev,
        [fieldKey]: `Maximum ${field.maxFiles} files allowed. You're trying to add ${fileArray.length} more files.`,
      }));
      return;
    }

    // Create upload states for new files
    const newUploadStates: FileUploadState[] = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploading: false,
    }));

    if (field.multiple) {
      setUploadStates(prev => ({
        ...prev,
        [fieldKey]: [...(prev[fieldKey] || []), ...newUploadStates],
      }));
      setForm(prev => ({
        ...prev,
        [field.name]: [...((prev[field.name] as File[]) || []), ...fileArray],
      }));
    } else {
      // Clean up old preview URLs
      if (uploadStates[fieldKey]?.[0]?.preview) {
        URL.revokeObjectURL(uploadStates[fieldKey][0].preview);
      }
      setUploadStates(prev => ({ ...prev, [fieldKey]: [newUploadStates[0]] }));
      setForm(prev => ({ ...prev, [field.name]: fileArray[0] }));
    }

    // Reset input
    if (fileInputRefs.current[fieldKey]) {
      fileInputRefs.current[fieldKey]!.value = "";
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>, field: FieldConfig<T>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(prev => ({ ...prev, [String(field.name)]: true }));
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>, field: FieldConfig<T>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(prev => ({ ...prev, [String(field.name)]: false }));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, field: FieldConfig<T>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(prev => ({ ...prev, [String(field.name)]: false }));

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Create a synthetic event to reuse handleFileChange
    const syntheticEvent = {
      target: { files },
    } as ChangeEvent<HTMLInputElement>;

    handleFileChange(syntheticEvent, field);
  };

  // Remove a preview image
  const removePreview = (fieldName: keyof T, index: number) => {
    const key = String(fieldName);

    // Revoke object URL to prevent memory leaks
    const uploadState = uploadStates[key]?.[index];
    if (uploadState?.preview && uploadState.preview.startsWith("blob:")) {
      URL.revokeObjectURL(uploadState.preview);
    }

    // Remove from upload states
    setUploadStates(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));

    // Remove from form
    const current = form[fieldName];
    if (Array.isArray(current)) {
      const newFiles = current.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, [fieldName]: newFiles.length > 0 ? newFiles : undefined }));
    } else {
      setForm(prev => ({ ...prev, [fieldName]: undefined }));
    }

    // Clear error if exists
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Submit form: upload files to S3 before sending data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    showLoading(id ? "Updating..." : "Creating...");

    try {
      const uploadForm = { ...form };

      // Upload images to S3 with progress tracking
      for (const f of fields) {
        if ((f.type === "file" || f.type === "multi-image") && form[f.name]) {
          const fieldKey = String(f.name);
          const value = form[f.name];
          const currentStates = uploadStates[fieldKey] || [];

          if (f.multiple && Array.isArray(value)) {
            // Upload multiple files with progress
            const urls: string[] = [];
            for (let i = 0; i < value.length; i++) {
              const item = value[i];
              
              // Skip if it's already a URL (existing image)
              if (typeof item === "string") {
                urls.push(item);
                continue;
              }
              
              // It's a File object, need to upload
              const file = item as File;
              const stateIndex = currentStates.findIndex(s => 
                s.file === file || (s.file.name === file.name && s.file.size === file.size)
              );
              
              // Update state to uploading
              setUploadStates(prev => {
                const newStates = [...(prev[fieldKey] || [])];
                if (stateIndex !== -1) {
                  newStates[stateIndex] = { ...newStates[stateIndex], uploading: true, progress: 0 };
                } else {
                  // Add new state if not found
                  newStates.push({
                    file,
                    preview: URL.createObjectURL(file),
                    progress: 0,
                    uploading: true,
                  });
                }
                return { ...prev, [fieldKey]: newStates };
              });

              try {
                const url = await uploadFile(
                  file,
                  "products",
                  (progress: UploadProgress) => {
                    setUploadStates(prev => {
                      const newStates = [...(prev[fieldKey] || [])];
                      const idx = newStates.findIndex(s => 
                        s.file === file || (s.file.name === file.name && s.file.size === file.size)
                      );
                      if (idx !== -1) {
                        newStates[idx] = { ...newStates[idx], progress: progress.percentage };
                      }
                      return { ...prev, [fieldKey]: newStates };
                    });
                  }
                );
                urls.push(url);

                // Mark as completed
                setUploadStates(prev => {
                  const newStates = [...(prev[fieldKey] || [])];
                  const idx = newStates.findIndex(s => 
                    s.file === file || (s.file.name === file.name && s.file.size === file.size)
                  );
                  if (idx !== -1) {
                    newStates[idx] = { ...newStates[idx], uploading: false, progress: 100 };
                  }
                  return { ...prev, [fieldKey]: newStates };
                });
              } catch (error) {
                // Mark as error
                setUploadStates(prev => {
                  const newStates = [...(prev[fieldKey] || [])];
                  const idx = newStates.findIndex(s => 
                    s.file === file || (s.file.name === file.name && s.file.size === file.size)
                  );
                  if (idx !== -1) {
                    newStates[idx] = { ...newStates[idx], uploading: false, error: "Upload failed" };
                  }
                  return { ...prev, [fieldKey]: newStates };
                });
                throw error;
              }
            }
            // Convert array to string if field type expects string (e.g., Product.image)
            // Check if the field is multi-image but the type is string
            if (f.type === "multi-image" && urls.length > 0) {
              // Store as JSON string if API expects string, or keep as array if it accepts array
              uploadForm[f.name] = (urls.length === 1 ? urls[0] : JSON.stringify(urls)) as unknown as T[keyof T];
            } else {
              uploadForm[f.name] = urls as unknown as T[keyof T];
            }
          } else if (value instanceof File) {
            // Upload single file with progress
            const file = value;
            const stateIndex = currentStates.findIndex(s => 
              s.file === file || (s.file.name === file.name && s.file.size === file.size)
            );
            
            // Update state to uploading
            setUploadStates(prev => {
              const newStates = [...(prev[fieldKey] || [])];
              if (stateIndex !== -1) {
                newStates[stateIndex] = { ...newStates[stateIndex], uploading: true, progress: 0 };
              } else {
                newStates.push({
                  file,
                  preview: URL.createObjectURL(file),
                  progress: 0,
                  uploading: true,
                });
              }
              return { ...prev, [fieldKey]: newStates };
            });

            try {
              const url = await uploadFile(
                file,
                "products",
                (progress: UploadProgress) => {
                  setUploadStates(prev => {
                    const newStates = [...(prev[fieldKey] || [])];
                    const idx = newStates.findIndex(s => 
                      s.file === file || (s.file.name === file.name && s.file.size === file.size)
                    );
                    if (idx !== -1) {
                      newStates[idx] = { ...newStates[idx], progress: progress.percentage };
                    }
                    return { ...prev, [fieldKey]: newStates };
                  });
                }
              );
              uploadForm[f.name] = url as unknown as T[keyof T];

              // Mark as completed
              setUploadStates(prev => {
                const newStates = [...(prev[fieldKey] || [])];
                const idx = newStates.findIndex(s => 
                  s.file === file || (s.file.name === file.name && s.file.size === file.size)
                );
                if (idx !== -1) {
                  newStates[idx] = { ...newStates[idx], uploading: false, progress: 100 };
                }
                return { ...prev, [fieldKey]: newStates };
              });
            } catch (error) {
              setUploadStates(prev => {
                const newStates = [...(prev[fieldKey] || [])];
                const idx = newStates.findIndex(s => 
                  s.file === file || (s.file.name === file.name && s.file.size === file.size)
                );
                if (idx !== -1) {
                  newStates[idx] = { ...newStates[idx], uploading: false, error: "Upload failed" };
                }
                return { ...prev, [fieldKey]: newStates };
              });
              throw error;
            }
          } else if (typeof value === "string") {
            // Already a URL, keep it as is
            uploadForm[f.name] = value as unknown as T[keyof T];
          }
        }
      }

      // For update operations, delete images that were removed
      if (id) {
        // Find images that were in the original but not in the final upload form
        for (const f of fields) {
          if ((f.type === "file" || f.type === "multi-image")) {
            const fieldKey = String(f.name);
            const originalUrls = originalImagesRef.current[fieldKey] || [];
            
            if (originalUrls.length > 0) {
              // Get final URLs from uploadForm
              let finalUrls: string[] = [];
              const finalValue = uploadForm[f.name];
              
              if (finalValue !== undefined && finalValue !== null && finalValue !== "") {
                if (Array.isArray(finalValue)) {
                  finalUrls = finalValue.filter((v): v is string => typeof v === "string");
                } else if (typeof finalValue === "string") {
                  // Try to parse as JSON array
                  try {
                    const parsed = JSON.parse(finalValue);
                    if (Array.isArray(parsed)) {
                      finalUrls = parsed;
                    } else {
                      finalUrls = [finalValue];
                    }
                  } catch {
                    finalUrls = [finalValue];
                  }
                }
              }
              // If finalValue is undefined/null/empty, finalUrls remains empty array
              // which means all original images were removed
              
              // Find URLs that were removed (in original but not in final)
              const removedUrls = originalUrls.filter(url => !finalUrls.includes(url));
              
              // Delete removed images from R2 storage
              if (removedUrls.length > 0) {
                try {
                  await deleteFiles(removedUrls);
                } catch (error) {
                  console.error(`Error deleting removed images for field ${fieldKey}:`, error);
                  // Continue with update even if image deletion fails
                }
              }
            }
          }
        }
        
        await updateItem(id, uploadForm);
        closeAlert();
        await showSuccess(
          "Success!",
          `${entityName} has been ${id ? "updated" : "created"} successfully.`,
          1500
        );
      } else {
        await createItem(uploadForm as Omit<T, "_id">);
        closeAlert();
        await showSuccess(
          "Success!",
          `${entityName} has been created successfully.`,
          1500
        );
      }

      navigate(`/admin/${entityName.toLowerCase()}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      closeAlert();
      const errorMessage = getApiErrorMessage(error, "Failed to submit form. Please try again.");

      await showError("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-8px_rgba(16,24,40,0.10)] md:rounded-3xl ">
      {/* Gradient top rule — the one place the accent lives besides the primary action */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-600 via-sky-500 to-blue-600" />

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3 md:mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-md shadow-blue-600/20 md:h-12 md:w-12">
            {id ? <FileEdit className="h-5 w-5 md:h-6 md:w-6" /> : <FilePlus2 className="h-5 w-5 md:h-6 md:w-6" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
              {id ? "Edit" : "Add"} {entityName}
            </h1>
            <p className="text-sm text-slate-500">
              {id ? `Update the details for this ${entityName.toLowerCase()}.` : `Fill in the details to create a new ${entityName.toLowerCase()}.`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {fields.map(f => (
              <div key={String(f.name)} className={f.type === "file" || f.type === "multi-image" || f.type === "textarea" ? "md:col-span-2" : ""}>
                <label
                  htmlFor={String(f.name)}
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  {f.label}
                </label>

                {f.type === "select" ? (
                  <div className="relative">
                    <select
                      id={String(f.name)}
                      name={String(f.name)}
                      value={(form[f.name] as string) || ""}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 md:text-base"
                      disabled={f.readOnly}
                    >
                      <option value="">Select {f.label}</option>
                      {extraSelectOptions?.[f.name]?.map((opt, idx) => (
                        <option key={idx} value={opt.name}>{opt.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    id={String(f.name)}
                    name={String(f.name)}
                    value={(form[f.name] as string) || ""}
                    onChange={handleChange}
                    className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 md:text-base"
                    readOnly={f.readOnly}
                  />
                ) : f.type === "file" || f.type === "multi-image" ? (
                  <div>
                    <div
                      onDragOver={(e) => handleDragOver(e, f)}
                      onDragLeave={(e) => handleDragLeave(e, f)}
                      onDrop={(e) => handleDrop(e, f)}
                      className={`relative overflow-hidden rounded-xl border-2 border-dashed p-6 transition-all duration-150 md:p-8 ${
                        isDragging[String(f.name)]
                          ? "border-teal-500 bg-teal-50/60 ring-4 ring-teal-500/10"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                      } ${f.readOnly ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      onClick={() => {
                        if (!f.readOnly && fileInputRefs.current[String(f.name)]) {
                          fileInputRefs.current[String(f.name)]?.click();
                        }
                      }}
                    >
                      <input
                        ref={(el) => {
                          fileInputRefs.current[String(f.name)] = el;
                        }}
                        type="file"
                        name={String(f.name)}
                        onChange={(e) => handleFileChange(e, f)}
                        className="hidden"
                        multiple={f.multiple}
                        accept={f.accept || "image/*"}
                        disabled={f.readOnly}
                      />
                      <div className="text-center">
                        <div
                          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br transition-colors duration-150 ${
                            isDragging[String(f.name)]
                              ? "from-teal-600 to-blue-600 text-white"
                              : "from-slate-100 to-slate-100 text-slate-400"
                          }`}
                        >
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div className="mt-3 flex justify-center text-sm leading-6 text-slate-700">
                          <span className="font-semibold text-teal-700">Upload {f.multiple ? "files" : "a file"}</span>
                          <p className="pl-1 text-slate-500">or drag and drop</p>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-slate-400">
                          {f.accept || "Images"} up to {f.maxFileSize || 10}MB
                          {f.multiple && f.maxFiles && ` · max ${f.maxFiles} files`}
                        </p>
                      </div>
                    </div>

                    {errors[String(f.name)] && (
                      <p className="mt-2 text-sm text-red-600">{errors[String(f.name)]}</p>
                    )}

                    {uploadStates[String(f.name)] && uploadStates[String(f.name)].length > 0 && (
                      <div className="mt-4 space-y-2.5">
                        {uploadStates[String(f.name)].map((uploadState, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-150 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 md:h-20 md:w-20">
                                <img
                                  src={uploadState.preview}
                                  alt="preview"
                                  className="h-full w-full object-cover"
                                />
                                {!f.readOnly && (
                                  <button
                                    type="button"
                                    onClick={() => removePreview(f.name, idx)}
                                    aria-label="Remove file"
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white transition-transform duration-150 hover:bg-red-600 active:scale-90"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {uploadState.file.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {formatFileSize(uploadState.file.size)}
                                </p>
                                {uploadState.uploading && (
                                  <div className="mt-2">
                                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                                      <span className="inline-flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                                        Uploading
                                      </span>
                                      <span className="font-medium text-slate-700">{uploadState.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                      <div
                                        className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                                        style={{ width: `${uploadState.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                {uploadState.error && (
                                  <p className="mt-1 text-xs text-red-600">{uploadState.error}</p>
                                )}
                                {!uploadState.uploading && uploadState.progress === 100 && (
                                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Uploaded
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    id={String(f.name)}
                    type={f.type || "text"}
                    name={String(f.name)}
                    value={(form[f.name] as string) || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-150 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 md:text-base"
                    readOnly={f.readOnly}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none sm:w-auto md:text-base"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Uploading..." : id ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CRUDForm;