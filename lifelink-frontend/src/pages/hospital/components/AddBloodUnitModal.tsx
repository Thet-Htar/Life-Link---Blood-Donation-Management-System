import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  CalendarDays,
  Check,
  Droplet,
  LoaderCircle,
  Search,
  UserRound,
  X,
} from "lucide-react";


import type {
  BloodUnitSource,
  CreateBloodUnitRequest,
  EventInventorySourceResponse,
  PrivateBookingInventorySourceResponse,
} from "@/types/hospitalInventory";
import type { BloodType } from "@/types/auth/Auth";
import { searchEventInventorySources, searchPrivateBookingInventorySources } from "@/services/hospital/hospitalInventoryService";

interface AddBloodUnitModalProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (request: CreateBloodUnitRequest) => Promise<void>;
}

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

const formatBloodType = (bloodType: BloodType): string => {
  return bloodType.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const getErrorMessage = (error: unknown): string => {
  const candidate = error as {
    response?: {
      data?: {
        message?: string;
        detail?: string;
      };
    };
    message?: string;
  };

  return (
    candidate.response?.data?.message ??
    candidate.response?.data?.detail ??
    candidate.message ??
    "Something went wrong."
  );
};

const AddBloodUnitModal = ({
  open,
  submitting,
  onClose,
  onSubmit,
}: AddBloodUnitModalProps) => {
  const [source, setSource] = useState<BloodUnitSource>("MANUAL_ENTRY");

  const [unitCode, setUnitCode] = useState("");

  const [bloodType, setBloodType] = useState<BloodType>("A_POSITIVE");

  const [volumeMl, setVolumeMl] = useState("450");

  const [collectionDate, setCollectionDate] = useState("");

  const [expiryDate, setExpiryDate] = useState("");

  const [storageLocation, setStorageLocation] = useState("");

  const [notes, setNotes] = useState("");

  const [sourceSearch, setSourceSearch] = useState("");

  const [eventSources, setEventSources] = useState<
    EventInventorySourceResponse[]
  >([]);

  const [bookingSources, setBookingSources] = useState<
    PrivateBookingInventorySourceResponse[]
  >([]);

  const [selectedEvent, setSelectedEvent] =
    useState<EventInventorySourceResponse | null>(null);

  const [selectedBooking, setSelectedBooking] =
    useState<PrivateBookingInventorySourceResponse | null>(null);

  const [sourceLoading, setSourceLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const selectedSource = useMemo(() => {
    if (source === "DONATION_EVENT") {
      return selectedEvent;
    }

    if (source === "PRIVATE_BOOKING") {
      return selectedBooking;
    }

    return null;
  }, [source, selectedEvent, selectedBooking]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSource("MANUAL_ENTRY");
    setUnitCode("");
    setBloodType("A_POSITIVE");
    setVolumeMl("450");
    setCollectionDate("");
    setExpiryDate("");
    setStorageLocation("");
    setNotes("");
    setSourceSearch("");
    setEventSources([]);
    setBookingSources([]);
    setSelectedEvent(null);
    setSelectedBooking(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || source === "MANUAL_ENTRY" || selectedSource) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSourceLoading(true);
      setError(null);

      try {
        if (source === "DONATION_EVENT") {
          const response = await searchEventInventorySources(
            sourceSearch,
            0,
            10,
          );

          setEventSources(response.content);
          setBookingSources([]);
        }

        if (source === "PRIVATE_BOOKING") {
          const response = await searchPrivateBookingInventorySources(
            sourceSearch,
            0,
            10,
          );

          setBookingSources(response.content);
          setEventSources([]);
        }
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setSourceLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, source, sourceSearch, selectedSource]);

  if (!open) {
    return null;
  }

  const handleSourceChange = (newSource: BloodUnitSource) => {
    setSource(newSource);
    setSelectedEvent(null);
    setSelectedBooking(null);
    setSourceSearch("");
    setEventSources([]);
    setBookingSources([]);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (source === "DONATION_EVENT" && !selectedEvent) {
      setError("Please select a completed donation-event registration.");
      return;
    }

    if (source === "PRIVATE_BOOKING" && !selectedBooking) {
      setError("Please select a completed private booking.");
      return;
    }

    if (source === "MANUAL_ENTRY" && !collectionDate) {
      setError("Collection date is required for manual entry.");
      return;
    }

    const parsedVolume = Number(volumeMl);

    if (!Number.isFinite(parsedVolume) || parsedVolume <= 0) {
      setError("Volume must be greater than zero.");
      return;
    }

    const request: CreateBloodUnitRequest = {
      source,

      eventRegistrationId:
        source === "DONATION_EVENT"
          ? (selectedEvent?.registrationId ?? null)
          : null,

      privateBookingId:
        source === "PRIVATE_BOOKING"
          ? (selectedBooking?.bookingId ?? null)
          : null,

      unitCode: unitCode.trim(),

      bloodType: source === "MANUAL_ENTRY" ? bloodType : null,

      volumeMl: parsedVolume,

      collectionDate: source === "MANUAL_ENTRY" ? collectionDate : null,

      expiryDate,

      storageLocation: storageLocation.trim(),

      notes: notes.trim() || null,
    };

    try {
      await onSubmit(request);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Blood inventory
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              Add Blood Unit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a manual unit or link a completed donation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-6 p-5 sm:p-7">
            <section>
              <label className="text-sm font-black text-slate-800">
                Inventory Source
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    "MANUAL_ENTRY",
                    "DONATION_EVENT",
                    "PRIVATE_BOOKING",
                  ] as BloodUnitSource[]
                ).map((option) => {
                  const active = source === option;

                  const label =
                    option === "MANUAL_ENTRY"
                      ? "Manual Entry"
                      : option === "DONATION_EVENT"
                        ? "Donation Event"
                        : "Private Booking";

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSourceChange(option)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-red-500 bg-red-50 ring-2 ring-red-100"
                          : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Droplet
                          className={`h-5 w-5 ${
                            active
                              ? "fill-current text-red-600"
                              : "text-slate-400"
                          }`}
                        />

                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm font-black text-slate-900">
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {source !== "MANUAL_ENTRY" && (
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="text-sm font-black text-slate-800">
                  {source === "DONATION_EVENT"
                    ? "Completed Donation"
                    : "Completed Booking"}
                </label>

                {selectedSource ? (
                  <div className="mt-3 flex items-start justify-between rounded-2xl border border-red-200 bg-white p-4">
                    <div className="flex gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <UserRound className="h-5 w-5" />
                      </span>

                      <div>
                        <p className="font-black text-slate-950">
                          {selectedSource.donorName}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {selectedSource.donorCode}
                          {" • "}
                          {formatBloodType(selectedSource.bloodType)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {source === "DONATION_EVENT"
                            ? selectedEvent?.eventTitle
                            : "Private donation booking"}
                          {" • "}
                          {formatDate(selectedSource.completedAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(null);
                        setSelectedBooking(null);
                      }}
                      className="text-xs font-black text-red-600 hover:text-red-700"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        value={sourceSearch}
                        onChange={(event) =>
                          setSourceSearch(event.target.value)
                        }
                        placeholder="Search donor name, code or email..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      />
                    </div>

                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
                      {sourceLoading && (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-slate-500">
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Loading completed donations...
                        </div>
                      )}

                      {!sourceLoading &&
                        source === "DONATION_EVENT" &&
                        eventSources.map((item) => (
                          <button
                            key={item.registrationId}
                            type="button"
                            onClick={() => setSelectedEvent(item)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-300 hover:bg-red-50"
                          >
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {item.donorName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.donorCode}
                                {" • "}
                                {formatBloodType(item.bloodType)}
                                {" • "}
                                {item.eventTitle}
                              </p>
                            </div>

                            <CalendarDays className="h-4 w-4 text-slate-400" />
                          </button>
                        ))}

                      {!sourceLoading &&
                        source === "PRIVATE_BOOKING" &&
                        bookingSources.map((item) => (
                          <button
                            key={item.bookingId}
                            type="button"
                            onClick={() => setSelectedBooking(item)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-300 hover:bg-red-50"
                          >
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {item.donorName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.donorCode}
                                {" • "}
                                {formatBloodType(item.bloodType)}
                                {" • "}
                                {formatDate(item.completedAt)}
                              </p>
                            </div>

                            <CalendarDays className="h-4 w-4 text-slate-400" />
                          </button>
                        ))}

                      {!sourceLoading &&
                        ((source === "DONATION_EVENT" &&
                          eventSources.length === 0) ||
                          (source === "PRIVATE_BOOKING" &&
                            bookingSources.length === 0)) && (
                          <p className="py-8 text-center text-sm font-semibold text-slate-400">
                            No completed unused donations found.
                          </p>
                        )}
                    </div>
                  </>
                )}
              </section>
            )}

            <section className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-slate-700">
                  Unit Code
                </span>

                <input
                  required
                  value={unitCode}
                  onChange={(event) => setUnitCode(event.target.value)}
                  placeholder="BLD-2026-00001"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700">Volume</span>

                <div className="relative mt-2">
                  <input
                    required
                    type="number"
                    min={1}
                    max={1000}
                    value={volumeMl}
                    onChange={(event) => setVolumeMl(event.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-12 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                  />

                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ml
                  </span>
                </div>
              </label>

              {source === "MANUAL_ENTRY" && (
                <>
                  <label>
                    <span className="text-sm font-bold text-slate-700">
                      Blood Type
                    </span>

                    <select
                      value={bloodType}
                      onChange={(event) =>
                        setBloodType(event.target.value as BloodType)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    >
                      {BLOOD_TYPES.map((item) => (
                        <option key={item} value={item}>
                          {formatBloodType(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-bold text-slate-700">
                      Collection Date
                    </span>

                    <input
                      required
                      type="date"
                      value={collectionDate}
                      onChange={(event) =>
                        setCollectionDate(event.target.value)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </label>
                </>
              )}

              <label>
                <span className="text-sm font-bold text-slate-700">
                  Expiry Date
                </span>

                <input
                  required
                  type="date"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <label>
                <span className="text-sm font-bold text-slate-700">
                  Storage Location
                </span>

                <input
                  required
                  value={storageLocation}
                  onChange={(event) => setStorageLocation(event.target.value)}
                  placeholder="Refrigerator A / Shelf 2"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                />
              </label>
            </section>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Notes</span>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Optional notes about this blood unit..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-medium outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Add Blood Unit
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddBloodUnitModal;
