import { useEffect, useState, type ReactNode } from "react";

import axios from "axios";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Droplets,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  Send,
  Target,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import {
  BLOOD_TYPE_LABELS,
  type DonationEventRequest,
  type DonationEventStatus,
} from "@/types/hospitalEvents";

import type { BloodType } from "@/types/auth/Auth";

import {
  createAndPublishDonationEvent,
  createDonationEventDraft,
  getHospitalDonationEventById,
  publishDonationEventDraft,
  updateDonationEventDraft,
  updateHospitalDonationEvent,
} from "@/services/hospital/hospitalDonationService";

import AlertModal from "../../alertModel";

interface CreateDonationEventPageProps {
  eventId: number | null;
  onCancel: () => void;
  onSaved: () => void;
}

interface EventFormState {
  eventTitle: string;
  targetDonorCount: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  requiredBloodTypes: BloodType[];
  contactPersonName: string;
  contactPhone: string;

  address: {
    street: string;
    township: string;
    city: string;
  };
}

type FormErrorKey =
  | "eventTitle"
  | "targetDonorCount"
  | "eventDate"
  | "startTime"
  | "endTime"
  | "registrationDeadline"
  | "requiredBloodTypes"
  | "contactPersonName"
  | "contactPhone"
  | "street"
  | "township"
  | "city";

type FormErrors = Partial<Record<FormErrorKey, string>>;

type SubmitAction = "draft" | "publish" | null;

const BLOOD_TYPES: BloodType[] = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const createEmptyForm = (): EventFormState => ({
  eventTitle: "",
  targetDonorCount: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  registrationDeadline: "",
  requiredBloodTypes: [],
  contactPersonName: "",
  contactPhone: "",

  address: {
    street: "",
    township: "",
    city: "",
  },
});

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100";

const errorInputClass =
  "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100";

