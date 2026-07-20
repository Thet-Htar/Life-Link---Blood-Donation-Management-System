import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import axios from "axios";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import type {
  CreatePrivateDonationBookingRequest,
  PrivateDonationBookingResponse,
  PrivateDonationBookingStatus,
} from "@/types/privateDonationBooking";
import {
  createPrivateDonationBooking,
  getDonorProfile,
  getMyPrivateDonationBookings,
} from "@/services/donorServices";
import { getPrivateBookingHospitals } from "@/services/hospital/privateDonationBookingService";

interface HospitalOption {
  hospitalId: number;
  hospitalName: string;
  city?: string | null;
  township?: string | null;
  address?: string | null;
}

interface DonorProfileSummary {
  eligible: boolean;
  bloodType?: string | null;
}

interface BookingFormState {
  hospitalId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  donorNote: string;
  eligibilityDeclarationAccepted: boolean;
}

const initialFormState: BookingFormState = {
  hospitalId: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  donorNote: "",
  eligibilityDeclarationAccepted: false,
};

const ACTIVE_STATUSES: PrivateDonationBookingStatus[] = [
  "PENDING",
  "CONFIRMED",
];

const DonorPrivateBookingPage = () => {
  const [profile, setProfile] = useState<DonorProfileSummary | null>(null);

  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);

  const [bookings, setBookings] = useState<PrivateDonationBookingResponse[]>(
    [],
  );

  const [form, setForm] = useState<BookingFormState>(initialFormState);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const minimumBookingDate = useMemo(() => formatDateForInput(new Date()), []);

  const activeBooking = useMemo(
    () =>
      bookings.find((booking) => ACTIVE_STATUSES.includes(booking.status)) ??
      null,
    [bookings],
  );

  const selectedHospital = useMemo(() => {
    const hospitalId = Number(form.hospitalId);

    if (!Number.isInteger(hospitalId)) {
      return null;
    }

    return (
      hospitals.find((hospital) => hospital.hospitalId === hospitalId) ?? null
    );
  }, [form.hospitalId, hospitals]);

  const loadPageData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setPageError("");

      const [profileResponse, hospitalResponse, bookingResponse] =
        await Promise.all([
          getDonorProfile(),
          getPrivateBookingHospitals(),
          getMyPrivateDonationBookings(),
        ]);

      setProfile({
        eligible: Boolean(profileResponse.eligible),
        bloodType: profileResponse.bloodType ?? null,
      });

      setHospitals(Array.isArray(hospitalResponse) ? hospitalResponse : []);

      setBookings(Array.isArray(bookingResponse) ? bookingResponse : []);
    } catch (error) {
      console.error("Unable to load private booking page:", error);

      setPageError(
        getApiErrorMessage(
          error,
          "Unable to load private donation booking information.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async (): Promise<void> => {
    const response = await getMyPrivateDonationBookings();

    setBookings(Array.isArray(response) ? response : []);
  }, []);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

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

  const updateForm = <Key extends keyof BookingFormState>(
    field: Key,
    value: BookingFormState[Key],
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
  };

  const validateForm = (): string | null => {
    if (!profile?.eligible) {
      return "You are not currently eligible to make a donation booking.";
    }

    if (activeBooking) {
      return "You already have an active private donation booking.";
    }

    const hospitalId = Number(form.hospitalId);

    if (!Number.isInteger(hospitalId) || hospitalId <= 0) {
      return "Please select a hospital.";
    }

    if (!form.bookingDate) {
      return "Please select a booking date.";
    }

    if (form.bookingDate < minimumBookingDate) {
      return "Booking date cannot be in the past.";
    }

    if (!form.startTime || !form.endTime) {
      return "Please select the start and end times.";
    }

    if (form.endTime <= form.startTime) {
      return "End time must be later than start time.";
    }

    if (!form.eligibilityDeclarationAccepted) {
      return "You must accept the eligibility declaration.";
    }

    if (form.donorNote.trim().length > 500) {
      return "Donor note must not exceed 500 characters.";
    }

    return null;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const hospitalId = Number(form.hospitalId);

    const request: CreatePrivateDonationBookingRequest = {
      hospitalId,
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      eligibilityDeclarationAccepted: form.eligibilityDeclarationAccepted,
      donorNote: form.donorNote.trim() || null,
    };

    try {
      setIsSubmitting(true);
      setFormError("");
      setSuccessMessage("");

      const createdBooking = await createPrivateDonationBooking(request);

      setSuccessMessage(
        `Your booking with ${createdBooking.hospitalName} was submitted successfully.`,
      );

      setForm(initialFormState);

      await loadBookings();
    } catch (error) {
      console.error("Unable to create private donation booking:", error);

      setFormError(
        getApiErrorMessage(
          error,
          "Unable to create your private donation booking.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <BookingPageLoadingState />;
  }

  if (pageError) {
    return (
      <BookingPageErrorState
        message={pageError}
        onRetry={() => void loadPageData()}
      />
    );
  }

  const formDisabled =
    !profile?.eligible || activeBooking !== null || isSubmitting;

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <p className="text-xs font-bold leading-5 text-emerald-800">
            {successMessage}
          </p>
        </div>
      )}

      {!profile?.eligible && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-xs font-black text-amber-900">
              You are not currently eligible
            </p>

            <p className="mt-1 text-[10px] font-medium leading-5 text-amber-700">
              The booking form is disabled until your donor profile becomes
              eligible again.
            </p>
          </div>
        </div>
      )}

      {activeBooking && <ActiveBookingNotice booking={activeBooking} />}

      <div className="grid items-start gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <BookingFormCard
          form={form}
          hospitals={hospitals}
          selectedHospital={selectedHospital}
          formDisabled={formDisabled}
          isSubmitting={isSubmitting}
          formError={formError}
          minimumBookingDate={minimumBookingDate}
          onUpdate={updateForm}
          onSubmit={handleSubmit}
        />

        <BookingHistoryCard
          bookings={bookings}
          onRefresh={() => void loadBookings()}
        />
      </div>
    </div>
  );
};

