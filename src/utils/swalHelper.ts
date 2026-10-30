/**
 * Self-contained alert/notification service — no external UI library required.
 * Drop-in replacement for the previous SweetAlert2-based helper: same exported
 * function names and signatures, so nothing else needs to change.
 *
 * - showSuccess / showError / showWarning / showInfo -> toast notifications.
 *   Mobile (<640px): top-center. Tablet & desktop (640px+): top-right.
 * - confirmDelete / confirmUpdate -> centered confirm dialog, resolves a boolean.
 * - showLoading / closeAlert -> centered blocking loading overlay.
 */

type AlertType = "success" | "error" | "warning" | "info";

const STYLE_ID = "cln-alerts-style";
const TOAST_CONTAINER_ID = "cln-toast-container";
const OVERLAY_ROOT_ID = "cln-alert-overlay-root";

let loadingEl: HTMLDivElement | null = null;

/* ---------------------------------- styles --------------------------------- */

const ensureStyles = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .cln-toast-container {
      position: fixed; z-index: 9999; top: 1rem; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      width: calc(100% - 2rem); max-width: 380px; pointer-events: none;
    }
    @media (min-width: 640px) {
      .cln-toast-container {
        left: auto; right: 1rem; transform: none; width: auto; max-width: 360px; align-items: flex-end;
      }
    }

    .cln-toast {
      pointer-events: auto; width: 100%; display: flex; align-items: flex-start; gap: 0.7rem;
      background: #ffffff; border-radius: 0.75rem; border-left: 4px solid var(--cln-accent, #5B975F);
      box-shadow: 0 10px 28px rgba(31, 43, 34, 0.14), 0 2px 6px rgba(31, 43, 34, 0.06);
      padding: 0.85rem 1rem; position: relative; overflow: hidden;
      animation: cln-toast-in 0.22s ease-out; font-family: inherit;
    }
    .cln-toast.cln-toast-leaving { animation: cln-toast-out 0.18s ease-in forwards; }
    .cln-toast-icon { flex-shrink: 0; width: 1.25rem; height: 1.25rem; margin-top: 0.1rem; }
    .cln-toast-body { flex: 1; min-width: 0; }
    .cln-toast-title { font-size: 0.875rem; font-weight: 600; color: #1F2B22; line-height: 1.3; }
    .cln-toast-message { margin-top: 0.15rem; font-size: 0.8125rem; color: #5B6B5E; line-height: 1.4; word-break: break-word; }
    .cln-toast-close {
      flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 0.15rem;
      color: #8A9A8C; border-radius: 9999px; line-height: 0;
    }
    .cln-toast-close:hover { background: #F5F7F4; color: #1F2B22; }
    .cln-toast-bar {
      position: absolute; left: 0; bottom: 0; height: 3px; background: var(--cln-accent, #5B975F);
      opacity: 0.35; animation-name: cln-toast-bar; animation-timing-function: linear; animation-fill-mode: forwards;
    }
    .cln-toast:hover .cln-toast-bar { animation-play-state: paused; }

    @keyframes cln-toast-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cln-toast-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-6px) scale(0.98); } }
    @keyframes cln-toast-bar { from { width: 100%; } to { width: 0%; } }

    .cln-overlay {
      position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;
      background: rgba(31, 43, 34, 0.35); padding: 1rem; animation: cln-fade-in 0.15s ease-out;
    }
    @keyframes cln-fade-in { from { opacity: 0; } to { opacity: 1; } }

    .cln-modal {
      background: #fff; border-radius: 1rem; width: 100%; max-width: 380px; padding: 1.5rem;
      box-shadow: 0 20px 48px rgba(31, 43, 34, 0.2); animation: cln-modal-in 0.18s ease-out;
    }
    @keyframes cln-modal-in { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .cln-modal-icon {
      width: 2.75rem; height: 2.75rem; border-radius: 9999px; display: flex; align-items: center;
      justify-content: center; margin-bottom: 0.9rem;
    }
    .cln-modal-title { font-size: 1.0625rem; font-weight: 600; color: #1F2B22; }
    .cln-modal-message { margin-top: 0.4rem; font-size: 0.875rem; color: #5B6B5E; line-height: 1.5; }
    .cln-modal-actions { margin-top: 1.5rem; display: flex; gap: 0.6rem; justify-content: flex-end; }
    .cln-btn {
      font-size: 0.875rem; font-weight: 500; padding: 0.55rem 1rem; border-radius: 0.5rem;
      cursor: pointer; border: 1px solid transparent; transition: background-color 0.15s, border-color 0.15s;
    }
    .cln-btn-cancel { background: #fff; border-color: #DDE3DC; color: #1F2B22; }
    .cln-btn-cancel:hover { background: #F5F7F4; }
    .cln-btn-confirm { color: #fff; }

    .cln-loading-title { margin-top: 0.9rem; font-size: 0.9375rem; font-weight: 500; color: #1F2B22; text-align: center; }
    .cln-spinner {
      width: 2.25rem; height: 2.25rem; border-radius: 9999px; border: 3px solid #DDE3DC;
      border-top-color: #5B975F; animation: cln-spin 0.7s linear infinite;
    }
    @keyframes cln-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
};

/* --------------------------------- helpers --------------------------------- */

const ACCENTS: Record<AlertType, { color: string; bg: string }> = {
  success: { color: "#3F6B42", bg: "#EAF2EA" },
  error: { color: "#B3261E", bg: "#FBEAEA" },
  warning: { color: "#8A6D22", bg: "#F7F1E1" },
  info: { color: "#3A526B", bg: "#EAF0F5" },
};

const ICON_PATHS: Record<AlertType, string> = {
  success: '<path d="M20 6 9 17l-5-5" />',
  error: '<circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" />',
  warning: '<path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0Z" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" />',
};
const CLOSE_PATH = '<path d="M18 6 6 18M6 6l12 12" />';

const svg = (paths: string, color: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const getToastContainer = () => {
  ensureStyles();
  let el = document.getElementById(TOAST_CONTAINER_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = TOAST_CONTAINER_ID;
    el.className = "cln-toast-container";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  return el;
};

const DEFAULT_DURATIONS: Record<AlertType, number> = {
  success: 2500,
  info: 3500,
  warning: 4500,
  error: 5000,
};

/** duration = 0 keeps the toast on screen until the user dismisses it manually. */
const showToast = (type: AlertType, title: string, message?: string, duration?: number) => {
  const container = getToastContainer();
  const { color } = ACCENTS[type];
  const ms = duration ?? DEFAULT_DURATIONS[type];

  const toast = document.createElement("div");
  toast.className = "cln-toast";
  toast.style.setProperty("--cln-accent", color);
  toast.innerHTML = `
    <span class="cln-toast-icon">${svg(ICON_PATHS[type], color)}</span>
    <div class="cln-toast-body">
      <div class="cln-toast-title"></div>
      ${message ? '<div class="cln-toast-message"></div>' : ""}
    </div>
    <button type="button" class="cln-toast-close" aria-label="Dismiss">${svg(CLOSE_PATH, "#8A9A8C", 14)}</button>
    ${ms > 0 ? '<div class="cln-toast-bar"></div>' : ""}
  `;

  (toast.querySelector(".cln-toast-title") as HTMLDivElement).textContent = title;
  if (message) (toast.querySelector(".cln-toast-message") as HTMLDivElement).textContent = message;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const remove = () => {
    if (timeoutId) clearTimeout(timeoutId);
    toast.classList.add("cln-toast-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };

  toast.querySelector(".cln-toast-close")?.addEventListener("click", remove);

  if (ms > 0) {
    const bar = toast.querySelector(".cln-toast-bar") as HTMLDivElement | null;
    if (bar) bar.style.animationDuration = `${ms}ms`;
    timeoutId = setTimeout(remove, ms);

    // Pause the countdown while the user is reading it
    toast.addEventListener("mouseenter", () => { if (timeoutId) clearTimeout(timeoutId); });
    toast.addEventListener("mouseleave", () => { timeoutId = setTimeout(remove, ms); });
  }

  container.appendChild(toast);
};

/* ------------------------------- public API --------------------------------- */

/** Show a success toast. */
export const showSuccess = (title: string, message?: string, duration?: number) =>
  showToast("success", title, message, duration);

/** Show an error toast. */
export const showError = (title: string, message?: string, duration?: number) =>
  showToast("error", title, message, duration);

/** Show a warning toast. */
export const showWarning = (title: string, message?: string, duration?: number) =>
  showToast("warning", title, message, duration);

/** Show an info toast. */
export const showInfo = (title: string, message?: string, duration?: number) =>
  showToast("info", title, message, duration);

/* --------------------------- confirm dialogs --------------------------- */

const getOverlayRoot = () => {
  ensureStyles();
  let el = document.getElementById(OVERLAY_ROOT_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = OVERLAY_ROOT_ID;
    document.body.appendChild(el);
  }
  return el;
};

const openConfirm = (opts: {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: string;
  type: AlertType;
}): Promise<boolean> => {
  return new Promise((resolve) => {
    const root = getOverlayRoot();
    const { bg, color } = ACCENTS[opts.type];

    const overlay = document.createElement("div");
    overlay.className = "cln-overlay";
    overlay.innerHTML = `
      <div class="cln-modal" role="dialog" aria-modal="true">
        <div class="cln-modal-icon" style="background:${bg}">${svg(ICON_PATHS[opts.type], color, 22)}</div>
        <div class="cln-modal-title"></div>
        <div class="cln-modal-message"></div>
        <div class="cln-modal-actions">
          <button type="button" class="cln-btn cln-btn-cancel"></button>
          <button type="button" class="cln-btn cln-btn-confirm" style="background:${opts.confirmColor}"></button>
        </div>
      </div>
    `;

    (overlay.querySelector(".cln-modal-title") as HTMLDivElement).textContent = opts.title;
    (overlay.querySelector(".cln-modal-message") as HTMLDivElement).textContent = opts.message;
    const cancelBtn = overlay.querySelector(".cln-btn-cancel") as HTMLButtonElement;
    const confirmBtn = overlay.querySelector(".cln-btn-confirm") as HTMLButtonElement;
    cancelBtn.textContent = opts.cancelText;
    confirmBtn.textContent = opts.confirmText;

    const cleanup = (result: boolean) => {
      document.removeEventListener("keydown", onKeyDown);
      overlay.remove();
      resolve(result);
    };
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") cleanup(false); };

    cancelBtn.addEventListener("click", () => cleanup(false));
    confirmBtn.addEventListener("click", () => cleanup(true));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cleanup(false); });
    document.addEventListener("keydown", onKeyDown);

    root.appendChild(overlay);
    confirmBtn.focus();
  });
};

/** Confirmation dialog for delete operations. */
export const confirmDelete = (
  title: string = "Are you sure?",
  message: string = "You won't be able to revert this!",
  confirmText: string = "Yes, delete it!",
  cancelText: string = "Cancel"
): Promise<boolean> =>
  openConfirm({ title, message, confirmText, cancelText, confirmColor: "#B3261E", type: "warning" });

/** Confirmation dialog for update operations. */
export const confirmUpdate = (
  title: string = "Save changes?",
  message: string = "Are you sure you want to save these changes?",
  confirmText: string = "Yes, save it!",
  cancelText: string = "Cancel"
): Promise<boolean> =>
  openConfirm({ title, message, confirmText, cancelText, confirmColor: "#3A526B", type: "info" });

/* ---------------------------- loading overlay ---------------------------- */

/** Show a blocking loading overlay. */
export const showLoading = (title: string = "Loading...") => {
  const root = getOverlayRoot();

  if (loadingEl) {
    (loadingEl.querySelector(".cln-loading-title") as HTMLDivElement).textContent = title;
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "cln-overlay";
  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="cln-spinner"></div>
      <div class="cln-loading-title"></div>
    </div>
  `;
  (overlay.querySelector(".cln-loading-title") as HTMLDivElement).textContent = title;

  root.appendChild(overlay);
  loadingEl = overlay;
};

/** Close the current loading overlay, if any. */
export const closeAlert = () => {
  if (loadingEl) {
    loadingEl.remove();
    loadingEl = null;
  }
};

/* ---------------------- error message normalization ---------------------- */
/* Unchanged from before — pure logic, no UI dependency. */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getApiErrorMessage = (err: any, fallback = "Something went wrong. Please try again."): string => {
  if (!err) return fallback;

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

  if (err?.request && !err?.response) return "Unable to connect to the server. Please check your connection.";

  return fallback;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notifyApiError = (err: any, title = "Error", fallback?: string) => {
  return showError(title, getApiErrorMessage(err, fallback));
};