const CreateDonationEventPage = ({
  eventId,
  onCancel,
  onSaved,
}: CreateDonationEventPageProps) => {
  const [formData, setFormData] = useState<EventFormState>(createEmptyForm);

  const [errors, setErrors] = useState<FormErrors>({});

  const [loadError, setLoadError] = useState("");

  const [serverError, setServerError] = useState("");

  const [isLoading, setIsLoading] = useState(eventId !== null);

  const [submitAction, setSubmitAction] = useState<SubmitAction>(null);

  const [loadedEventStatus, setLoadedEventStatus] =
    useState<DonationEventStatus | null>(null);

  const [registeredDonorCount, setRegisteredDonorCount] = useState(0);

  const [updateConfirmationOpen, setUpdateConfirmationOpen] = useState(false);

  const isEditing = eventId !== null;

  const isEditingDraft = isEditing && loadedEventStatus === "DRAFT";

  const isEditingPublished = isEditing && loadedEventStatus === "PUBLISHED";

  const isSubmitting = submitAction !== null;

  useEffect(() => {
    let ignoreResult = false;

    const loadEvent = async (): Promise<void> => {
      setUpdateConfirmationOpen(false);

      if (eventId === null) {
        setFormData(createEmptyForm());

        setErrors({});
        setLoadError("");
        setServerError("");
        setLoadedEventStatus(null);
        setRegisteredDonorCount(0);
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");
        setServerError("");
        setErrors({});

        const event = await getHospitalDonationEventById(eventId);

        if (ignoreResult) {
          return;
        }

        const canEditEvent =
          event.status === "DRAFT" || event.status === "PUBLISHED";

        if (!canEditEvent) {
          setLoadError("This donation event can no longer be edited.");

          return;
        }

        setLoadedEventStatus(event.status);

        setRegisteredDonorCount(event.registeredDonors ?? 0);

        setFormData({
          eventTitle: event.eventTitle ?? "",

          targetDonorCount:
            event.targetDonorCount === null ||
            event.targetDonorCount === undefined
              ? ""
              : String(event.targetDonorCount),

          description: event.description ?? "",

          eventDate: event.eventDate ?? "",

          startTime: event.startTime?.slice(0, 5) ?? "",

          endTime: event.endTime?.slice(0, 5) ?? "",

          registrationDeadline: event.registrationDeadline ?? "",

          requiredBloodTypes: event.requiredBloodTypes ?? [],

          contactPersonName: event.contactPersonName ?? "",

          contactPhone: event.contactPhone ?? "",

          address: {
            city: event.address?.city ?? "",

            township: event.address?.township ?? "",

            street: event.address?.street ?? "",
          },
        });
      } catch (error) {
        if (!ignoreResult) {
          setLoadError(
            getApiErrorMessage(error, "Unable to load the donation event."),
          );
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    };

    void loadEvent();

    return () => {
      ignoreResult = true;
    };
  }, [eventId]);

  const clearError = (key: FormErrorKey): void => {
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[key];

      return next;
    });
  };

  const updateField = <
    K extends Exclude<keyof EventFormState, "address" | "requiredBloodTypes">,
  >(
    field: K,
    value: EventFormState[K],
  ): void => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    clearError(field as FormErrorKey);
  };

  const updateAddress = (
    field: keyof EventFormState["address"],
    value: string,
  ): void => {
    setFormData((current) => ({
      ...current,

      address: {
        ...current.address,
        [field]: value,
      },
    }));

    clearError(field);
  };

  const toggleBloodType = (bloodType: BloodType): void => {
    setFormData((current) => {
      const selected = current.requiredBloodTypes.includes(bloodType);

      return {
        ...current,

        requiredBloodTypes: selected
          ? current.requiredBloodTypes.filter(
              (currentType) => currentType !== bloodType,
            )
          : [...current.requiredBloodTypes, bloodType],
      };
    });

    clearError("requiredBloodTypes");
  };

  const buildRequest = (): DonationEventRequest => {
    const targetDonorCount = Number.parseInt(formData.targetDonorCount, 10);

    return {
      eventTitle: formData.eventTitle.trim(),

      targetDonorCount:
        Number.isFinite(targetDonorCount) && targetDonorCount > 0
          ? targetDonorCount
          : null,

      description: formData.description.trim() || null,

      eventDate: formData.eventDate || null,

      startTime: formData.startTime || null,

      endTime: formData.endTime || null,

      registrationDeadline: formData.registrationDeadline || null,

      requiredBloodTypes: formData.requiredBloodTypes,

      contactPersonName: formData.contactPersonName.trim() || null,

      contactPhone: formData.contactPhone.trim() || null,

      address: {
        city: formData.address.city.trim(),

        township: formData.address.township.trim(),

        street: formData.address.street.trim(),
      },
    };
  };

  const validateDraft = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.eventTitle.trim()) {
      nextErrors.eventTitle = "Event title is required before saving a draft.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validatePublish = (): boolean => {
    const nextErrors: FormErrors = {};

    const targetDonorCount = Number.parseInt(formData.targetDonorCount, 10);

    if (!formData.eventTitle.trim()) {
      nextErrors.eventTitle = "Event title is required.";
    }

    if (!Number.isFinite(targetDonorCount) || targetDonorCount < 1) {
      nextErrors.targetDonorCount = "Target donor count must be at least 1.";
    } else if (isEditingPublished && targetDonorCount < registeredDonorCount) {
      nextErrors.targetDonorCount = `Target donor count cannot be lower than the current ${registeredDonorCount} registered donors.`;
    }

    if (!formData.eventDate) {
      nextErrors.eventDate = "Event date is required.";
    } else if (formData.eventDate < getToday()) {
      nextErrors.eventDate = "Event date cannot be in the past.";
    }

    if (!formData.startTime) {
      nextErrors.startTime = "Start time is required.";
    }

    if (!formData.endTime) {
      nextErrors.endTime = "End time is required.";
    } else if (formData.startTime && formData.endTime <= formData.startTime) {
      nextErrors.endTime = "End time must be after start time.";
    }

    if (!formData.registrationDeadline) {
      nextErrors.registrationDeadline = "Registration deadline is required.";
    } else if (
      formData.eventDate &&
      formData.registrationDeadline > formData.eventDate
    ) {
      nextErrors.registrationDeadline =
        "Registration deadline cannot be after the event date.";
    }

    if (formData.requiredBloodTypes.length === 0) {
      nextErrors.requiredBloodTypes = "Select at least one blood type.";
    }

    if (!formData.contactPersonName.trim()) {
      nextErrors.contactPersonName = "Contact person name is required.";
    }

    if (!formData.contactPhone.trim()) {
      nextErrors.contactPhone = "Contact phone is required.";
    }

    if (!formData.address.street.trim()) {
      nextErrors.street = "Street is required.";
    }

    if (!formData.address.township.trim()) {
      nextErrors.township = "Township is required.";
    }

    if (!formData.address.city.trim()) {
      nextErrors.city = "City is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveDraft = async (): Promise<void> => {
    if (isEditingPublished) {
      return;
    }

    if (!validateDraft()) {
      return;
    }

    try {
      setSubmitAction("draft");
      setServerError("");

      const request = buildRequest();

      if (eventId === null) {
        await createDonationEventDraft(request);
      } else {
        await updateDonationEventDraft(eventId, request);
      }

      onSaved();
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          isEditingDraft
            ? "Unable to update the draft event."
            : "Unable to save the draft event.",
        ),
      );
    } finally {
      setSubmitAction(null);
    }
  };

  const performPublishOrUpdate = async (): Promise<void> => {
    try {
      setSubmitAction("publish");
      setServerError("");

      const request = buildRequest();

      if (eventId === null) {
        await createAndPublishDonationEvent(request);
      } else if (isEditingDraft) {
        await publishDonationEventDraft(eventId, request);
      } else if (isEditingPublished) {
        await updateHospitalDonationEvent(eventId, request);
      } else {
        throw new Error("Unsupported donation event status.");
      }

      setUpdateConfirmationOpen(false);

      onSaved();
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          isEditingPublished
            ? "Unable to update the published event."
            : "Unable to publish the donation event.",
        ),
      );

      setUpdateConfirmationOpen(false);
    } finally {
      setSubmitAction(null);
    }
  };

  const handlePublishOrUpdate = async (): Promise<void> => {
    if (!validatePublish()) {
      return;
    }

    if (isEditingPublished) {
      setUpdateConfirmationOpen(true);

      return;
    }

    await performPublishOrUpdate();
  };

  const closeUpdateConfirmation = (): void => {
    if (isSubmitting) {
      return;
    }

    setUpdateConfirmationOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-red-600" />

          <p className="mt-3 text-xs font-bold text-slate-500">
            Loading donation event...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <TriangleAlert className="mx-auto h-10 w-10 text-red-600" />

          <h1 className="mt-4 text-xl font-black text-slate-950">
            Event cannot be edited
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">{loadError}</p>

          <button
            type="button"
            onClick={onCancel}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white transition hover:bg-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Back to events"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
              {isEditingPublished
                ? "Published event editing"
                : isEditingDraft
                  ? "Draft editing"
                  : "New event"}
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">
              {isEditing ? "Edit Donation Event" : "Create Donation Event"}
            </h1>

            <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-slate-500">
              {isEditingPublished
                ? "Update this published event carefully. Registered donors may rely on its current date, time and location."
                : "Cancel discards unsaved changes. Save Draft stores a draft. Publish makes the event available to donors."}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${
            isEditingPublished
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : isEditingDraft
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {isEditingPublished
            ? "Editing Published Event"
            : isEditingDraft
              ? "Editing Draft"
              : "Unsaved Event"}
        </span>
      </header>

      {isEditingPublished && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-black">Published event warning</p>

            <p className="mt-1 text-[11px] font-medium leading-5">
              This event currently has {registeredDonorCount} registered donor
              {registeredDonorCount === 1 ? "" : "s"}. Avoid changing its date,
              time or location unless necessary.
            </p>
          </div>
        </div>
      )}

      {serverError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-black">Event operation failed</p>

            <p className="mt-1 text-[11px] font-medium">{serverError}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={(formEvent) => formEvent.preventDefault()}
        className="space-y-6"
      >
        <FormSection
          title="Event Information"
          description="Basic information shown to hospital staff and eligible donors."
          icon={<CalendarDays className="h-5 w-5" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup
              label="Event title"
              required
              error={errors.eventTitle}
              className="sm:col-span-2"
            >
              <input
                type="text"
                value={formData.eventTitle}
                onChange={(changeEvent) =>
                  updateField("eventTitle", changeEvent.target.value)
                }
                placeholder="Community Blood Donation Drive"
                maxLength={200}
                className={`${inputClass} ${
                  errors.eventTitle ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup
              label="Target donor count"
              required
              error={errors.targetDonorCount}
            >
              <div className="relative">
                <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="number"
                  min={
                    isEditingPublished ? Math.max(registeredDonorCount, 1) : 1
                  }
                  value={formData.targetDonorCount}
                  onChange={(changeEvent) =>
                    updateField("targetDonorCount", changeEvent.target.value)
                  }
                  placeholder="50"
                  className={`${inputClass} pl-10 ${
                    errors.targetDonorCount ? errorInputClass : ""
                  }`}
                />
              </div>
            </FieldGroup>

            <FieldGroup
              label="Registration deadline"
              required
              error={errors.registrationDeadline}
            >
              <input
                type="date"
                value={formData.registrationDeadline}
                min={getToday()}
                max={formData.eventDate || undefined}
                onChange={(changeEvent) =>
                  updateField("registrationDeadline", changeEvent.target.value)
                }
                className={`${inputClass} ${
                  errors.registrationDeadline ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup label="Description" className="sm:col-span-2">
              <textarea
                value={formData.description}
                onChange={(changeEvent) =>
                  updateField("description", changeEvent.target.value)
                }
                placeholder="Describe the purpose and important details."
                rows={5}
                maxLength={2000}
                className={`${inputClass} h-auto min-h-32 resize-y py-3`}
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          title="Schedule"
          description="Choose the event date and operating time."
          icon={<Clock3 className="h-5 w-5" />}
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <FieldGroup label="Event date" required error={errors.eventDate}>
              <input
                type="date"
                value={formData.eventDate}
                min={getToday()}
                onChange={(changeEvent) =>
                  updateField("eventDate", changeEvent.target.value)
                }
                className={`${inputClass} ${
                  errors.eventDate ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup label="Start time" required error={errors.startTime}>
              <input
                type="time"
                value={formData.startTime}
                onChange={(changeEvent) =>
                  updateField("startTime", changeEvent.target.value)
                }
                className={`${inputClass} ${
                  errors.startTime ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup label="End time" required error={errors.endTime}>
              <input
                type="time"
                value={formData.endTime}
                min={formData.startTime || undefined}
                onChange={(changeEvent) =>
                  updateField("endTime", changeEvent.target.value)
                }
                className={`${inputClass} ${
                  errors.endTime ? errorInputClass : ""
                }`}
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          title="Required Blood Types"
          description="Select every blood type requested for this event."
          icon={<Droplets className="h-5 w-5" />}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BLOOD_TYPES.map((bloodType) => {
              const selected = formData.requiredBloodTypes.includes(bloodType);

              return (
                <button
                  key={bloodType}
                  type="button"
                  onClick={() => toggleBloodType(bloodType)}
                  className={`rounded-xl border px-4 py-3 text-sm font-black transition ${
                    selected
                      ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-600/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  {BLOOD_TYPE_LABELS[bloodType]}
                </button>
              );
            })}
          </div>

          {errors.requiredBloodTypes && (
            <p className="mt-3 text-[10px] font-bold text-red-600">
              {errors.requiredBloodTypes}
            </p>
          )}
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Hospital contact details used by registered donors."
          icon={<UserRound className="h-5 w-5" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup
              label="Contact person"
              required
              error={errors.contactPersonName}
            >
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={formData.contactPersonName}
                  onChange={(changeEvent) =>
                    updateField("contactPersonName", changeEvent.target.value)
                  }
                  placeholder="Dr. John Doe"
                  maxLength={150}
                  className={`${inputClass} pl-10 ${
                    errors.contactPersonName ? errorInputClass : ""
                  }`}
                />
              </div>
            </FieldGroup>

            <FieldGroup
              label="Contact phone"
              required
              error={errors.contactPhone}
            >
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(changeEvent) =>
                    updateField("contactPhone", changeEvent.target.value)
                  }
                  placeholder="09xxxxxxxxx"
                  maxLength={30}
                  className={`${inputClass} pl-10 ${
                    errors.contactPhone ? errorInputClass : ""
                  }`}
                />
              </div>
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          title="Event Location"
          description="Location matching recommends nearby events to donors."
          icon={<MapPin className="h-5 w-5" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldGroup
              label="Street"
              required
              error={errors.street}
              className="sm:col-span-2"
            >
              <input
                type="text"
                value={formData.address.street}
                onChange={(changeEvent) =>
                  updateAddress("street", changeEvent.target.value)
                }
                placeholder="No. 10, Pyay Road"
                className={`${inputClass} ${
                  errors.street ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup label="Township" required error={errors.township}>
              <input
                type="text"
                value={formData.address.township}
                onChange={(changeEvent) =>
                  updateAddress("township", changeEvent.target.value)
                }
                placeholder="Kamayut"
                className={`${inputClass} ${
                  errors.township ? errorInputClass : ""
                }`}
              />
            </FieldGroup>

            <FieldGroup label="City" required error={errors.city}>
              <input
                type="text"
                value={formData.address.city}
                onChange={(changeEvent) =>
                  updateAddress("city", changeEvent.target.value)
                }
                placeholder="Yangon"
                className={`${inputClass} ${
                  errors.city ? errorInputClass : ""
                }`}
              />
            </FieldGroup>
          </div>
        </FormSection>

        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-950/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel & Discard
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isEditingPublished && (
              <button
                type="button"
                onClick={() => void handleSaveDraft()}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 text-xs font-black text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitAction === "draft" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {isEditingDraft ? "Update Draft" : "Save as Draft"}
              </button>
            )}

            <button
              type="button"
              onClick={() => void handlePublishOrUpdate()}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitAction === "publish" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : isEditingPublished ? (
                <Save className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {isEditingPublished
                ? "Update Published Event"
                : isEditingDraft
                  ? "Publish Draft"
                  : "Create & Publish"}
            </button>
          </div>
        </div>
      </form>

      <AlertModal
        open={updateConfirmationOpen}
        type="warning"
        title="Update published event?"
        message={`This event currently has ${registeredDonorCount} registered donor${
          registeredDonorCount === 1 ? "" : "s"
        }. Updating the event may change information that registered donors rely on, including its date, time, location, contact details, and required blood types.`}
        confirmLabel="Update Event"
        cancelLabel="Keep Editing"
        isConfirming={submitAction === "publish"}
        closeOnBackdrop={!isSubmitting}
        onClose={closeUpdateConfirmation}
        onConfirm={performPublishOrUpdate}
      />
    </section>
  );
};

interface FormSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

const FormSection = ({
  title,
  description,
  icon,
  children,
}: FormSectionProps) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-6 flex items-start gap-3 border-b border-slate-100 pb-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          {icon}
        </span>

        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>

          <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
            {description}
          </p>
        </div>
      </header>

      {children}
    </article>
  );
};

interface FieldGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

const FieldGroup = ({
  label,
  required = false,
  error,
  className = "",
  children,
}: FieldGroupProps) => {
  return (
    <label className={className}>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-600">
        {label}

        {required && <span className="ml-1 text-red-600">*</span>}
      </span>

      {children}

      <span className="mt-1.5 block min-h-4 text-[10px] font-bold text-red-600">
        {error ?? ""}
      </span>
    </label>
  );
};

const getToday = (): string => {
  const now = new Date();

  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
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
        message?: string;
        detail?: string;
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

export default CreateDonationEventPage;