interface BookingFormCardProps {
  form: BookingFormState;
  hospitals: HospitalOption[];
  selectedHospital: HospitalOption | null;
  formDisabled: boolean;
  isSubmitting: boolean;
  formError: string;
  minimumBookingDate: string;
  onUpdate: <Key extends keyof BookingFormState>(
    field: Key,
    value: BookingFormState[Key],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

const BookingFormCard = ({
  form,
  hospitals,
  selectedHospital,
  formDisabled,
  isSubmitting,
  formError,
  minimumBookingDate,
  onUpdate,
  onSubmit,
}: BookingFormCardProps) => {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <CalendarClock className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-black text-slate-950">
              New Private Booking
            </p>

            <p className="mt-1 text-[10px] font-medium text-slate-500">
              Schedule a direct donation appointment.
            </p>
          </div>
        </div>
      </header>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="space-y-5 p-5"
      >
        {formError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

            <p className="text-[10px] font-bold leading-5 text-red-700">
              {formError}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="hospitalId"
            className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
          >
            Hospital
          </label>

          <select
            id="hospitalId"
            value={form.hospitalId}
            disabled={formDisabled}
            onChange={(event) => onUpdate("hospitalId", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Select a hospital</option>

            {hospitals.map((hospital) => (
              <option key={hospital.hospitalId} value={hospital.hospitalId}>
                {hospital.hospitalName}
              </option>
            ))}
          </select>

          {hospitals.length === 0 && (
            <p className="mt-2 text-[10px] font-medium text-amber-700">
              No hospitals are currently available for private booking.
            </p>
          )}
        </div>

        {selectedHospital && (
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-3">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

              <div>
                <p className="text-xs font-black text-slate-900">
                  {selectedHospital.hospitalName}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  {formatHospitalLocation(selectedHospital)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="bookingDate"
            className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
          >
            Booking date
          </label>

          <input
            id="bookingDate"
            type="date"
            min={minimumBookingDate}
            value={form.bookingDate}
            disabled={formDisabled}
            onChange={(event) => onUpdate("bookingDate", event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="startTime"
              className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
            >
              Start time
            </label>

            <input
              id="startTime"
              type="time"
              value={form.startTime}
              disabled={formDisabled}
              onChange={(event) => onUpdate("startTime", event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
            >
              End time
            </label>

            <input
              id="endTime"
              type="time"
              value={form.endTime}
              disabled={formDisabled}
              onChange={(event) => onUpdate("endTime", event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="donorNote"
            className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
          >
            Note to hospital
          </label>

          <textarea
            id="donorNote"
            rows={4}
            maxLength={500}
            value={form.donorNote}
            disabled={formDisabled}
            placeholder="Optional information for the hospital..."
            onChange={(event) => onUpdate("donorNote", event.target.value)}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <p className="mt-1 text-right text-[9px] font-medium text-slate-400">
            {form.donorNote.length}/500
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={form.eligibilityDeclarationAccepted}
            disabled={formDisabled}
            onChange={(event) =>
              onUpdate("eligibilityDeclarationAccepted", event.target.checked)
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />

          <span>
            <span className="block text-[11px] font-black text-slate-800">
              Eligibility declaration
            </span>

            <span className="mt-1 block text-[9px] font-medium leading-5 text-slate-500">
              I confirm that the information in my donor profile is accurate. I
              understand that final screening will be completed by the hospital.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={formDisabled || hospitals.length === 0}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CalendarClock className="h-4 w-4" />
              Submit Booking
            </>
          )}
        </button>
      </form>
    </section>
  );
};

const BookingHistoryCard = ({
  bookings,
  onRefresh,
}: {
  bookings: PrivateDonationBookingResponse[];
  onRefresh: () => void;
}) => {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5">
        <div>
          <p className="text-sm font-black text-slate-950">
            My Private Bookings
          </p>

          <p className="mt-1 text-[10px] font-medium text-slate-500">
            {bookings.length} booking
            {bookings.length === 1 ? "" : "s"} recorded
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[9px] font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      {bookings.length === 0 ? (
        <div className="flex min-h-[350px] items-center justify-center p-8 text-center">
          <div>
            <CalendarClock className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-4 text-sm font-black text-slate-800">
              No private bookings
            </p>

            <p className="mt-2 max-w-sm text-[10px] font-medium leading-5 text-slate-500">
              Your direct hospital donation appointments will appear here after
              submission.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <TableHeading>Hospital</TableHeading>
                <TableHeading>Date and time</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Notes</TableHeading>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr
                  key={booking.bookingId}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Building2 className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {booking.hospitalName}
                        </p>

                        <p className="mt-1 text-[9px] font-medium text-slate-400">
                          Booking #{booking.bookingId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <p className="text-xs font-bold text-slate-800">
                      {formatDisplayDate(booking.bookingDate)}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-[9px] font-medium text-slate-500">
                      <Clock3 className="h-3 w-3" />
                      {formatTime(booking.startTime)} –{" "}
                      {formatTime(booking.endTime)}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <BookingStatusBadge status={booking.status} />
                  </td>

                  <td className="max-w-[260px] px-5 py-4 align-top">
                    <div className="space-y-2">
                      {booking.donorNote && (
                        <NoteLine label="Your note" value={booking.donorNote} />
                      )}

                      {booking.hospitalNote && (
                        <NoteLine
                          label="Hospital"
                          value={booking.hospitalNote}
                        />
                      )}

                      {booking.deferralReason && (
                        <NoteLine
                          label="Deferral"
                          value={booking.deferralReason}
                        />
                      )}

                      {booking.outcomeNote && (
                        <NoteLine label="Outcome" value={booking.outcomeNote} />
                      )}

                      {!booking.donorNote &&
                        !booking.hospitalNote &&
                        !booking.deferralReason &&
                        !booking.outcomeNote && (
                          <span className="text-[10px] font-medium text-slate-400">
                            No notes
                          </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

const ActiveBookingNotice = ({
  booking,
}: {
  booking: PrivateDonationBookingResponse;
}) => {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

        <div>
          <p className="text-xs font-black text-blue-900">
            You already have an active booking
          </p>

          <p className="mt-1 text-[10px] font-medium leading-5 text-blue-700">
            {booking.hospitalName} on {formatDisplayDate(booking.bookingDate)}{" "}
            from {formatTime(booking.startTime)} to{" "}
            {formatTime(booking.endTime)}. Current status:{" "}
            {formatStatusLabel(booking.status)}.
          </p>
        </div>
      </div>
    </div>
  );
};

const BookingStatusBadge = ({
  status,
}: {
  status: PrivateDonationBookingStatus;
}) => {
  const className = getStatusClassName(status);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${className}`}
    >
      {formatStatusLabel(status)}
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

const NoteLine = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start gap-2">
      <FileText className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />

      <p className="text-[9px] font-medium leading-4 text-slate-500">
        <span className="font-black text-slate-700">{label}:</span> {value}
      </p>
    </div>
  );
};

const BookingPageLoadingState = () => {
  return (
    <div className="flex min-h-[450px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-600" />

        <p className="mt-3 text-xs font-bold text-slate-500">
          Loading private bookings...
        </p>
      </div>
    </div>
  );
};

const BookingPageErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <div>
        <TriangleAlert className="mx-auto h-9 w-9 text-red-600" />

        <p className="mt-4 text-sm font-black text-red-800">
          Unable to load private bookings
        </p>

        <p className="mt-2 text-xs font-medium text-red-700">{message}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[10px] font-black text-white transition hover:bg-red-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

const getStatusClassName = (status: PrivateDonationBookingStatus): string => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";

    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";

    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "NO_SHOW":
      return "bg-slate-200 text-slate-700";

    case "DEFERRED":
      return "bg-orange-100 text-orange-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const formatStatusLabel = (status: PrivateDonationBookingStatus): string => {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatBloodType = (bloodType?: string | null): string => {
  if (!bloodType) {
    return "--";
  }

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

  return labels[bloodType] ?? bloodType;
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

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatHospitalLocation = (hospital: HospitalOption): string => {
  const locationParts = [
    hospital.address,
    hospital.township,
    hospital.city,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return locationParts.length > 0
    ? locationParts.join(", ")
    : "Hospital location";
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

export default DonorPrivateBookingPage;
