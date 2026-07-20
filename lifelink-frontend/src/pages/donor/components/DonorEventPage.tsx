import { useCallback, useEffect, useMemo, useState } from "react";

import axios from "axios";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";

import type { DonorEventResponse } from "@/types/donorEvents";

import EventMissionCard, { EventMissionCardSkeleton } from "./EventMissionCard";
import {
  cancelDonorEventRegistration,
  getRecommendedDonorEvents,
  registerDonorForEvent,
} from "@/services/donorServices";

type EventActionType = "REGISTER" | "CANCEL";

interface PendingEventAction {
  type: EventActionType;
  event: DonorEventResponse;
}

interface ApiErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
}

const DonorEventsPage = () => {
  const [events, setEvents] = useState<DonorEventResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");

  const [actionError, setActionError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [pendingAction, setPendingAction] = useState<PendingEventAction | null>(
    null,
  );

  const loadEvents = useCallback(
    async (showInitialLoading = true): Promise<void> => {
      try {
        if (showInitialLoading) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setPageError("");

        const data = await getRecommendedDonorEvents();

        setEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load donor events:", error);

        setPageError(
          getApiErrorMessage(
            error,
            "Unable to load donation events. Please try again.",
          ),
        );
      } finally {
        if (showInitialLoading) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  const openRegisterModal = (event: DonorEventResponse): void => {
    setActionError("");
    setSuccessMessage("");

    setPendingAction({
      type: "REGISTER",
      event,
    });
  };

  const openCancelModal = (event: DonorEventResponse): void => {
    setActionError("");
    setSuccessMessage("");

    setPendingAction({
      type: "CANCEL",
      event,
    });
  };

  const closeActionModal = (): void => {
    if (isSubmitting) {
      return;
    }

    setPendingAction(null);
    setActionError("");
  };

  const confirmEventAction = async (): Promise<void> => {
    if (!pendingAction) {
      return;
    }

    const { type, event } = pendingAction;

    try {
      setIsSubmitting(true);
      setActionError("");

      if (type === "REGISTER") {
        await registerDonorForEvent(event.id);

        setSuccessMessage(`Registration confirmed for "${event.eventTitle}".`);
      } else {
        await cancelDonorEventRegistration(event.id);

        setSuccessMessage(`Registration cancelled for "${event.eventTitle}".`);
      }

      setPendingAction(null);
      await loadEvents(false);
    } catch (error) {
      console.error(
        `${type === "REGISTER" ? "Registration" : "Cancellation"} failed:`,
        error,
      );

      setActionError(
        getApiErrorMessage(
          error,
          type === "REGISTER"
            ? "Unable to register for this event."
            : "Unable to cancel this registration.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      {/* Success message */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-emerald-800">
              Action completed
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-emerald-700">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 transition hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page error */}
      {pageError && events.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

          <div>
            <p className="text-[10px] font-black text-amber-800">
              Events may be out of date
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-amber-700">
              {pageError}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <EventMissionCardSkeleton />
          <EventMissionCardSkeleton />
        </div>
      ) : pageError && events.length === 0 ? (
        <ErrorState
          message={pageError}
          onRetry={() => {
            void loadEvents();
          }}
        />
      ) : events.length === 0 ? (
        <EmptyState
          isRefreshing={isRefreshing}
          onRefresh={() => {
            void loadEvents(false);
          }}
        />
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-2">
          {events.map((event) => (
            <EventMissionCard
              key={event.id}
              event={event}
              isSubmitting={
                isSubmitting && pendingAction?.event.id === event.id
              }
              onRegister={openRegisterModal}
              onCancel={openCancelModal}
            />
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      {pendingAction && (
        <EventConfirmationModal
          action={pendingAction.type}
          event={pendingAction.event}
          isSubmitting={isSubmitting}
          error={actionError}
          onClose={closeActionModal}
          onConfirm={() => {
            void confirmEventAction();
          }}
        />
      )}
    </section>
  );
};

interface EmptyStateProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const EmptyState = ({ isRefreshing, onRefresh }: EmptyStateProps) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <CalendarDays className="h-7 w-7" />
      </span>

      <h2 className="mt-5 text-lg font-black text-slate-950">
        No matching events yet
      </h2>

      <p className="mt-2 max-w-md text-xs font-medium leading-5 text-slate-500">
        There are currently no published donation events matching your blood
        type and registration availability.
      </p>

      <button
        type="button"
        disabled={isRefreshing}
        onClick={onRefresh}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[10px] font-black text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        Check again
      </button>
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="h-7 w-7" />
      </span>

      <h2 className="mt-5 text-lg font-black text-slate-950">
        Events could not be loaded
      </h2>

      <p className="mt-2 max-w-md text-xs font-medium leading-5 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[10px] font-black text-white transition hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
};

interface EventConfirmationModalProps {
  action: EventActionType;
  event: DonorEventResponse;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
}

const EventConfirmationModal = ({
  action,
  event,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}: EventConfirmationModalProps) => {
  const isRegisterAction = action === "REGISTER";

  const location = [event.street, event.township, event.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div
          className={`relative overflow-hidden px-5 py-5 text-white ${
            isRegisterAction
              ? "bg-gradient-to-br from-red-600 to-rose-700"
              : "bg-gradient-to-br from-slate-800 to-slate-950"
          }`}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                {isRegisterAction ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
                  {isRegisterAction
                    ? "Confirm registration"
                    : "Cancel registration"}
                </p>

                <h2
                  id="event-modal-title"
                  className="mt-1 text-lg font-black tracking-tight"
                >
                  {isRegisterAction
                    ? "Reserve your donation slot?"
                    : "Release your reserved slot?"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close modal"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">
              {event.eventTitle}
            </p>

            <div className="mt-3 space-y-1.5 text-[10px] font-medium text-slate-600">
              <p>
                <span className="font-black text-slate-700">Hospital:</span>{" "}
                {event.hospitalName}
              </p>

              <p>
                <span className="font-black text-slate-700">Date:</span>{" "}
                {formatDate(event.eventDate)}
              </p>

              <p>
                <span className="font-black text-slate-700">Time:</span>{" "}
                {formatTime(event.startTime)}
                {" – "}
                {formatTime(event.endTime)}
              </p>

              <p>
                <span className="font-black text-slate-700">Location:</span>{" "}
                {location || "Location not provided"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] font-medium leading-5 text-slate-600">
            {isRegisterAction
              ? "By confirming, a donation slot will be reserved for you. Please attend the event at the scheduled time."
              : "Cancelling will release your reserved slot so another donor can register. You may register again while registration remains open."}
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

              <p className="text-[10px] font-semibold leading-4 text-red-700">
                {error}
              </p>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegisterAction ? "Not now" : "Keep registration"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isRegisterAction
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {isSubmitting
                ? "Processing..."
                : isRegisterAction
                  ? "Confirm registration"
                  : "Cancel registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data as ApiErrorResponse | undefined;

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    fallbackMessage
  );
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatTime = (value?: string | null): string => {
  if (!value) {
    return "--:--";
  }

  const [hours, minutes] = value.split(":");

  const hourNumber = Number(hours);
  const minuteNumber = Number(minutes);

  if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) {
    return value;
  }

  const time = new Date();

  time.setHours(hourNumber, minuteNumber, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
};

export default DonorEventsPage;
