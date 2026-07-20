import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Award,
  Eye,
  FileCheck2,
  Filter,
  LoaderCircle,
  Search,
  ShieldAlert,
} from "lucide-react";


import type { DonationCertificateResponse } from "@/types/donationCertificate";
import { getHospitalCertificates } from "@/services/hospital/hospitalCertificateService";

type CertificateStatus =
  | "ACTIVE"
  | "REVOKED";

type StatusFilter =
  | "ALL"
  | CertificateStatus;

const formatDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(
    `${value.slice(0, 10)}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatDateTime = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatBloodType = (
  bloodType: string,
): string => {
  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A−",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B−",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB−",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O−",
  };

  return (
    labels[bloodType] ??
    bloodType.replaceAll("_", " ")
  );
};

const getErrorMessage = (
  error: unknown,
): string => {
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
    "Unable to load hospital certificates."
  );
};

const statusClassName = (
  status: CertificateStatus,
): string => {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700";
  }

  return "bg-red-50 text-red-700";
};

const HospitalCertificatesPage = () => {
  const navigate = useNavigate();

  const [
    certificates,
    setCertificates,
  ] = useState<
    DonationCertificateResponse[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>("ALL");

  useEffect(() => {
    const loadCertificates =
      async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const data =
            await getHospitalCertificates();

          setCertificates(data);
        } catch (loadError) {
          console.error(
            "Unable to load hospital certificates:",
            loadError,
          );

          setError(
            getErrorMessage(loadError),
          );
        } finally {
          setLoading(false);
        }
      };

    void loadCertificates();
  }, []);

  const summary = useMemo(() => {
    const active = certificates.filter(
      (certificate) =>
        certificate.status === "ACTIVE",
    ).length;

    const revoked = certificates.filter(
      (certificate) =>
        certificate.status === "REVOKED",
    ).length;

    return {
      total: certificates.length,
      active,
      revoked,
    };
  }, [certificates]);

  const filteredCertificates =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return certificates.filter(
        (certificate) => {
          const matchesStatus =
            statusFilter === "ALL" ||
            certificate.status ===
              statusFilter;

          const searchableValues = [
            certificate.certificateNumber,
            certificate.donorName,
            certificate.donorCode,
            certificate.eventTitle,
            certificate.hospitalName,
            certificate.bloodType,
          ];

          const matchesSearch =
            !normalizedSearch ||
            searchableValues.some(
              (value) =>
                String(value ?? "")
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            );

          return (
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      certificates,
      searchTerm,
      statusFilter,
    ]);

  return (
    <section className="min-h-full bg-white">
      {/* Page heading */}
      <header className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-50 text-red-600">
            <Award className="h-5 w-5" />
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
              Donor recognition
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              Donor Certificates
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Search and review certificates
              issued after completed donations.
            </p>
          </div>
        </div>
      </header>

      {/* Compact summary */}
      {/* <div className="grid border-b border-slate-200 sm:grid-cols-3">
        <SummaryItem
          label="Total Certificates"
          value={summary.total}
          valueClassName="text-slate-950"
        />

        <SummaryItem
          label="Active"
          value={summary.active}
          valueClassName="text-emerald-700"
        />

        <SummaryItem
          label="Revoked"
          value={summary.revoked}
          valueClassName="text-red-700"
        />
      </div> */}

      {/* Error */}
      {error && (
        <div className="mx-4 mt-5 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-6">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <section className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-red-600" />

          <h2 className="text-sm font-black text-slate-950">
            Certificate Filters
          </h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search certificate, donor, code or event"
              className="h-10 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter,
              )
            }
            className="h-10 border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-red-500"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="REVOKED">
              Revoked
            </option>
          </select>
        </div>
      </section>

      {/* Table heading */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-sm font-black text-slate-950">
            Certificate Records
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Showing{" "}
            {filteredCertificates.length} of{" "}
            {certificates.length} certificates
          </p>
        </div>
      </div>

      {/* Certificate table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              <th className="px-4 py-3 sm:px-6">
                Certificate
              </th>

              <th className="px-4 py-3">
                Donor
              </th>

              <th className="px-4 py-3">
                Blood
              </th>

              <th className="px-4 py-3">
                Donation Event
              </th>

              <th className="px-4 py-3">
                Donation Date
              </th>

              <th className="px-4 py-3">
                Issued At
              </th>

              <th className="px-4 py-3">
                Status
              </th>

              <th className="px-4 py-3 text-right sm:px-6">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={8}
                  className="border-b border-slate-200 px-6 py-16 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                    <LoaderCircle className="h-5 w-5 animate-spin text-red-600" />

                    Loading certificates...
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filteredCertificates.map(
                (certificate) => (
                  <tr
                    key={
                      certificate.certificateId
                    }
                    className="border-b border-slate-200 text-sm transition hover:bg-red-50/30"
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-red-50 text-red-600">
                          <Award className="h-4 w-4" />
                        </span>

                        <div>
                          <p className="whitespace-nowrap text-xs font-black text-red-700">
                            {
                              certificate.certificateNumber
                            }
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            ID #
                            {
                              certificate.certificateId
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap font-bold text-slate-900">
                        {
                          certificate.donorName
                        }
                      </p>

                      <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-slate-500">
                        Donor code:{" "}
                        {
                          certificate.donorCode
                        }
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex min-w-9 items-center justify-center bg-red-50 px-2 py-1 text-xs font-black text-red-700">
                        {formatBloodType(
                          certificate.bloodType,
                        )}
                      </span>
                    </td>

                    <td className="max-w-[230px] px-4 py-3">
                      <p className="truncate font-semibold text-slate-800">
                        {
                          certificate.eventTitle
                        }
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {
                          certificate.hospitalName
                        }
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(
                        certificate.donationDate,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(
                        certificate.issuedAt,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-wide ${statusClassName(
                          certificate.status as CertificateStatus,
                        )}`}
                      >
                        {certificate.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/hospital/certificates/${certificate.certificateId}`,
                          )
                        }
                        className="inline-flex items-center gap-1.5 font-black text-red-600 transition hover:text-red-800"
                      >
                        <Eye className="h-3.5 w-3.5" />

                        View
                      </button>
                    </td>
                  </tr>
                ),
              )}

            {!loading &&
              !error &&
              filteredCertificates.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="border-b border-slate-200 px-6 py-16 text-center"
                  >
                    <FileCheck2 className="mx-auto h-8 w-8 text-red-200" />

                    <p className="mt-3 text-sm font-black text-slate-700">
                      No certificates found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Change the search or
                      status filter.
                    </p>
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

interface SummaryItemProps {
  label: string;
  value: number;
  valueClassName: string;
}

const SummaryItem = ({
  label,
  value,
  valueClassName,
}: SummaryItemProps) => {
  return (
    <div className="border-b border-slate-200 px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-6 sm:last:border-r-0">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-black ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

export default HospitalCertificatesPage;