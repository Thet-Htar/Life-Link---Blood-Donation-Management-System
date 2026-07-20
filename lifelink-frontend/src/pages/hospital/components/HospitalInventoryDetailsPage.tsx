import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Eye,
  Filter,
  LoaderCircle,
  LockKeyhole,
  Search,
  Send,
  UnlockKeyhole,
  X,
} from "lucide-react";

import {
  discardHospitalBloodUnit,
  getHospitalInventory,
  issueHospitalBloodUnit,
  releaseHospitalBloodUnit,
  reserveHospitalBloodUnit,
} from "@/services/hospital/hospitalInventoryService";

import type { BloodType } from "@/types/auth/Auth";

import type {
  BloodDiscardReason,
  BloodInventoryUnitResponse,
  BloodIssuePurpose,
  BloodUnitSource,
  BloodUnitStatus,
  DiscardBloodUnitRequest,
  IssueBloodUnitRequest,
  ReserveBloodUnitRequest,
} from "@/types/hospitalInventory";

type StatusFilter = "ALL" | BloodUnitStatus;
type SourceFilter = "ALL" | BloodUnitSource;
type BloodTypeFilter = "ALL" | BloodType;

type InventoryAction = "RESERVE" | "RELEASE" | "ISSUE" | "DISCARD";

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

const ISSUE_PURPOSES: BloodIssuePurpose[] = [
  "PATIENT_USE",
  "EMERGENCY",
  "SURGERY",
  "WARD_STOCK",
  "OTHER",
];

const DISCARD_REASONS: BloodDiscardReason[] = [
  "EXPIRED",
  "DAMAGED",
  "LEAKAGE",
  "STORAGE_ISSUE",
  "OTHER",
];

const formatBloodType = (bloodType: BloodType): string => {
  return bloodType.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
};

