import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  Droplets,
  LockKeyhole,
  RefreshCcw,
  Search,
  UnlockKeyhole,
  UsersRound,
} from "lucide-react";

import type { AdminDonorResponse } from "@/types/auth/Admin";

import type { PageResponse } from "@/types/hospitalInventory";

import {
  lockDonor,
  searchAdminDonors,
  unlockDonor,
} from "@/services/adminService";

import AlertModal from "../alertModel";

type AccountAction = "lock" | "unlock";

interface DonorConfirmation {
  donor: AdminDonorResponse;
  action: AccountAction;
}

const EMPTY_PAGE: PageResponse<AdminDonorResponse> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

const formatBloodType = (value?: string | null): string => {
  if (!value) {
    return "Unknown";
  }

  const symbols: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A−",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B−",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB−",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O−",
  };

  return symbols[value] ?? value;
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

const AdminDonorsPage = () => {
  const [pageData, setPageData] =
    useState<PageResponse<AdminDonorResponse>>(EMPTY_PAGE);

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [changingDonorId, setChangingDonorId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [donorConfirmation, setDonorConfirmation] =
    useState<DonorConfirmation | null>(null);

  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  const loadDonors = useCallback(async (): Promise<void> => {
    setLoading(true);

    setErrorMessage("");

    try {
      const result = await searchAdminDonors({
        search,
        page,
        size: 10,
      });

      setPageData(result);
    } catch (error) {
      console.error("Failed to load donors:", error);

      setPageData(EMPTY_PAGE);

      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void loadDonors();
  }, [loadDonors]);

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

    setErrorMessage("");

    setSuccessMessage("");
  };

  const handleAccountChange = (donor: AdminDonorResponse): void => {
    const action: AccountAction = donor.accountLocked ? "unlock" : "lock";

    setErrorMessage("");

    setSuccessMessage("");

    setDonorConfirmation({
      donor,
      action,
    });
  };
  const performDonorAccountAction = async (
    donor: AdminDonorResponse,
    action: AccountAction,
  ): Promise<void> => {
    try {
      setIsUpdatingAccount(true);

      setChangingDonorId(donor.donorId);

      setErrorMessage("");

      setSuccessMessage("");

      const result =
        action === "lock"
          ? await lockDonor(donor.donorId)
          : await unlockDonor(donor.donorId);

      setSuccessMessage(
        result.message ||
          `${donor.fullName}'s account was successfully ${action === "lock" ? "locked" : "unlocked"}.`,
      );

      setDonorConfirmation(null);

      await loadDonors();
    } catch (error) {
      console.error(`Failed to ${action} donor:`, error);

      setErrorMessage(getErrorMessage(error));

      setDonorConfirmation(null);
    } finally {
      setChangingDonorId(null);

      setIsUpdatingAccount(false);
    }
  };

  const closeConfirmation = (): void => {
    if (isUpdatingAccount) {
      return;
    }

    setDonorConfirmation(null);
  };

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <UsersRound className="h-6 w-6" />
          </span>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.17em] text-red-600">
              Account management
            </p>

            <h2 className="mt-1.5 text-3xl font-black tracking-[-0.045em] text-slate-950">
              Registered Donors
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              View registered blood donors and control access to the LifeLink
              Donor Portal.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            Registered donors
          </p>

          <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
            {loading ? "..." : pageData.totalElements}
          </p>
        </article>

        <article className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-red-600">
                Donor access
              </p>

              <p className="mt-3 text-base font-black text-red-800">
                Lock and unlock enabled
              </p>
            </div>

            <Droplets className="h-7 w-7 text-red-600" />
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
              placeholder="Search donor name, code, or email"
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

          {(search || searchInput) && (
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
            onClick={() => void loadDonors()}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white transition hover:bg-red-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Donor table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Donor
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Blood Type
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Phone
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Account
                </th>

                <th className="px-4 py-4 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Registered
                </th>

                <th className="px-4 py-4 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">
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
                    Loading registered donors...
                  </td>
                </tr>
              ) : pageData.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <UsersRound className="mx-auto h-9 w-9 text-slate-300" />

                    <p className="mt-3 text-base font-black text-slate-700">
                      No donors found
                    </p>
                  </td>
                </tr>
              ) : (
                pageData.content.map((donor) => {
                  const changing = changingDonorId === donor.donorId;

                  return (
                    <tr
                      key={donor.donorId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-slate-900">
                          {donor.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {donor.email}
                        </p>

                        <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                          {donor.donorCode}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-red-50 px-3 py-1.5 text-sm font-black text-red-600 ring-1 ring-red-100">
                          {formatBloodType(donor.bloodType)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {donor.phoneNumber || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black",
                            donor.accountLocked
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700",
                          ].join(" ")}
                        >
                          {donor.accountLocked ? (
                            <LockKeyhole className="h-3.5 w-3.5" />
                          ) : (
                            <UnlockKeyhole className="h-3.5 w-3.5" />
                          )}

                          {donor.accountLocked ? "Locked" : "Active"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {formatDate(donor.registeredAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleAccountChange(donor)}
                          disabled={changing || isUpdatingAccount}
                          className={[
                            "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black text-white transition disabled:cursor-not-allowed disabled:opacity-60",
                            donor.accountLocked
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-red-600 hover:bg-red-700",
                          ].join(" ")}
                        >
                          {donor.accountLocked ? (
                            <UnlockKeyhole className="h-4 w-4" />
                          ) : (
                            <LockKeyhole className="h-4 w-4" />
                          )}

                          {changing
                            ? "Updating..."
                            : donor.accountLocked
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
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
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
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </footer>
        )}
      </section>

      {/* Lock / unlock confirmation modal */}
      <AlertModal
        open={Boolean(donorConfirmation)}
        type={donorConfirmation?.action === "lock" ? "error" : "success"}
        title={
          donorConfirmation?.action === "lock"
            ? "Lock donor account?"
            : "Unlock donor account?"
        }
        message={
          donorConfirmation
            ? `${
                donorConfirmation.action === "lock" ? "Locking" : "Unlocking"
              } ${donorConfirmation.donor.fullName}'s account will ${
                donorConfirmation.action === "lock"
                  ? "prevent this donor from signing in until the account is unlocked."
                  : "restore access to the LifeLink Donor Portal."
              }`
            : ""
        }
        confirmLabel={
          donorConfirmation?.action === "lock"
            ? "Lock Account"
            : "Unlock Account"
        }
        cancelLabel="Cancel"
        isConfirming={isUpdatingAccount}
        closeOnBackdrop={!isUpdatingAccount}
        onClose={closeConfirmation}
        onConfirm={async () => {
          if (!donorConfirmation) {
            return;
          }

          await performDonorAccountAction(
            donorConfirmation.donor,
            donorConfirmation.action,
          );
        }}
      />
    </div>
  );
};

export default AdminDonorsPage;
