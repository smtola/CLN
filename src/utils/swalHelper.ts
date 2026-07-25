import Swal from "sweetalert2";

/**
 * Show a success alert
 */
export const showSuccess = (title: string, message?: string, timer?: number) => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: timer || 2000,
    showConfirmButton: false,
  });
};

/**
 * Show an error alert
 */
export const showError = (title: string, message?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#ef4444",
  });
};

/**
 * Show a warning alert
 */
export const showWarning = (title: string, message?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonColor: "#f59e0b",
  });
};

/**
 * Show an info alert
 */
export const showInfo = (title: string, message?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text: message,
  });
};

/**
 * Show a confirmation dialog for delete operations
 */
export const confirmDelete = async (
  title: string = "Are you sure?",
  message: string = "You won't be able to revert this!",
  confirmText: string = "Yes, delete it!",
  cancelText: string = "Cancel"
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
};

/**
 * Show a confirmation dialog for update operations
 */
export const confirmUpdate = async (
  title: string = "Save changes?",
  message: string = "Are you sure you want to save these changes?",
  confirmText: string = "Yes, save it!",
  cancelText: string = "Cancel"
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  return result.isConfirmed;
};

/**
 * Show a loading alert
 */
export const showLoading = (title: string = "Loading...") => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close the current alert
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Normalize any backend error shape (axios error, fetch Response body, plain Error, string)
 * into a single human-readable message. Handles the various shapes used across this codebase:
 *  - { message: string }
 *  - { msg: string }
 *  - { error: string }
 *  - { errors: [{ msg | message }] }
 *  - { errors: { field: [messages] } } (marshmallow-style)
 *  - plain string / Error instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getApiErrorMessage = (err: any, fallback = "Something went wrong. Please try again."): string => {
  if (!err) return fallback;

  // Axios error with a response body
  const data = err?.response?.data ?? err?.data ?? err;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    if (data.status === 422 || err?.response?.status === 422) {
      if (Array.isArray(data.errors)) {
        const msgs = data.errors
          .map((e: { msg?: string; message?: string }) => e.msg || e.message || "")
          .filter(Boolean);
        if (msgs.length) return msgs.join(", ");
      } else if (data.errors && typeof data.errors === "object") {
        const msgs = Object.values(data.errors).flat().filter(Boolean);
        if (msgs.length) return (msgs as string[]).join(", ");
      }
    }

    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.msg === "string" && data.msg) return data.msg;
    if (typeof data.error === "string" && data.error) return data.error;

    if (Array.isArray(data.errors) && data.errors.length) {
      const msgs = data.errors
        .map((e: { msg?: string; message?: string } | string) =>
          typeof e === "string" ? e : e.msg || e.message || ""
        )
        .filter(Boolean);
      if (msgs.length) return msgs.join(", ");
    }
  }

  if (err instanceof Error && err.message) return err.message;

  // Network-level failure (no response received)
  if (err?.request && !err?.response) return "Unable to connect to the server. Please check your connection.";

  return fallback;
};

/**
 * Show a toast for a caught error using the normalized message. Convenience wrapper
 * around getApiErrorMessage + showError for consistent "any action/error from backend" toasts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notifyApiError = (err: any, title = "Error", fallback?: string) => {
  return showError(title, getApiErrorMessage(err, fallback));
};
