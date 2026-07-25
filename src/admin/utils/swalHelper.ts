// Re-exports the shared toast/alert helper so all existing admin imports keep working.
// The single source of truth now lives in src/utils/swalHelper.ts so the same
// consistent toast behavior (and API-error normalization) is used app-wide.
export * from "../../utils/swalHelper";
