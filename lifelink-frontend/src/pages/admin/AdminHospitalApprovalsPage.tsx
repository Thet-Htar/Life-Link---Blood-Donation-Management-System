import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  Building2,
  CheckCircle2,
  Mail,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import type {
  AdminHospitalResponse,
  PageResponse,
  VerificationStatus,
} from "@/types/auth/Admin";

import { approveHospital, searchAdminHospitals } from "@/services/adminService";

import AlertModal from "../alertModel";

const EMPTY_PAGE: PageResponse<AdminHospitalResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

const formatStatus = (status?: VerificationStatus | null): string => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getStatusClassName = (status?: VerificationStatus | null): string => {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const responseError = error as {
      response?: {
        data?: {
          message?: string;
          detail?: string;
          error?: string;
        };
      };
    };

    return (
      responseError.response?.data?.message ??
      responseError.response?.data?.detail ??
      responseError.response?.data?.error ??
      "The request could not be completed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

const AdminHospitalApprovalsPage = () => {
  const [pageData, setPageData] =
    useState<PageResponse<AdminHospitalResponse>>(EMPTY_PAGE);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [approvingHospitalId, setApprovingHospitalId] = useState<number | null>(
    null,
  );

  const [hospitalToApprove, setHospitalToApprove] =
    useState<AdminHospitalResponse | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const loadHospitals = useCallback(async (): Promise<void> => {
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await searchAdminHospitals({
        search,
        status: "UNDER_REVIEW",
        page,
        size: 10,
      });

      setPageData(result);
    } catch (error) {
      console.error("Failed to load hospital registrations:", error);

      setPageData(EMPTY_PAGE);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    setPage(0);
    setSearch(searchInput.trim());
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleClearSearch = (): void => {
    setSearchInput("");
    setSearch("");
    setPage(0);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleApprove = (hospital: AdminHospitalResponse): void => {
    if (hospital.verificationStatus !== "UNDER_REVIEW") {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    setHospitalToApprove(hospital);
  };

  const performHospitalApproval = async (): Promise<void> => {
    if (!hospitalToApprove) {
      return;
    }

    const hospital = hospitalToApprove;

    try {
      setApprovingHospitalId(hospital.hospitalId);

      setErrorMessage("");
      setSuccessMessage("");

      const result = await approveHospital(hospital.hospitalId);

      setSuccessMessage(
        result.message || `${hospital.hospitalName} was approved successfully.`,
      );

      setHospitalToApprove(null);

      await loadHospitals();
    } catch (error) {
      console.error("Failed to approve hospital:", error);

      setErrorMessage(getErrorMessage(error));

      setHospitalToApprove(null);
    } finally {
      setApprovingHospitalId(null);
    }
  };

  const closeApprovalConfirmation = (): void => {
    if (approvingHospitalId !== null) {
      return;
    }

    setHospitalToApprove(null);
  };

  const hasSearch = search.length > 0 || searchInput.length > 0;

  return (
    <div className="space-y-5">
      {/* Page introduction */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <UserRoundCheck className="h-6 w-6" />
          </span>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.17em] text-red-600">
              Verification management
            </p>

            <h2 className="mt-1.5 text-3xl font-black tracking-[-0.045em] text-slate-950">
              Hospital Approvals
            </h2>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Review pending hospital registrations and approve trusted
              organizations. Approved hospitals receive an email and may then
              access the LifeLink Hospital Portal.
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Pending registrations
          </p>

          <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
            {loading ? "..." : pageData.totalElements}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-600">
                Approval workflow
              </p>

              <p className="mt-3 text-base font-black text-emerald-800">
                Email notification enabled
              </p>
            </div>

            <ShieldCheck className="h-7 w-7 shrink-0 text-emerald-600" />
          </div>
        </article>
      </section>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search hospital, license code, or email"
              className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>

          {hasSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="h-12 rounded-xl border border-slate-300 px-6 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Success */}
      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <p className="text-sm font-bold text-emerald-700">{successMessage}</p>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-red-700">{errorMessage}</p>

          <button
            type="button"
            onClick={() => void loadHospitals()}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white transition hover:bg-red-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Approvals table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Hospital
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Representative
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  License
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Status
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Registered
                </th>

                <th className="px-4 py-4 text-right text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-sm font-bold text-slate-500"
                  >
                    Loading hospital registrations...
                  </td>
                </tr>
              ) : pageData.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Building2 className="mx-auto h-9 w-9 text-slate-300" />

                    <p className="mt-3 text-base font-black text-slate-700">
                      No pending hospital registrations found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      New hospital registration requests will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                pageData.content.map((hospital) => {
                  const isApproving =
                    approvingHospitalId === hospital.hospitalId;

                  return (
                    <tr
                      key={hospital.hospitalId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-slate-900">
                          {hospital.hospitalName}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {hospital.email}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {hospital.representativeStaffName}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">
                          {hospital.hospitalLicenseCode}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-black ${getStatusClassName(
                            hospital.verificationStatus,
                          )}`}
                        >
                          {formatStatus(hospital.verificationStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {formatDate(hospital.registeredAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleApprove(hospital)}
                          disabled={
                            isApproving ||
                            approvingHospitalId !== null ||
                            hospital.verificationStatus !== "UNDER_REVIEW"
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <ShieldCheck className="h-4 w-4" />

                          {isApproving ? "Approving..." : "Approve"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && pageData.totalPages > 1 && (
          <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.max(currentPage - 1, 0))
              }
              disabled={pageData.first}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <p className="text-xs font-bold text-slate-500">
              Page {pageData.number + 1} of {pageData.totalPages}
            </p>

            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={pageData.last}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </footer>
        )}
      </section>

      {/* Hospital approval confirmation */}
      <AlertModal
        open={Boolean(hospitalToApprove)}
        type="success"
        title="Approve hospital?"
        message={
          hospitalToApprove
            ? `Approve ${hospitalToApprove.hospitalName}? An approval email will be sent to ${hospitalToApprove.email}. The hospital will then be able to access the LifeLink Hospital Portal.`
            : ""
        }
        confirmLabel="Approve Hospital"
        cancelLabel="Keep Pending"
        isConfirming={approvingHospitalId !== null}
        closeOnBackdrop={approvingHospitalId === null}
        onClose={closeApprovalConfirmation}
        onConfirm={performHospitalApproval}
        footer={
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <Mail className="h-3.5 w-3.5" />
            Approval email will be sent automatically
          </div>
        }
      />
    </div>
  );
};

export default AdminHospitalApprovalsPage;
