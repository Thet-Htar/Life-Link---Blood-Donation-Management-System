import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  Eye,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  ShieldAlert,
  Target,
  UserRound,
  UserRoundX,
  Users,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  BLOOD_TYPE_LABELS,
  type DonationEventResponse,
} from "@/types/hospitalEvents";

import type {
  DeferDonationRequest,
  DonationDeferralReason,
  DonationEventRegistrationStatus,
  RegisteredEventDonorResponse,
} from "@/types/hospitalEvents";
import { completeEventDonation, deferEventDonation, getEventRegisteredDonors, getHospitalDonationEventById, markEventDonorNoShow } from "@/services/hospital/hospitalDonationService";
import type { BloodType } from "@/types/auth/Auth";


type RegistrationFilter =
  | "ALL"
  | DonationEventRegistrationStatus;

const DEFERRAL_REASONS: {
  value: DonationDeferralReason;
  label: string;
}[] = [
  {
    value: "LOW_HEMOGLOBIN",
    label: "Low hemoglobin",
  },
  {
    value: "RECENT_DONATION",
    label: "Recent donation",
  },
  {
    value: "UNDERWEIGHT",
    label: "Underweight",
  },
  {
    value: "AGE_REQUIREMENT",
    label: "Age requirement",
  },
  {
    value: "CURRENT_ILLNESS",
    label: "Current illness",
  },
  {
    value: "MEDICATION",
    label: "Medication",
  },
  {
    value: "VITAL_SIGNS",
    label: "Vital signs",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const HospitalEventDetailsPage = () => {
  const navigate = useNavigate();

  const { eventId: eventIdParam } =
    useParams<{
      eventId: string;
    }>();

  const eventId = Number(eventIdParam);

  const [event, setEvent] =
    useState<DonationEventResponse | null>(
      null,
    );

  const [
    registrations,
    setRegistrations,
  ] = useState<
    RegisteredEventDonorResponse[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  const [
    processingRegistrationId,
    setProcessingRegistrationId,
  ] = useState<number | null>(null);

  const [
    selectedDeferralRegistration,
    setSelectedDeferralRegistration,
  ] =
    useState<RegisteredEventDonorResponse | null>(
      null,
    );

  const [
    selectedCompletionRegistration,
    setSelectedCompletionRegistration,
  ] =
    useState<RegisteredEventDonorResponse | null>(
      null,
    );

  const [
    selectedNoShowRegistration,
    setSelectedNoShowRegistration,
  ] =
    useState<RegisteredEventDonorResponse | null>(
      null,
    );

  const loadEventData =
    useCallback(
      async (): Promise<void> => {
        if (
          !Number.isInteger(eventId) ||
          eventId < 1
        ) {
          setPageError(
            "Invalid donation event ID.",
          );

          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setPageError("");

          const [
            eventResponse,
            registrationsResponse,
          ] = await Promise.all([
            getHospitalDonationEventById(
              eventId,
            ),

            getEventRegisteredDonors(
              eventId,
            ),
          ]);

          setEvent(eventResponse);

          setRegistrations(
            Array.isArray(
              registrationsResponse,
            )
              ? registrationsResponse
              : [],
          );
        } catch (error) {
          console.error(
            "Failed to load event details:",
            error,
          );

          setPageError(
            getApiErrorMessage(
              error,
              "Unable to load the donation event.",
            ),
          );
        } finally {
          setIsLoading(false);
        }
      },
      [eventId],
    );

  useEffect(() => {
    void loadEventData();
  }, [loadEventData]);

  const replaceRegistration = (
    updatedRegistration:
      RegisteredEventDonorResponse,
  ): void => {
    setRegistrations(current =>
      current.map(registration =>
        registration.registrationId ===
        updatedRegistration.registrationId
          ? updatedRegistration
          : registration,
      ),
    );
  };

  const handleCompleteDonation =
    async (): Promise<void> => {
      if (
        !selectedCompletionRegistration
      ) {
        return;
      }

      const registration =
        selectedCompletionRegistration;

      try {
        setProcessingRegistrationId(
          registration.registrationId,
        );

        const updatedRegistration =
          await completeEventDonation(
            eventId,
            registration.registrationId,
          );

        replaceRegistration(
          updatedRegistration,
        );

        setSelectedCompletionRegistration(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to complete donation:",
          error,
        );

        window.alert(
          getApiErrorMessage(
            error,
            "Unable to mark this donor as donated.",
          ),
        );
      } finally {
        setProcessingRegistrationId(
          null,
        );
      }
    };

  const handleMarkNoShow =
    async (): Promise<void> => {
      if (
        !selectedNoShowRegistration
      ) {
        return;
      }

      const registration =
        selectedNoShowRegistration;

      try {
        setProcessingRegistrationId(
          registration.registrationId,
        );

        const updatedRegistration =
          await markEventDonorNoShow(
            eventId,
            registration.registrationId,
          );

        replaceRegistration(
          updatedRegistration,
        );

        setSelectedNoShowRegistration(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to mark donor as no-show:",
          error,
        );

        window.alert(
          getApiErrorMessage(
            error,
            "Unable to mark this donor as no-show.",
          ),
        );
      } finally {
        setProcessingRegistrationId(
          null,
        );
      }
    };

  const handleDeferDonation =
    async (
      request: DeferDonationRequest,
    ): Promise<void> => {
      if (
        !selectedDeferralRegistration
      ) {
        return;
      }

      const registration =
        selectedDeferralRegistration;

      try {
        setProcessingRegistrationId(
          registration.registrationId,
        );

        const updatedRegistration =
          await deferEventDonation(
            eventId,
            registration.registrationId,
            request,
          );

        replaceRegistration(
          updatedRegistration,
        );

        setSelectedDeferralRegistration(
          null,
        );
      } catch (error) {
        console.error(
          "Failed to defer donation:",
          error,
        );

        throw new Error(
          getApiErrorMessage(
            error,
            "Unable to defer this donor.",
          ),
        );
      } finally {
        setProcessingRegistrationId(
          null,
        );
      }
    };

  if (isLoading) {
    return <EventDetailsLoadingState />;
  }

  if (pageError || !event) {
    return (
      <EventDetailsErrorState
        message={
          pageError ||
          "Donation event was not found."
        }
        onBack={() =>
          navigate("/hospital/events")
        }
        onRetry={() =>
          void loadEventData()
        }
      />
    );
  }

  return (
    <section className="space-y-5 pb-16">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/hospital/events",
              )
            }
            aria-label="Back to donation events"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
              Event Operations
            </p>

            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              {event.eventTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EventStatusBadge
            status={event.status}
          />

          <button
            type="button"
            onClick={() =>
              void loadEventData()
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <EventDetailsPanel
          event={event}
          registrationCount={
            registrations.filter(
              registration =>
                registration.status ===
                  "REGISTERED" ||
                registration.status ===
                  "COMPLETED",
            ).length
          }
        />

        <RegisteredDonorsPanel
          registrations={registrations}
          processingRegistrationId={
            processingRegistrationId
          }
          onComplete={
            setSelectedCompletionRegistration
          }
          onNoShow={
            setSelectedNoShowRegistration
          }
          onDefer={
            setSelectedDeferralRegistration
          }
        />
      </div>

      {selectedCompletionRegistration && (
        <ConfirmationModal
          title="Confirm Successful Donation"
          description={
            <>
              Confirm that{" "}
              <strong>
                {
                  selectedCompletionRegistration.fullName
                }
              </strong>{" "}
              successfully donated blood at
              this event.
            </>
          }
          confirmLabel="Confirm Donation"
          confirmClassName="bg-emerald-600 hover:bg-emerald-700"
          isSubmitting={
            processingRegistrationId ===
            selectedCompletionRegistration.registrationId
          }
          onCancel={() =>
            setSelectedCompletionRegistration(
              null,
            )
          }
          onConfirm={() =>
            void handleCompleteDonation()
          }
        >
          <DonorConfirmationSummary
            registration={
              selectedCompletionRegistration
            }
          />

          <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-[10px] font-bold leading-5 text-emerald-800">
              This action marks the
              registration as donated and
              may create donation history
              and a certificate.
            </p>
          </div>
        </ConfirmationModal>
      )}

      {selectedNoShowRegistration && (
        <ConfirmationModal
          title="Mark Donor as No Show"
          description={
            <>
              Confirm that{" "}
              <strong>
                {
                  selectedNoShowRegistration.fullName
                }
              </strong>{" "}
              did not attend this donation
              event.
            </>
          }
          confirmLabel="Mark No Show"
          confirmClassName="bg-rose-600 hover:bg-rose-700"
          isSubmitting={
            processingRegistrationId ===
            selectedNoShowRegistration.registrationId
          }
          onCancel={() =>
            setSelectedNoShowRegistration(
              null,
            )
          }
          onConfirm={() =>
            void handleMarkNoShow()
          }
        >
          <DonorConfirmationSummary
            registration={
              selectedNoShowRegistration
            }
          />

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

            <p className="text-[10px] font-bold leading-5 text-rose-800">
              A donor should only be marked
              as no-show after the event has
              ended.
            </p>
          </div>
        </ConfirmationModal>
      )}

      {selectedDeferralRegistration && (
        <DeferralModal
          registration={
            selectedDeferralRegistration
          }
          isSubmitting={
            processingRegistrationId ===
            selectedDeferralRegistration.registrationId
          }
          onClose={() =>
            setSelectedDeferralRegistration(
              null,
            )
          }
          onSubmit={
            handleDeferDonation
          }
        />
      )}
    </section>
  );
};

interface EventDetailsPanelProps {
  event: DonationEventResponse;
  registrationCount: number;
}

const EventDetailsPanel = ({
  event,
  registrationCount,
}: EventDetailsPanelProps) => {
  const targetDonorCount =
    event.targetDonorCount ?? 0;

  const registeredDonorCount =
    event.registeredDonors ??
    registrationCount;

  const remainingSlots = Math.max(
    targetDonorCount -
      registeredDonorCount,
    0,
  );

  const location = [
    event.address?.street,
    event.address?.township,
    event.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <aside className="xl:sticky xl:top-5 xl:self-start">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-500 p-6 text-white">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider">
                  {formatEnumLabel(
                    event.status,
                  )}
                </span>

                <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight">
                  {event.eventTitle ||
                    "Untitled event"}
                </h2>

                <p className="mt-2 text-xs font-semibold text-white/75">
                  {event.hospitalName}
                </p>
              </div>

              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Droplets className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <DetailItem
            icon={<CalendarDays />}
            label="Event date"
            value={formatDate(
              event.eventDate,
            )}
          />

          <DetailItem
            icon={<Clock3 />}
            label="Event time"
            value={`${formatTime(
              event.startTime,
            )} – ${formatTime(
              event.endTime,
            )}`}
          />

          <DetailItem
            icon={<MapPin />}
            label="Location"
            value={
              location ||
              "Location not provided"
            }
          />

          <DetailItem
            icon={<UserRound />}
            label="Contact person"
            value={
              event.contactPersonName ||
              "Not provided"
            }
          />

          <DetailItem
            icon={<Phone />}
            label="Contact phone"
            value={
              event.contactPhone ||
              "Not provided"
            }
          />

          <DetailItem
            icon={<CalendarDays />}
            label="Registration deadline"
            value={formatDate(
              event.registrationDeadline,
            )}
          />

          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Required Blood Types
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(
                event.requiredBloodTypes ??
                []
              ).length > 0 ? (
                (
                  event.requiredBloodTypes ??
                  []
                ).map(bloodType => (
                  <span
                    key={bloodType}
                    className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-[10px] font-black text-red-700"
                  >
                    {getBloodTypeLabel(
                      bloodType,
                    )}
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  No blood types selected
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CapacityCard
              icon={<Users />}
              label="Registered"
              value={registeredDonorCount}
            />

            <CapacityCard
              icon={<Target />}
              label="Target"
              value={targetDonorCount}
            />

            <CapacityCard
              icon={<Droplets />}
              label="Remaining"
              value={remainingSlots}
            />
          </div>

          {event.description && (
            <div className="border-t border-slate-100 pt-5">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                Event Description
              </p>

              <p className="mt-2 whitespace-pre-line text-xs font-medium leading-6 text-slate-600">
                {event.description}
              </p>
            </div>
          )}
        </div>
      </article>
    </aside>
  );
};

interface RegisteredDonorsPanelProps {
  registrations:
    RegisteredEventDonorResponse[];

  processingRegistrationId:
    number | null;

  onComplete: (
    registration:
      RegisteredEventDonorResponse,
  ) => void;

  onNoShow: (
    registration:
      RegisteredEventDonorResponse,
  ) => void;

  onDefer: (
    registration:
      RegisteredEventDonorResponse,
  ) => void;
}

const RegisteredDonorsPanel = ({
  registrations,
  processingRegistrationId,
  onComplete,
  onNoShow,
  onDefer,
}: RegisteredDonorsPanelProps) => {
  const [searchValue, setSearchValue] =
    useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<RegistrationFilter>(
      "ALL",
    );

  const filteredRegistrations =
    useMemo(() => {
      const normalizedSearch =
        searchValue
          .trim()
          .toLowerCase();

      return registrations.filter(
        registration => {
          const matchesFilter =
            activeFilter === "ALL" ||
            registration.status ===
              activeFilter;

          const matchesSearch =
            !normalizedSearch ||
            registration.fullName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            registration.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            registration.donorCode
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          return (
            matchesFilter &&
            matchesSearch
          );
        },
      );
    }, [
      registrations,
      searchValue,
      activeFilter,
    ]);

  const registeredCount =
    registrations.filter(
      registration =>
        registration.status ===
        "REGISTERED",
    ).length;

  const completedCount =
    registrations.filter(
      registration =>
        registration.status ===
        "COMPLETED",
    ).length;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-600">
              Donor Management
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Registered Donors
            </h2>

            <p className="mt-1 text-[10px] font-semibold text-slate-400">
              {registeredCount} waiting ·{" "}
              {completedCount} donated
            </p>
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchValue}
              onChange={changeEvent =>
                setSearchValue(
                  changeEvent.target.value,
                )
              }
              placeholder="Search name, email or donor code"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              "ALL",
              "REGISTERED",
              "COMPLETED",
              "NO_SHOW",
              "DEFERRED",
              "CANCELLED",
            ] as RegistrationFilter[]
          ).map(filter => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`rounded-lg border px-3 py-1.5 text-[9px] font-black transition ${
                activeFilter === filter
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {filter === "ALL"
                ? "All"
                : getRegistrationStatusLabel(
                    filter,
                  )}
            </button>
          ))}
        </div>
      </header>

      {filteredRegistrations.length ===
      0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
          <UserRoundX className="h-10 w-10 text-slate-300" />

          <h3 className="mt-4 text-sm font-black text-slate-800">
            No donor registrations found
          </h3>

          <p className="mt-2 max-w-sm text-xs font-medium leading-5 text-slate-400">
            No registrations match the
            selected search and status
            filter.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredRegistrations.map(
            registration => (
              <RegisteredDonorRow
                key={
                  registration.registrationId
                }
                registration={
                  registration
                }
                isProcessing={
                  processingRegistrationId ===
                  registration.registrationId
                }
                onComplete={() =>
                  onComplete(
                    registration,
                  )
                }
                onNoShow={() =>
                  onNoShow(
                    registration,
                  )
                }
                onDefer={() =>
                  onDefer(
                    registration,
                  )
                }
              />
            ),
          )}
        </div>
      )}
    </article>
  );
};

interface RegisteredDonorRowProps {
  registration:
    RegisteredEventDonorResponse;

  isProcessing: boolean;
  onComplete: () => void;
  onNoShow: () => void;
  onDefer: () => void;
}

const RegisteredDonorRow = ({
  registration,
  isProcessing,
  onComplete,
  onNoShow,
  onDefer,
}: RegisteredDonorRowProps) => {
  const canManage =
    registration.status ===
    "REGISTERED";

  return (
    <div className="p-5 transition hover:bg-slate-50/60">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-black text-slate-950">
              {registration.fullName}
            </h3>

            <RegistrationStatusBadge
              status={
                registration.status
              }
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 text-slate-400" />

              Code:
              <strong className="text-slate-700">
                {
                  registration.donorCode
                }
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-red-500" />

              <strong className="text-red-700">
                {getBloodTypeLabel(
                  registration.bloodType,
                )}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />

              {registration.email}
            </span>

            {registration.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />

                {registration.phone}
              </span>
            )}
          </div>

          <p className="mt-2 text-[9px] font-medium text-slate-400">
            Registered{" "}
            {formatDateTime(
              registration.registeredAt,
            )}
          </p>

          {registration.deferralReason && (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-[10px] font-black text-amber-800">
                Deferral reason:{" "}
                {formatEnumLabel(
                  registration.deferralReason,
                )}
              </p>

              {registration.outcomeNote && (
                <p className="mt-1 text-[10px] font-medium leading-5 text-amber-700">
                  {
                    registration.outcomeNote
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {canManage ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={onComplete}
              disabled={isProcessing}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[9px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}

              Donated
            </button>

            <button
              type="button"
              onClick={onNoShow}
              disabled={isProcessing}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 text-[9px] font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserRoundX className="h-3.5 w-3.5" />
              No Show
            </button>

            <button
              type="button"
              onClick={onDefer}
              disabled={isProcessing}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[9px] font-black text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Unable to Donate
            </button>
          </div>
        ) : (
          <RegistrationOutcome
            registration={
              registration
            }
          />
        )}
      </div>
    </div>
  );
};

const RegistrationOutcome = ({
  registration,
}: {
  registration:
    RegisteredEventDonorResponse;
}) => {
  if (
    registration.status ===
    "COMPLETED"
  ) {
    return (
      <div className="shrink-0 text-right">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Donation Completed
        </p>

        {registration.completedAt && (
          <p className="mt-1 text-[9px] font-medium text-slate-400">
            {formatDateTime(
              registration.completedAt,
            )}
          </p>
        )}
      </div>
    );
  }

  if (
    registration.status ===
    "NO_SHOW"
  ) {
    return (
      <div className="shrink-0 text-right">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-700">
          <UserRoundX className="h-4 w-4" />
          No Show
        </p>

        {registration.noShowAt && (
          <p className="mt-1 text-[9px] font-medium text-slate-400">
            {formatDateTime(
              registration.noShowAt,
            )}
          </p>
        )}
      </div>
    );
  }

  if (
    registration.status ===
    "DEFERRED"
  ) {
    return (
      <div className="shrink-0 text-right">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          Unable to Donate
        </p>

        {registration.deferredAt && (
          <p className="mt-1 text-[9px] font-medium text-slate-400">
            {formatDateTime(
              registration.deferredAt,
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="shrink-0 text-right">
      <p className="text-[10px] font-black text-slate-500">
        Registration Cancelled
      </p>

      {registration.cancelledAt && (
        <p className="mt-1 text-[9px] font-medium text-slate-400">
          {formatDateTime(
            registration.cancelledAt,
          )}
        </p>
      )}
    </div>
  );
};

interface DeferralModalProps {
  registration:
    RegisteredEventDonorResponse;

  isSubmitting: boolean;

  onClose: () => void;

  onSubmit: (
    request: DeferDonationRequest,
  ) => Promise<void>;
}

const DeferralModal = ({
  registration,
  isSubmitting,
  onClose,
  onSubmit,
}: DeferralModalProps) => {
  const [reason, setReason] =
    useState<DonationDeferralReason>(
      "LOW_HEMOGLOBIN",
    );

  const [note, setNote] =
    useState("");

  const [modalError, setModalError] =
    useState("");

  const handleSubmit =
    async (): Promise<void> => {
      try {
        setModalError("");

        await onSubmit({
          reason,
          note:
            note.trim() || undefined,
        });
      } catch (error) {
        setModalError(
          error instanceof Error
            ? error.message
            : "Unable to defer this donor.",
        );
      }
    };

  return (
    <ModalOverlay>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-600">
              Donation Outcome
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Unable to Donate
            </h2>

            <p className="mt-2 text-xs font-medium text-slate-500">
              Record why{" "}
              <strong className="text-slate-700">
                {registration.fullName}
              </strong>{" "}
              could not donate today.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close deferral modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <DonorConfirmationSummary
          registration={registration}
        />

        {modalError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-[10px] font-bold text-red-700">
              {modalError}
            </p>
          </div>
        )}

        <label className="mt-5 block">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            Deferral reason
          </span>

          <select
            value={reason}
            onChange={changeEvent =>
              setReason(
                changeEvent.target
                  .value as DonationDeferralReason,
              )
            }
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-50 disabled:opacity-60"
          >
            {DEFERRAL_REASONS.map(
              reasonOption => (
                <option
                  key={
                    reasonOption.value
                  }
                  value={
                    reasonOption.value
                  }
                >
                  {reasonOption.label}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            Private note
          </span>

          <textarea
            value={note}
            onChange={changeEvent =>
              setNote(
                changeEvent.target.value,
              )
            }
            disabled={isSubmitting}
            rows={4}
            maxLength={500}
            placeholder="Optional note about the donor outcome"
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-800 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-50 disabled:opacity-60"
          />

          <span className="mt-1 block text-right text-[9px] font-medium text-slate-400">
            {note.length}/500
          </span>
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-slate-200 px-4 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSubmit()
            }
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-[10px] font-black text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            Confirm Deferral
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

interface ConfirmationModalProps {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmClassName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}

const ConfirmationModal = ({
  title,
  description,
  confirmLabel,
  confirmClassName,
  isSubmitting,
  onCancel,
  onConfirm,
  children,
}: ConfirmationModalProps) => {
  return (
    <ModalOverlay>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-600">
              Confirm Action
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-slate-200 px-4 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
          >
            {isSubmitting && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}

            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const DonorConfirmationSummary = ({
  registration,
}: {
  registration:
    RegisteredEventDonorResponse;
}) => {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <SummaryItem
        label="Donor name"
        value={registration.fullName}
      />

      <SummaryItem
        label="Donor code"
        value={registration.donorCode}
      />

      <SummaryItem
        label="Blood type"
        value={getBloodTypeLabel(
          registration.bloodType,
        )}
      />

      <SummaryItem
        label="Email"
        value={registration.email}
      />
    </div>
  );
};

const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-slate-800">
        {value}
      </p>
    </div>
  );
};

const ModalOverlay = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
};

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

const CapacityCard = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
      <span className="mx-auto flex h-7 w-7 items-center justify-center text-red-600 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>

      <p className="mt-1 text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
};

const EventStatusBadge = ({
  status,
}: {
  status: DonationEventResponse["status"];
}) => {
  const isPublished =
    status === "PUBLISHED";

  return (
    <span
      className={`inline-flex h-8 items-center rounded-full border px-3 text-[9px] font-black uppercase tracking-wider ${
        isPublished
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {formatEnumLabel(status)}
    </span>
  );
};

const RegistrationStatusBadge = ({
  status,
}: {
  status: DonationEventRegistrationStatus;
}) => {
  const styles: Record<
    DonationEventRegistrationStatus,
    string
  > = {
    REGISTERED:
      "border-blue-100 bg-blue-50 text-blue-700",

    COMPLETED:
      "border-emerald-100 bg-emerald-50 text-emerald-700",

    CANCELLED:
      "border-slate-200 bg-slate-100 text-slate-600",

    NO_SHOW:
      "border-rose-100 bg-rose-50 text-rose-700",

    DEFERRED:
      "border-amber-100 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${styles[status]}`}
    >
      {getRegistrationStatusLabel(
        status,
      )}
    </span>
  );
};

const EventDetailsLoadingState = () => {
  return (
    <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-red-600" />

        <p className="mt-3 text-xs font-bold text-slate-500">
          Loading event details...
        </p>
      </div>
    </div>
  );
};

const EventDetailsErrorState = ({
  message,
  onBack,
  onRetry,
}: {
  message: string;
  onBack: () => void;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <AlertTriangle className="h-10 w-10 text-red-600" />

      <h1 className="mt-4 text-xl font-black text-slate-950">
        Event could not be loaded
      </h1>

      <p className="mt-2 max-w-md text-xs font-medium leading-5 text-slate-500">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-[10px] font-black text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-[10px] font-black text-white transition hover:bg-red-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

const getRegistrationStatusLabel = (
  status: DonationEventRegistrationStatus,
): string => {
  const labels: Record<
    DonationEventRegistrationStatus,
    string
  > = {
    REGISTERED: "Registered",
    COMPLETED: "Donated",
    CANCELLED: "Cancelled",
    NO_SHOW: "No Show",
    DEFERRED: "Deferred",
  };

  return labels[status];
};

const getBloodTypeLabel = (
  bloodType: BloodType | string,
): string => {
  const knownBloodType =
    bloodType as BloodType;

  return (
    BLOOD_TYPE_LABELS[
      knownBloodType
    ] ??
    bloodType
      .replace("_POSITIVE", "+")
      .replace("_NEGATIVE", "-")
  );
};

const formatEnumLabel = (
  value: string,
): string => {
  return value
    .toLowerCase()
    .split("_")
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
};

const formatDate = (
  value: string | null,
): string => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
};

const formatTime = (
  value: string | null,
): string => {
  if (!value) {
    return "--:--";
  }

  const [hourString, minuteString] =
    value.split(":");

  const date = new Date();

  date.setHours(
    Number(hourString),
    Number(minuteString),
    0,
    0,
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return value.slice(0, 5);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
};

const formatDateTime = (
  value: string | null,
): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
};

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (
    !axios.isAxiosError(error)
  ) {
    return fallbackMessage;
  }

  const responseData =
    error.response?.data as
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

export default HospitalEventDetailsPage;