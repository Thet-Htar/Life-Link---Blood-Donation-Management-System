import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  Building2,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  UnlockKeyhole,
} from "lucide-react";

import type {
  AdminHospitalResponse,
  PageResponse,
  VerificationStatus,
} from "@/types/auth/Admin";

import {
  lockHospital,
  searchAdminHospitals,
  unlockHospital,
} from "@/services/adminService";

import AlertModal from "../alertModel";

type VerificationFilter = "ALL" | VerificationStatus;

type AccountAction = "lock" | "unlock";

interface HospitalConfirmation {
  hospital: AdminHospitalResponse;
  action: AccountAction;
}

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
  }).format(date);
};

const getVerificationClassName = (
  status?: VerificationStatus | null,
): string => {
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
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          detail?: string;
          error?: string;
        };
      };
    };

    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.error ??
      "The request could not be completed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

const AdminHospitalsPage = () => {
  const [pageData, setPageData] =
    useState<PageResponse<AdminHospitalResponse>>(EMPTY_PAGE);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("ALL");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [changingHospitalId, setChangingHospitalId] = useState<number | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [hospitalConfirmation, setHospitalConfirmation] =
    useState<HospitalConfirmation | null>(null);

  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  const loadHospitals = useCallback(async (): Promise<void> => {
    setLoading(true);

    setErrorMessage("");

    try {
      const result = await searchAdminHospitals({
        search,

        status: verificationFilter === "ALL" ? undefined : verificationFilter,

        page,

        size: 10,
      });

      setPageData(result);
    } catch (error) {
      console.error("Failed to load hospitals:", error);

      setPageData(EMPTY_PAGE);

      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search, verificationFilter]);

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

  const handleClearFilters = (): void => {
    setSearchInput("");

    setSearch("");

    setVerificationFilter("ALL");

    setPage(0);

    setErrorMessage("");

    setSuccessMessage("");
  };

  const handleVerificationChange = (value: VerificationFilter): void => {
    setVerificationFilter(value);

    setPage(0);

    setSuccessMessage("");

    setErrorMessage("");
  };

  /*
   * Opens the confirmation modal.
   * The API is not called yet.
   */
  const handleAccountStatusChange = (hospital: AdminHospitalResponse): void => {
    const action: AccountAction = hospital.accountLocked ? "unlock" : "lock";

    setErrorMessage("");

    setSuccessMessage("");

    setHospitalConfirmation({
      hospital,
      action,
    });
  };

 
  const performHospitalAccountAction = async (
    hospital: AdminHospitalResponse,
    action: AccountAction,
  ): Promise<void> => {
    try {
      setIsUpdatingAccount(true);

      setChangingHospitalId(hospital.hospitalId);

      setErrorMessage("");

      setSuccessMessage("");

      const result =
        action === "lock"
          ? await lockHospital(hospital.hospitalId)
          : await unlockHospital(hospital.hospitalId);

      const completedAction = action === "lock" ? "locked" : "unlocked";

      setSuccessMessage(
        result.message ||
          `${hospital.hospitalName} was ${completedAction} successfully.`,
      );

      setHospitalConfirmation(null);

      await loadHospitals();
    } catch (error) {
      console.error(`Failed to ${action} hospital:`, error);

      setErrorMessage(getErrorMessage(error));

      setHospitalConfirmation(null);
    } finally {
      setChangingHospitalId(null);

      setIsUpdatingAccount(false);
    }
  };

  const closeConfirmation = (): void => {
    if (isUpdatingAccount) {
      return;
    }

    setHospitalConfirmation(null);
  };

  const hasFilters =
    search.length > 0 || searchInput.length > 0 || verificationFilter !== "ALL";

  return (
    <div className="space-y-5">
      {/* Page introduction */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <Building2 className="h-6 w-6" />
          </span>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.17em] text-red-600">
              Account management
            </p>

            <h2 className="mt-1.5 text-3xl font-black tracking-[-0.045em] text-slate-950">
              Registered Hospitals
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              View registered hospitals and control whether their accounts may
              access the LifeLink Hospital Portal.
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Registered hospitals
          </p>

          <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
            {loading ? "..." : pageData.totalElements}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-600">
                Account access
              </p>

              <p className="mt-3 text-base font-black text-emerald-800">
                Lock and unlock enabled
              </p>
            </div>

            <ShieldCheck className="h-7 w-7 text-emerald-600" />
          </div>
        </article>
      </section>

      {/* Search and filters */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_250px_auto_auto]">
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

          <select
            value={verificationFilter}
            onChange={(event) =>
              handleVerificationChange(event.target.value as VerificationFilter)
            }
            className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="ALL">All verification statuses</option>

            <option value="APPROVED">Approved</option>

            <option value="UNDER_REVIEW">Under Review</option>

            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-12 rounded-xl border border-slate-300 px-6 text-sm font-black text-slate-700 transition hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Error message */}
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

      {/* Hospitals table */}
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
                  Verification
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Account
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
                    Loading registered hospitals...
                  </td>
                </tr>
              ) : pageData.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Building2 className="mx-auto h-9 w-9 text-slate-300" />

                    <p className="mt-3 text-base font-black text-slate-700">
                      No hospitals found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing the search or verification filter.
                    </p>
                  </td>
                </tr>
              ) : (
                pageData.content.map((hospital) => {
                  const changing = changingHospitalId === hospital.hospitalId;

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

                        <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                          {hospital.hospitalLicenseCode}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {hospital.representativeStaffName}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1.5 text-[11px] font-black",
                            getVerificationClassName(
                              hospital.verificationStatus,
                            ),
                          ].join(" ")}
                        >
                          {formatStatus(hospital.verificationStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black",
                            hospital.accountLocked
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          {hospital.accountLocked ? (
                            <LockKeyhole className="h-3.5 w-3.5" />
                          ) : (
                            <UnlockKeyhole className="h-3.5 w-3.5" />
                          )}

                          {hospital.accountLocked ? "Locked" : "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {formatDate(hospital.registeredAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleAccountStatusChange(hospital)}
                          disabled={changing || isUpdatingAccount}
                          className={[
                            "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                            hospital.accountLocked
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-red-600 hover:bg-red-700",
                          ].join(" ")}
                        >
                          {hospital.accountLocked ? (
                            <UnlockKeyhole className="h-4 w-4" />
                          ) : (
                            <LockKeyhole className="h-4 w-4" />
                          )}

                          {changing
                            ? "Updating..."
                            : hospital.accountLocked
                              ? "Unlock"
                              : "Lock"}
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
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
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
              onClick={() => setPage((current) => current + 1)}
              disabled={pageData.last}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </footer>
        )}
      </section>

      {/* Hospital lock/unlock confirmation */}
      <AlertModal
        open={Boolean(hospitalConfirmation)}
        type={hospitalConfirmation?.action === "lock" ? "error" : "success"}
        title={
          hospitalConfirmation?.action === "lock"
            ? "Lock hospital account?"
            : "Unlock hospital account?"
        }
        message={
          hospitalConfirmation
            ? `${
                hospitalConfirmation.action === "lock" ? "Locking" : "Unlocking"
              } ${hospitalConfirmation.hospital.hospitalName}'s account will ${
                hospitalConfirmation.action === "lock"
                  ? "prevent hospital staff from accessing the LifeLink Hospital Portal until the account is unlocked."
                  : "restore access to the LifeLink Hospital Portal."
              }`
            : ""
        }
        confirmLabel={
          hospitalConfirmation?.action === "lock"
            ? "Lock Account"
            : "Unlock Account"
        }
        cancelLabel="Cancel"
        isConfirming={isUpdatingAccount}
        closeOnBackdrop={!isUpdatingAccount}
        onClose={closeConfirmation}
        onConfirm={async () => {
          if (!hospitalConfirmation) {
            return;
          }

          await performHospitalAccountAction(
            hospitalConfirmation.hospital,
            hospitalConfirmation.action,
          );
        }}
      />
    </div>
  );
};

export default AdminHospitalsPage;
