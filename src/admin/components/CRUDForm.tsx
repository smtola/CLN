import React, { useEffect, useState, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile, type UploadProgress, deleteFiles } from "../services/s3Service";
import { showError, showSuccess, showLoading, closeAlert } from "../utils/swalHelper";

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
  createItem: (data: Omit<T, "id">) => Promise<T>;
  updateItem: (id: string, data: Partial<T>) => Promise<T>;
  fields: FieldConfig<T>[];
  entityName: string;
  onChangeField?: (field: keyof T, value: string | File | File[], form: Partial<T>) => Partial<T>;
  extraSelectOptions?: { [key in keyof T]?: { id: string; name: string }[] };
}

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
        const processedData = { ...data };
        
        // Convert string image fields to arrays for multi-image fields
        fields.forEach(f => {
          if (f.type === "multi-image" && processedData[f.name]) {
            const value = processedData[f.name];
            if (typeof value === "string") {
              try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                  (processedData as Record<string, unknown>)[f.name as string] = parsed;
                } else {
                  (processedData as Record<string, unknown>)[f.name as string] = [value];
                }
              } catch {
                (processedData as Record<string, unknown>)[f.name as string] = [value];
              }
            }
          }
        });
        
        setForm(processedData);

        // If there are existing images (URL strings), set as previews
        // Also store original URLs to track which images were removed during update
        fields.forEach(f => {
          const value = processedData[f.name];
          if ((f.type === "file" || f.type === "multi-image") && value) {
            const fieldKey = String(f.name);
            let originalUrls: string[] = [];
            
            if (Array.isArray(value)) {
              originalUrls = value as string[];
              // Existing URLs - create upload states for display
              setUploadStates(prev => ({
                ...prev,
                [fieldKey]: originalUrls.map((url, idx) => ({
                  file: new File([], `existing-${idx}.jpg`), // Placeholder file
                  preview: url,
                  progress: 100,
                  uploading: false,
                })),
              }));
            } else if (typeof value === "string") {
              // Try to parse as JSON array first (for multi-image stored as JSON string)
              try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                  originalUrls = parsed;
                  setUploadStates(prev => ({
                    ...prev,
                    [fieldKey]: parsed.map((url: string, idx: number) => ({
                      file: new File([], `existing-${idx}.jpg`),
                      preview: url,
                      progress: 100,
                      uploading: false,
                    })),
                  }));
                } else {
                  // Single URL string
                  originalUrls = [value];
                  setUploadStates(prev => ({
                    ...prev,
                    [fieldKey]: [{
                      file: new File([], "existing.jpg"),
                      preview: value,
                      progress: 100,
                      uploading: false,
                    }],
                  }));
                }
              } catch {
                // Not JSON, treat as single URL string
                originalUrls = [value];
                setUploadStates(prev => ({
                  ...prev,
                  [fieldKey]: [{
                    file: new File([], "existing.jpg"),
                    preview: value,
                    progress: 100,
                    uploading: false,
                  }],
                }));
              }
            }
            
            // Store original URLs for this field to track deletions
            if (originalUrls.length > 0) {
              originalImagesRef.current[fieldKey] = originalUrls;
            }
          }
        });
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
        await createItem(uploadForm as Omit<T, "id">);
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
      let errorMessage = "Failed to submit form. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      await showError("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 md:p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{id ? "Edit" : "Add"} {entityName}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" encType="multipart/form-data">
        {fields.map(f => (
          <div key={String(f.name)}>
            <label className="block font-medium mb-2 text-sm md:text-base">{f.label}</label>

            {f.type === "select" ? (
              <select
                name={String(f.name)}
                value={(form[f.name] as string) || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={f.readOnly}
              >
                <option value="">Select {f.label}</option>
                {extraSelectOptions?.[f.name]?.map((opt,idx) => (
                  <option key={idx} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                name={String(f.name)}
                value={(form[f.name] as string) || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                readOnly={f.readOnly}
              />
            ) : f.type === "file" || f.type === "multi-image" ? (
              <div>
                <div
                  onDragOver={(e) => handleDragOver(e, f)}
                  onDragLeave={(e) => handleDragLeave(e, f)}
                  onDrop={(e) => handleDrop(e, f)}
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragging[String(f.name)]
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  } ${f.readOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
                        <span>Upload {f.multiple ? "files" : "a file"}</span>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600 mt-2">
                      {f.accept || "Images"} up to {f.maxFileSize || 10}MB
                      {f.multiple && f.maxFiles && ` (max ${f.maxFiles} files)`}
                    </p>
                  </div>
                </div>

                {errors[String(f.name)] && (
                  <p className="mt-2 text-sm text-red-600">{errors[String(f.name)]}</p>
                )}

                {uploadStates[String(f.name)] && uploadStates[String(f.name)].length > 0 && (
                  <div className="mt-4 space-y-3">
                    {uploadStates[String(f.name)].map((uploadState, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                            <img
                              src={uploadState.preview}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            {!f.readOnly && (
                              <button
                                type="button"
                                onClick={() => removePreview(f.name, idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                &times;
                              </button>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {uploadState.file.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(uploadState.file.size)}
                            </p>
                            {uploadState.uploading && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Uploading...</span>
                                  <span>{uploadState.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadState.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {uploadState.error && (
                              <p className="text-xs text-red-600 mt-1">{uploadState.error}</p>
                            )}
                            {!uploadState.uploading && uploadState.progress === 100 && (
                              <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
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
                type={f.type || "text"}
                name={String(f.name)}
                value={(form[f.name] as string) || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                readOnly={f.readOnly}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg transition-colors text-sm md:text-base font-medium"
        >
          {isSubmitting ? "Uploading..." : id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default CRUDForm;
