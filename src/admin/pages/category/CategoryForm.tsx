import CRUDForm from "../../components/CRUDForm";
import { getCategoryById, createCategory, updateCategory } from "../../services/categoryService";
import type { Category } from "../../types/category";

const fields: { name: keyof Category; label: string }[] = [
  { name: "name", label: "Category Name" }
];

const CategoryForm = () => (
  <div className="p-3 md:p-6">
    <CRUDForm<Category>
      fetchItem={getCategoryById}    // fetch single category by id
      createItem={createCategory}    // create new category
      updateItem={updateCategory}    // update category
      fields={fields}
      entityName="Category"
    />
  </div>
);

export default CategoryForm;
