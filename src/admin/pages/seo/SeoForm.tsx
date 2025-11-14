import CRUDForm, { type FieldConfig } from "../../components/CRUDForm";
import { getSEOById, createSEO, updateSEO } from "../../services/seoService";
import type { SeoMeta } from "../../../types/seo";

const fields: FieldConfig<SeoMeta>[] = [
  { name: "page", label: "Page" },
  { name: "title", label: "Title" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "keywords", label: "Keywords" },
  { name: "ogTitle", label: "OG Title" },
  { name: "ogDescription", label: "OG Description", type: "textarea" },
  { 
    name: "ogImage", 
    label: "OG Image", 
    type: "file", 
    accept: "image/*",
    maxFileSize: 10 // 10MB max file size
  },
  { name: "url", label: "URL" }
];

const SEOForm = () => (
  <CRUDForm<SeoMeta>
    fetchItem={getSEOById}
    createItem={createSEO}
    updateItem={updateSEO}
    fields={fields}
    entityName="SEO"
  />
);

export default SEOForm;