const formatLabel = (value: string): string => {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getErrorMessage = (error: unknown): string => {
  const candidate = error as {
    response?: {
      data?: {
        message?: string;
        detail?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    candidate.response?.data?.message ??
    candidate.response?.data?.detail ??
    candidate.response?.data?.error ??
    candidate.message ??
    "Unable to complete the request."
  );
};

const statusBadgeClass = (status: BloodUnitStatus): string => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700";

    case "RESERVED":
      return "bg-amber-50 text-amber-700";

    case "ISSUED":
      return "bg-blue-50 text-blue-700";

    case "EXPIRED":
      return "bg-red-50 text-red-700";

    case "DISCARDED":
      return "bg-slate-100 text-slate-600";
  }
};

const HospitalInventoryDetailsPage = () => {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState<BloodInventoryUnitResponse[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedUnit, setSelectedUnit] =
    useState<BloodInventoryUnitResponse | null>(null);

  const [selectedAction, setSelectedAction] = useState<InventoryAction | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [bloodTypeFilter, setBloodTypeFilter] =
    useState<BloodTypeFilter>("ALL");

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const loadInventory = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHospitalInventory();

      setInventory(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, bloodTypeFilter, sourceFilter]);

  const filteredInventory = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventory.filter((unit) => {
      const matchesSearch =
        !normalizedSearch ||
        unit.unitCode.toLowerCase().includes(normalizedSearch) ||
        unit.storageLocation.toLowerCase().includes(normalizedSearch) ||
        unit.donationEventTitle?.toLowerCase().includes(normalizedSearch) ||
        unit.patientReference?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || unit.status === statusFilter;

      const matchesBloodType =
        bloodTypeFilter === "ALL" || unit.bloodType === bloodTypeFilter;

      const matchesSource =
        sourceFilter === "ALL" || unit.source === sourceFilter;

      return (
        matchesSearch && matchesStatus && matchesBloodType && matchesSource
      );
    });
  }, [inventory, search, statusFilter, bloodTypeFilter, sourceFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventory.length / pageSize),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedInventory = filteredInventory.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const handleUnitUpdated = (updatedUnit: BloodInventoryUnitResponse): void => {
    setInventory((current) =>
      current.map((unit) => (unit.id === updatedUnit.id ? updatedUnit : unit)),
    );

    setSelectedUnit(updatedUnit);
    setSelectedAction(null);
  };

  const openAction = (action: InventoryAction): void => {
    setSelectedAction(action);
  };

  return (
    <div className="min-h-full bg-white">
      <div className="mx-auto max-w-[1500px]">
        <header className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/hospital/inventory")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Inventory Overview
          </button>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            Detailed Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search and manage individual blood inventory units.
          </p>
        </header>

        {error && (
          <div className="mx-4 mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-6">
            {error}
          </div>
        )}

        <section className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-red-600" />

            <h2 className="text-base font-black text-slate-950">
              Inventory Filters
            </h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search unit code or location"
                className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-red-500"
              />
            </div>

            <select
              value={bloodTypeFilter}
              onChange={(event) =>
                setBloodTypeFilter(event.target.value as BloodTypeFilter)
              }
              className="h-10 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-red-500"
            >
              <option value="ALL">All Blood Types</option>

              {BLOOD_TYPES.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {formatBloodType(bloodType)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-red-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="ISSUED">Issued</option>
              <option value="EXPIRED">Expired</option>
              <option value="DISCARDED">Discarded</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value as SourceFilter)
              }
              className="h-10 border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-red-500"
            >
              <option value="ALL">All Sources</option>
              <option value="MANUAL_ENTRY">Manual Entry</option>
              <option value="DONATION_EVENT">Donation Event</option>
              <option value="PRIVATE_BOOKING">Private Booking</option>
            </select>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <h2 className="text-sm font-black text-slate-900">
              Inventory Records
            </h2>

            <p className="text-xs font-medium text-slate-500">
              {filteredInventory.length} units
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 sm:px-6">Unit Code</th>
                  <th className="px-4 py-3">Blood Type</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Collection</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right sm:px-6">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border-b border-slate-200 px-6 py-16 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                        <LoaderCircle className="h-5 w-5 animate-spin text-red-600" />
                        Loading blood inventory...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  paginatedInventory.map((unit) => (
                    <tr
                      key={unit.id}
                      className="border-b border-slate-200 text-sm transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 sm:px-6">
                        <p className="font-bold text-slate-900">
                          {unit.unitCode}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          ID #{unit.id}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-black text-red-600">
                          {formatBloodType(unit.bloodType)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {unit.volumeMl} ml
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(unit.collectionDate)}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(unit.expiryDate)}
                      </td>

                      <td className="max-w-[200px] px-4 py-3">
                        <p className="truncate text-slate-600">
                          {unit.storageLocation}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs font-medium text-slate-600">
                        {formatLabel(unit.source)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-[10px] font-black uppercase ${statusBadgeClass(
                            unit.status,
                          )}`}
                        >
                          {formatLabel(unit.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right sm:px-6">
                        <button
                          type="button"
                          onClick={() => setSelectedUnit(unit)}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 transition hover:text-red-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && paginatedInventory.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border-b border-slate-200 px-6 py-16 text-center"
                    >
                      <AlertTriangle className="mx-auto h-7 w-7 text-slate-300" />

                      <p className="mt-3 text-sm font-bold text-slate-600">
                        No inventory units found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              Showing {paginatedInventory.length} of {filteredInventory.length}{" "}
              units
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs font-bold text-slate-600">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </footer>
        </section>
      </div>

      {selectedUnit && (
        <InventoryDetailsModal
          unit={selectedUnit}
          onClose={() => {
            setSelectedUnit(null);
            setSelectedAction(null);
          }}
          onAction={openAction}
        />
      )}

      {selectedUnit && selectedAction && (
        <InventoryActionModal
          unit={selectedUnit}
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onUpdated={handleUnitUpdated}
        />
      )}
    </div>
  );
};

interface InventoryDetailsModalProps {
  unit: BloodInventoryUnitResponse;
  onClose: () => void;
  onAction: (action: InventoryAction) => void;
}

const InventoryDetailsModal = ({
  unit,
  onClose,
  onAction,
}: InventoryDetailsModalProps) => {
  const canReserve = unit.status === "AVAILABLE";

  const canRelease = unit.status === "RESERVED";

  const canIssue = unit.status === "AVAILABLE" || unit.status === "RESERVED";

  const canDiscard =
    unit.status === "AVAILABLE" ||
    unit.status === "RESERVED" ||
    unit.status === "EXPIRED";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
              Inventory Details
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {unit.unitCode}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <table className="w-full border-collapse text-sm">
          <tbody>
            <DetailRow
              label="Blood Type"
              value={formatBloodType(unit.bloodType)}
            />

            <DetailRow label="Volume" value={`${unit.volumeMl} ml`} />

            <DetailRow label="Status" value={formatLabel(unit.status)} />

            <DetailRow label="Source" value={formatLabel(unit.source)} />

            <DetailRow
              label="Collection Date"
              value={formatDate(unit.collectionDate)}
            />

            <DetailRow
              label="Expiry Date"
              value={formatDate(unit.expiryDate)}
            />

            <DetailRow label="Storage Location" value={unit.storageLocation} />

            {unit.reservedFor && (
              <DetailRow label="Reserved For" value={unit.reservedFor} />
            )}

            {unit.reservedAt && (
              <DetailRow
                label="Reserved At"
                value={formatDateTime(unit.reservedAt)}
              />
            )}

            {unit.issuePurpose && (
              <DetailRow
                label="Issue Purpose"
                value={formatLabel(unit.issuePurpose)}
              />
            )}

            {unit.issuedDepartment && (
              <DetailRow
                label="Issued Department"
                value={unit.issuedDepartment}
              />
            )}

            {unit.patientReference && (
              <DetailRow
                label="Patient Reference"
                value={unit.patientReference}
              />
            )}

            {unit.receivedBy && (
              <DetailRow label="Received By" value={unit.receivedBy} />
            )}

            {unit.issuedAt && (
              <DetailRow
                label="Issued At"
                value={formatDateTime(unit.issuedAt)}
              />
            )}

            {unit.discardReason && (
              <DetailRow
                label="Discard Reason"
                value={formatLabel(unit.discardReason)}
              />
            )}

            {unit.notes && <DetailRow label="Notes" value={unit.notes} />}
          </tbody>
        </table>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
          {canRelease && (
            <ActionButton
              label="Release"
              icon={UnlockKeyhole}
              onClick={() => onAction("RELEASE")}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            />
          )}

          {canReserve && (
            <ActionButton
              label="Reserve"
              icon={LockKeyhole}
              onClick={() => onAction("RESERVE")}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            />
          )}

          {canIssue && (
            <ActionButton
              label="Issue"
              icon={Send}
              onClick={() => onAction("ISSUE")}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            />
          )}

          {canDiscard && (
            <ActionButton
              label="Discard"
              icon={Ban}
              onClick={() => onAction("DISCARD")}
              className="border-red-300 text-red-700 hover:bg-red-50"
            />
          )}

          {!canReserve && !canRelease && !canIssue && !canDiscard && (
            <p className="mr-auto text-xs font-medium text-slate-500">
              No further actions are available for this unit.
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  icon: typeof LockKeyhole;
  onClick: () => void;
  className: string;
}

const ActionButton = ({
  label,
  icon: Icon,
  onClick,
  className,
}: ActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-bold transition ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};

interface InventoryActionModalProps {
  unit: BloodInventoryUnitResponse;
  action: InventoryAction;
  onClose: () => void;
  onUpdated: (unit: BloodInventoryUnitResponse) => void;
}

const InventoryActionModal = ({
  unit,
  action,
  onClose,
  onUpdated,
}: InventoryActionModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [reservedFor, setReservedFor] = useState("");

  const [reservationNote, setReservationNote] = useState("");

  const [issuePurpose, setIssuePurpose] =
    useState<BloodIssuePurpose>("PATIENT_USE");

  const [issuedDepartment, setIssuedDepartment] = useState("");

  const [patientReference, setPatientReference] = useState("");

  const [receivedBy, setReceivedBy] = useState("");

  const [issueNote, setIssueNote] = useState("");

  const [discardReason, setDiscardReason] = useState<BloodDiscardReason>(
    unit.status === "EXPIRED" ? "EXPIRED" : "DAMAGED",
  );

  const [discardNote, setDiscardNote] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      let updatedUnit: BloodInventoryUnitResponse | undefined;

      if (action === "RESERVE") {
        const request: ReserveBloodUnitRequest = {
          reservedFor: reservedFor.trim(),
          reservationNote: reservationNote.trim() || null,
        };

        updatedUnit = await reserveHospitalBloodUnit(unit.id, request);
      }

      if (action === "RELEASE") {
        updatedUnit = await releaseHospitalBloodUnit(unit.id);
      }

      if (action === "ISSUE") {
        const request: IssueBloodUnitRequest = {
          issuePurpose,
          issuedDepartment: issuedDepartment.trim(),
          patientReference: patientReference.trim() || null,
          receivedBy: receivedBy.trim(),
          issueNote: issueNote.trim() || null,
        };

        updatedUnit = await issueHospitalBloodUnit(unit.id, request);
      }

      if (action === "DISCARD") {
        const request: DiscardBloodUnitRequest = {
          discardReason,
          discardNote: discardNote.trim() || null,
        };

        updatedUnit = await discardHospitalBloodUnit(unit.id, request);
      }

      if (updatedUnit) {
        onUpdated(updatedUnit);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    action === "RESERVE"
      ? "Reserve Blood Unit"
      : action === "RELEASE"
        ? "Release Reservation"
        : action === "ISSUE"
          ? "Issue Blood Unit"
          : "Discard Blood Unit";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
              {unit.unitCode}
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">{title}</h2>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-5">
          {action === "RESERVE" && (
            <>
              <Field label="Reserved For" required>
                <input
                  required
                  value={reservedFor}
                  onChange={(event) => setReservedFor(event.target.value)}
                  placeholder="Emergency Department or patient reference"
                  className="h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-red-500"
                />
              </Field>

              <Field label="Reservation Note">
                <textarea
                  value={reservationNote}
                  onChange={(event) => setReservationNote(event.target.value)}
                  rows={3}
                  className="w-full resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                />
              </Field>
            </>
          )}

          {action === "RELEASE" && (
            <ConfirmationMessage
              message={`Release ${unit.unitCode} and return it to available inventory?`}
            />
          )}

          {action === "ISSUE" && (
            <>
              <Field label="Issue Purpose" required>
                <select
                  value={issuePurpose}
                  onChange={(event) =>
                    setIssuePurpose(event.target.value as BloodIssuePurpose)
                  }
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-red-500"
                >
                  {ISSUE_PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {formatLabel(purpose)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Department" required>
                <input
                  required
                  value={issuedDepartment}
                  onChange={(event) => setIssuedDepartment(event.target.value)}
                  placeholder="Emergency Department"
                  className="h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-red-500"
                />
              </Field>

              <Field label="Patient Reference">
                <input
                  value={patientReference}
                  onChange={(event) => setPatientReference(event.target.value)}
                  placeholder="MRN or internal patient reference"
                  className="h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-red-500"
                />
              </Field>

              <Field label="Received By" required>
                <input
                  required
                  value={receivedBy}
                  onChange={(event) => setReceivedBy(event.target.value)}
                  placeholder="Nurse or staff member"
                  className="h-10 w-full border border-slate-300 px-3 text-sm outline-none focus:border-red-500"
                />
              </Field>

              <Field label="Issue Note">
                <textarea
                  value={issueNote}
                  onChange={(event) => setIssueNote(event.target.value)}
                  rows={3}
                  className="w-full resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                />
              </Field>
            </>
          )}

          {action === "DISCARD" && (
            <>
              <Field label="Discard Reason" required>
                <select
                  value={discardReason}
                  onChange={(event) =>
                    setDiscardReason(event.target.value as BloodDiscardReason)
                  }
                  className="h-10 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-red-500"
                >
                  {DISCARD_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {formatLabel(reason)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Discard Note">
                <textarea
                  value={discardNote}
                  onChange={(event) => setDiscardNote(event.target.value)}
                  rows={3}
                  className="w-full resize-none border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                />
              </Field>
            </>
          )}

          {error && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirm
          </button>
        </footer>
      </form>
    </div>
  );
};

const Field = ({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </span>

      {children}
    </label>
  );
};

const ConfirmationMessage = ({ message }: { message: string }) => {
  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800">
      {message}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <tr className="border-b border-slate-200">
      <th className="w-48 bg-slate-50 px-5 py-3 text-left text-xs font-bold text-slate-500">
        {label}
      </th>

      <td className="px-5 py-3 font-medium text-slate-900">{value}</td>
    </tr>
  );
};

export default HospitalInventoryDetailsPage;
