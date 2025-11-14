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

