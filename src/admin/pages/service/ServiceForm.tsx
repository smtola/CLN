import CRUDForm, { type FieldConfig } from "../../components/CRUDForm";
import { createService, updateService, getServiceById } from "../../services/serviceService";
import type { ServiceItem } from "../../types/service";

const fields: FieldConfig<ServiceItem>[] = [
  { name: "title", label: "Service Title" },
  { name: "key", label: "Service Key (used in URL tab param)" },
  {
    name: "description",
    label: "Description",
    type: "textarea",
  },
  {
    name: "image",
    label: "Image",
    type: "file",
    accept: "image/*",
    maxFileSize: 10,
  },
];

const ServiceForm = () => {
  const handleFieldChange = (
    field: keyof ServiceItem,
    value: string | File | File[],
    form: Partial<ServiceItem>
  ): Partial<ServiceItem> => {
    if (field === "title" && typeof value === "string" && !form.key) {
      form.key = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    return form;
  };

  return (
    <CRUDForm<ServiceItem>
      fetchItem={getServiceById}
      createItem={createService}
      updateItem={updateService}
      fields={fields}
      entityName="Service"
      onChangeField={handleFieldChange}
    />
  );
};

export default ServiceForm;
