import { useEffect, useState } from "react";
import CRUDForm, { type FieldConfig } from "../../components/CRUDForm";
import { createProduct, updateProduct, getProductById } from "../../services/productService";
import { getCategories } from "../../services/categoryService"; // fetch categories
import type { Product } from "../../types/product";

const fields: FieldConfig<Product>[] = [
  { name: "category", label: "Category", type: "select" },
  { name: "product", label: "Product Name" },
  { name: "key", label: "Product Key", readOnly: true },
  { name: "caption", label: "Caption", type: "textarea" },
  { 
    name: "image", 
    label: "Image", 
    type: "multi-image", 
    accept: "image/*", 
    multiple: true,
    maxFileSize: 10, // 10MB max file size
    maxFiles: 10 // Maximum 10 images
  },
];

const ProductForm = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories(); 
        setCategories(data.map(cat => ({ id: cat._id, name: cat.name })));
      } catch (error: unknown) {
        console.error("Failed to fetch categories:", error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: unknown; status?: number } };
          console.error("Error details:", {
            status: axiosError.response?.status,
            data: axiosError.response?.data,
          });
        }
        // Set empty array as fallback
        setCategories([]);
      }
    })();
  }, []);

  // Auto-generate key when typing product name
  const handleFieldChange = (
    field: keyof Product,
    value: string | File | File[],
    form: Partial<Product>
  ): Partial<Product> => {
    if (field === "product" && typeof value === "string") {
      form.key = value.toLowerCase().replace(/\s+/g, "-");
    }
    return form;
  };

  return (
    <CRUDForm<Product>
      fetchItem={getProductById}
      createItem={createProduct}
      updateItem={updateProduct}
      fields={fields}
      entityName="Product"
      onChangeField={handleFieldChange}
      extraSelectOptions={{ category: categories }} // pass categories for select field
    />
  );
};

export default ProductForm;
