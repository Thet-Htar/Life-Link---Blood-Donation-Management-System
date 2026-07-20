import { useEffect, type ReactNode } from "react";

import {
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";

export type AlertModalType = "error" | "success" | "warning" | "info";

interface AlertModalProps {
  open: boolean;

  type?: AlertModalType;

  title: string;

  message: string;

  /*
   * Normal alert mode
   */
  buttonLabel?: string;

  /*
   * Confirmation mode
   */
  confirmLabel?: string;

  cancelLabel?: string;

  isConfirming?: boolean;

  onConfirm?: () => void | Promise<void>;

  footer?: ReactNode;

  closeOnBackdrop?: boolean;

  onClose: () => void;
}

const modalStyles: Record<
  AlertModalType,
  {
    iconContainer: string;

    messageContainer: string;

    messageText: string;

    button: string;

    secondaryButton: string;

    eyebrow: string;
  }
> = {
  error: {
    iconContainer: "bg-red-600 text-white shadow-red-600/25",

    messageContainer: "border-red-100 bg-red-50",

    messageText: "text-red-800",

    button: "bg-red-600 shadow-red-600/20 hover:bg-red-700 focus:ring-red-200",

    secondaryButton:
      "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",

    eyebrow: "text-red-600",
  },

  success: {
    iconContainer: "bg-emerald-600 text-white shadow-emerald-600/25",

    messageContainer: "border-emerald-100 bg-emerald-50",

    messageText: "text-emerald-800",

    button:
      "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700 focus:ring-emerald-200",

    secondaryButton:
      "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",

    eyebrow: "text-emerald-600",
  },

  warning: {
    iconContainer: "bg-amber-500 text-white shadow-amber-500/25",

    messageContainer: "border-amber-100 bg-amber-50",

    messageText: "text-amber-800",

    button:
      "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600 focus:ring-amber-200",

    secondaryButton:
      "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",

    eyebrow: "text-amber-600",
  },

  info: {
    iconContainer: "bg-blue-600 text-white shadow-blue-600/25",

    messageContainer: "border-blue-100 bg-blue-50",

    messageText: "text-blue-800",

    button:
      "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 focus:ring-blue-200",

    secondaryButton:
      "border-slate-200 bg-white text-slate-600 hover:bg-slate-100",

    eyebrow: "text-blue-600",
  },
};

const AlertIcon = ({ type }: { type: AlertModalType }) => {
  const iconClassName = "h-8 w-8";

  switch (type) {
    case "success":
      return <CheckCircle2 className={iconClassName} strokeWidth={2.6} />;

    case "warning":
      return <CircleAlert className={iconClassName} strokeWidth={2.6} />;

    case "info":
      return <Info className={iconClassName} strokeWidth={2.6} />;

    case "error":
    default:
      return <TriangleAlert className={iconClassName} strokeWidth={2.6} />;
  }
};

const AlertModal = ({
  open,

  type = "error",

  title,

  message,

  buttonLabel = "Close",

  confirmLabel = "Confirm",

  cancelLabel = "Cancel",

  isConfirming = false,

  onConfirm,

  footer,

  closeOnBackdrop = true,

  onClose,
}: AlertModalProps) => {
  const isConfirmation = typeof onConfirm === "function";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !isConfirming) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isConfirming, onClose]);

  if (!open) {
    return null;
  }

  const styles = modalStyles[type];

  const handleConfirm = async (): Promise<void> => {
    if (!onConfirm || isConfirming) {
      return;
    }

    await onConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-message"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          !isConfirming &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white p-6 text-center shadow-[0_30px_100px_-30px_rgba(15,23,42,0.85)] sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-slate-50" />

        <div className="pointer-events-none absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-slate-50" />

        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${styles.iconContainer}`}
          >
            <AlertIcon type={type} />
          </div>

          {isConfirmation && (
            <p
              className={`mt-5 text-[11px] font-black uppercase tracking-[0.16em] ${styles.eyebrow}`}
            >
              Confirmation required
            </p>
          )}

          <h2
            id="alert-modal-title"
            className={`text-2xl font-black tracking-[-0.04em] text-slate-950 ${
              isConfirmation ? "mt-1.5" : "mt-5"
            }`}
          >
            {title}
          </h2>

          <div
            className={`mt-5 rounded-2xl border px-4 py-4 ${styles.messageContainer}`}
          >
            <p
              id="alert-modal-message"
              className={`break-words text-sm font-bold leading-6 ${styles.messageText}`}
            >
              {message}
            </p>
          </div>

          {isConfirmation ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isConfirming}
                className={`inline-flex h-12 items-center justify-center rounded-xl border px-5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.secondaryButton}`}
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isConfirming}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${styles.button}`}
              >
                {isConfirming && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {isConfirming ? "Processing..." : confirmLabel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 ${styles.button}`}
            >
              {buttonLabel}
            </button>
          )}

          {footer ?? (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              LifeLink notification
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
