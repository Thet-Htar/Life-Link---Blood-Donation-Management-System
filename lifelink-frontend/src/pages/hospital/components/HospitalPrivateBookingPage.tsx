import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import {
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Droplet,
  FileText,
  LoaderCircle,
  RefreshCcw,
  Search,
  TriangleAlert,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import type {
  PrivateDonationBookingResponse,
  PrivateDonationBookingStatus,
} from "@/types/privateDonationBooking";
import {
  completePrivateDonationBooking,
  confirmPrivateDonationBooking,
  deferPrivateDonationBooking,
  getHospitalPrivateDonationBookings,
  markPrivateDonationBookingNoShow,
} from "@/services/hospital/privateDonationBookingService";
import AlertModal from "@/pages/alertModel";

type BookingFilter = "ALL" | PrivateDonationBookingStatus;

type BookingAction = "CONFIRM" | "COMPLETE" | "NO_SHOW" | "DEFER";

interface ActionDialogState {
  action: BookingAction;
  booking: PrivateDonationBookingResponse;
}

const FILTER_OPTIONS: Array<{
  value: BookingFilter;
  label: string;
}> = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "NO_SHOW",
    label: "No Show",
  },
  {
    value: "DEFERRED",
    label: "Deferred",
  },
];

const HospitalPrivateBookingsPage = () => {
  const [bookings, setBookings] = useState<PrivateDonationBookingResponse[]>(
    [],
  );

  const [filter, setFilter] = useState<BookingFilter>("ALL");

  const [searchValue, setSearchValue] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [pageError, setPageError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [processingBookingId, setProcessingBookingId] = useState<number | null>(
    null,
  );

  const [dialog, setDialog] = useState<ActionDialogState | null>(null);

  const [actionNote, setActionNote] = useState("");

  const [deferralReason, setDeferralReason] = useState("");

  const loadBookings = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setPageError("");

      const response = await getHospitalPrivateDonationBookings();
      console.log(response);

      setBookings(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Unable to load hospital private bookings:", error);

      setBookings([]);

      setPageError(
        getApiErrorMessage(error, "Unable to load private donation bookings."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

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

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesFilter = filter === "ALL" || booking.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        booking.donorName,
        booking.donorCode,
        booking.donorEmail,
        booking.bloodType,
        booking.bookingDate,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [bookings, filter, searchValue]);

  const statusCounts = useMemo(() => {
    return bookings.reduce(
      (counts, booking) => {
        counts[booking.status] += 1;
        return counts;
      },
      {
        PENDING: 0,
        CONFIRMED: 0,
        COMPLETED: 0,
        NO_SHOW: 0,
        DEFERRED: 0,
      } satisfies Record<PrivateDonationBookingStatus, number>,
    );
  }, [bookings]);

  const openActionDialog = (
    action: BookingAction,
    booking: PrivateDonationBookingResponse,
  ): void => {
    setActionNote("");
    setDeferralReason("");

    setDialog({
      action,
      booking,
    });
  };

  const closeActionDialog = (): void => {
    if (processingBookingId !== null) {
      return;
    }

    setDialog(null);
    setActionNote("");
    setDeferralReason("");
  };

  const replaceBooking = (
    updatedBooking: PrivateDonationBookingResponse,
  ): void => {
    setBookings((current) =>
      current.map((booking) =>
        booking.bookingId === updatedBooking.bookingId
          ? updatedBooking
          : booking,
      ),
    );
  };

  const handleActionSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!dialog) {
      return;
    }

    if (dialog.action === "DEFER" && !deferralReason.trim()) {
      setPageError("A deferral reason is required.");
      return;
    }

    const { booking, action } = dialog;

    try {
      setProcessingBookingId(booking.bookingId);

      setPageError("");
      setSuccessMessage("");

      let updatedBooking: PrivateDonationBookingResponse;

      switch (action) {
        case "CONFIRM":
          updatedBooking = await confirmPrivateDonationBooking(
            booking.bookingId,
            {
              hospitalNote: actionNote.trim() || null,
            },
          );
          break;

        case "COMPLETE":
          updatedBooking = await completePrivateDonationBooking(
            booking.bookingId,
            {
              outcomeNote: actionNote.trim() || null,
            },
          );
          break;

        case "NO_SHOW":
          updatedBooking = await markPrivateDonationBookingNoShow(
            booking.bookingId,
          );
          break;

        case "DEFER":
          updatedBooking = await deferPrivateDonationBooking(
            booking.bookingId,
            {
              reason: deferralReason.trim(),
              note: actionNote.trim() || null,
            },
          );
          break;
      }

      replaceBooking(updatedBooking);

      setSuccessMessage(
        getActionSuccessMessage(action, updatedBooking.donorName),
      );

      setDialog(null);
      setActionNote("");
      setDeferralReason("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Booking action status:", error.response?.status);

        console.log("Booking action response:", error.response?.data);
      }

      console.error("Private booking action failed:", error);
      setPageError(
        getApiErrorMessage(error, "Unable to update the private booking."),
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  if (isLoading) {
    return <BookingLoadingState />;
  }

  return (
    <div className="space-y-5">
      <BookingPageHeader
        totalBookings={bookings.length}
        pendingBookings={statusCounts.PENDING}
        confirmedBookings={statusCounts.CONFIRMED}
        onRefresh={() => void loadBookings()}
      />

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <p className="text-xs font-bold text-emerald-800">{successMessage}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search donor name, code or blood type..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <p className="text-[10px] font-bold text-slate-400">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3">
          {FILTER_OPTIONS.map((option) => {
            const selected = filter === option.value;

            const count =
              option.value === "ALL"
                ? bookings.length
                : statusCounts[option.value];

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black transition ${
                  selected
                    ? "bg-red-600 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                {option.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                    selected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyBookingsState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Donor</TableHeading>

                  <TableHeading>Appointment</TableHeading>

                  <TableHeading>Status</TableHeading>

                  <TableHeading>Donor note</TableHeading>

                  <TableHeading>Actions</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <BookingTableRow
                    key={booking.bookingId}
                    booking={booking}
                    processing={processingBookingId === booking.bookingId}
                    onAction={openActionDialog}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dialog && (
        <BookingActionDialog
          dialog={dialog}
          actionNote={actionNote}
          deferralReason={deferralReason}
          isSubmitting={processingBookingId === dialog.booking.bookingId}
          onActionNoteChange={setActionNote}
          onDeferralReasonChange={setDeferralReason}
          onClose={closeActionDialog}
          onSubmit={handleActionSubmit}
        />
      )}
      <AlertModal
        open={Boolean(pageError)}
        type="error"
        title="Booking Operation Failed"
        message={pageError}
        buttonLabel="Close"
        onClose={() => setPageError("")}
      />
    </div>
  );
};

const BookingTableRow = ({
  booking,
  processing,
  onAction,
}: {
  booking: PrivateDonationBookingResponse;
  processing: boolean;
  onAction: (
    action: BookingAction,
    booking: PrivateDonationBookingResponse,
  ) => void;
}) => {
  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4 align-top">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <UserRound className="h-5 w-5" />
          </span>

          <div>
            <p className="text-xs font-black text-slate-900">
              {booking.donorName}
            </p>

            <p className="mt-1 text-[9px] font-bold text-slate-500">
              {booking.donorCode}
            </p>

            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-700">
              <Droplet className="h-3 w-3 fill-current" />

              {formatBloodType(booking.bloodType)}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 align-top">
        <p className="text-xs font-black text-slate-800">
          {formatDisplayDate(booking.bookingDate)}
        </p>

        <p className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-slate-500">
          <Clock3 className="h-3 w-3" />
          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
        </p>
      </td>

      <td className="px-5 py-4 align-top">
        <StatusBadge status={booking.status} />
      </td>

      <td className="max-w-[260px] px-5 py-4 align-top">
        {booking.donorNote ? (
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

            <p className="line-clamp-3 text-[9px] font-medium leading-5 text-slate-500">
              {booking.donorNote}
            </p>
          </div>
        ) : (
          <span className="text-[9px] font-medium text-slate-400">
            No donor note
          </span>
        )}
      </td>

      <td className="px-5 py-4 align-top">
        <BookingActions
          booking={booking}
          processing={processing}
          onAction={onAction}
        />
      </td>
    </tr>
  );
};

const BookingActions = ({
  booking,
  processing,
  onAction,
}: {
  booking: PrivateDonationBookingResponse;
  processing: boolean;
  onAction: (
    action: BookingAction,
    booking: PrivateDonationBookingResponse,
  ) => void;
}) => {
  if (processing) {
    return (
      <span className="inline-flex items-center gap-2 text-[9px] font-bold text-slate-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Processing
      </span>
    );
  }

  if (booking.status === "PENDING") {
    return (
      <button
        type="button"
        onClick={() => onAction("CONFIRM", booking)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-[9px] font-black text-white transition hover:bg-red-700"
      >
        <Check className="h-3.5 w-3.5" />
        Confirm
      </button>
    );
  }

  if (booking.status === "CONFIRMED") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction("COMPLETE", booking)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-[8px] font-black text-white transition hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete
        </button>

        <button
          type="button"
          onClick={() => onAction("NO_SHOW", booking)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-black text-slate-600 transition hover:bg-slate-100"
        >
          <XCircle className="h-3.5 w-3.5" />
          No Show
        </button>

        <button
          type="button"
          onClick={() => onAction("DEFER", booking)}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 text-[8px] font-black text-amber-700 transition hover:bg-amber-100"
        >
          <Clock3 className="h-3.5 w-3.5" />
          Defer
        </button>
      </div>
    );
  }

  return (
    <span className="text-[9px] font-bold text-slate-400">
      No actions available
    </span>
  );
};

const BookingActionDialog = ({
  dialog,
  actionNote,
  deferralReason,
  isSubmitting,
  onActionNoteChange,
  onDeferralReasonChange,
  onClose,
  onSubmit,
}: {
  dialog: ActionDialogState;
  actionNote: string;
  deferralReason: string;
  isSubmitting: boolean;
  onActionNoteChange: (value: string) => void;
  onDeferralReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) => {
  const configuration = getActionDialogConfiguration(dialog.action);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0"
      />

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-950">
              {configuration.title}
            </p>

            <p className="mt-1 text-[10px] font-medium leading-5 text-slate-500">
              {configuration.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="text-xs font-black text-slate-900">
            {dialog.booking.donorName}
          </p>

          <p className="mt-1 text-[9px] font-medium text-slate-500">
            {formatDisplayDate(dialog.booking.bookingDate)} ·{" "}
            {formatTime(dialog.booking.startTime)} –{" "}
            {formatTime(dialog.booking.endTime)}
          </p>
        </div>

        {dialog.action === "DEFER" && (
          <div className="mt-4">
            <label
              htmlFor="deferralReason"
              className="text-[10px] font-black uppercase tracking-wider text-slate-500"
            >
              Deferral reason
            </label>

            <input
              id="deferralReason"
              type="text"
              required
              maxLength={500}
              value={deferralReason}
              onChange={(event) => onDeferralReasonChange(event.target.value)}
              placeholder="Enter the reason for deferral"
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
          </div>
        )}

        {dialog.action !== "NO_SHOW" && (
          <div className="mt-4">
            <label
              htmlFor="actionNote"
              className="text-[10px] font-black uppercase tracking-wider text-slate-500"
            >
              {configuration.noteLabel}
            </label>

            <textarea
              id="actionNote"
              rows={4}
              maxLength={500}
              value={actionNote}
              onChange={(event) => onActionNoteChange(event.target.value)}
              placeholder={configuration.notePlaceholder}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-xs font-medium outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
          </div>
        )}

        {dialog.action === "NO_SHOW" && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-bold leading-5 text-amber-800">
              This booking will be permanently marked as no-show. No
              cancellation reason is required.
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${configuration.buttonClassName}`}
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}

            {isSubmitting ? "Processing..." : configuration.buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

const BookingPageHeader = ({
  totalBookings,
  pendingBookings,
  confirmedBookings,
  onRefresh,
}: {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  onRefresh: () => void;
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
              <CalendarClock className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                Donor appointments
              </p>

              <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                Private Donation Bookings
              </h2>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-xs font-medium leading-5 text-slate-500">
            Confirm donor appointments and record their final donation outcome.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryItem label="Total bookings" value={totalBookings} />

        <SummaryItem label="Waiting confirmation" value={pendingBookings} />

        <SummaryItem label="Confirmed" value={confirmedBookings} />
      </div>
    </section>
  );
};

const SummaryItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: PrivateDonationBookingStatus }) => {
  const styles: Record<PrivateDonationBookingStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    NO_SHOW: "bg-slate-200 text-slate-700",
    DEFERRED: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wide ${styles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
};

const TableHeading = ({ children }: { children: React.ReactNode }) => {
  return (
    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
      {children}
    </th>
  );
};

const EmptyBookingsState = () => {
  return (
    <div className="flex min-h-[340px] items-center justify-center p-8 text-center">
      <div>
        <CalendarClock className="mx-auto h-10 w-10 text-slate-300" />

        <p className="mt-4 text-sm font-black text-slate-800">
          No private bookings found
        </p>

        <p className="mt-2 text-[10px] font-medium text-slate-500">
          New donor booking requests will appear here.
        </p>
      </div>
    </div>
  );
};

const BookingLoadingState = () => {
  return (
    <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-600" />

        <p className="mt-3 text-xs font-bold text-slate-500">
          Loading private bookings...
        </p>
      </div>
    </div>
  );
};

const getActionDialogConfiguration = (action: BookingAction) => {
  switch (action) {
    case "CONFIRM":
      return {
        title: "Confirm Booking",
        description: "Confirm this donor appointment.",
        noteLabel: "Hospital note",
        notePlaceholder: "Example: Please arrive 15 minutes early.",
        buttonLabel: "Confirm Booking",
        buttonClassName: "bg-red-600 hover:bg-red-700",
      };

    case "COMPLETE":
      return {
        title: "Complete Donation",
        description: "Record this booking as a completed donation.",
        noteLabel: "Outcome note",
        notePlaceholder: "Optional donation outcome information.",
        buttonLabel: "Complete Donation",
        buttonClassName: "bg-emerald-600 hover:bg-emerald-700",
      };

    case "NO_SHOW":
      return {
        title: "Mark as No Show",
        description: "Use this when the confirmed donor did not attend.",
        noteLabel: "",
        notePlaceholder: "",
        buttonLabel: "Mark No Show",
        buttonClassName: "bg-slate-700 hover:bg-slate-800",
      };

    case "DEFER":
      return {
        title: "Defer Donation",
        description: "Record that the donation could not continue.",
        noteLabel: "Additional note",
        notePlaceholder: "Optional additional information.",
        buttonLabel: "Defer Donation",
        buttonClassName: "bg-amber-600 hover:bg-amber-700",
      };
  }
};

const getActionSuccessMessage = (
  action: BookingAction,
  donorName: string,
): string => {
  switch (action) {
    case "CONFIRM":
      return `${donorName}'s booking was confirmed.`;

    case "COMPLETE":
      return `${donorName}'s donation was completed.`;

    case "NO_SHOW":
      return `${donorName}'s booking was marked as no-show.`;

    case "DEFER":
      return `${donorName}'s donation was deferred.`;
  }
};

const formatStatus = (status?: PrivateDonationBookingStatus | null): string => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatBloodType = (bloodType?: string | null): string => {
  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return bloodType ? (labels[bloodType] ?? bloodType) : "--";
};

const formatDisplayDate = (dateValue: string): string => {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (timeValue: string): string => {
  if (!timeValue) {
    return "--";
  }

  const [hoursValue, minutesValue] = timeValue.split(":");

  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data as
    | {
        detail?: string;
        message?: string;
        error?: string;
      }
    | undefined;

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    fallbackMessage
  );
};

export default HospitalPrivateBookingsPage;
