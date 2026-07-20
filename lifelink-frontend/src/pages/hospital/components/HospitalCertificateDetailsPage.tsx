import DonationCertificate from "@/pages/donor/components/DonationCertificate";
import { getHospitalCertificates, revokeHospitalCertificate } from "@/services/hospital/hospitalCertificateService";
import type { DonationCertificateResponse } from "@/types/donationCertificate";
import {
  ArrowLeft,
  Check,
  Copy,
  LoaderCircle,
  Printer,
  ShieldAlert,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";


const HospitalCertificateDetailsPage =
  () => {
    const navigate = useNavigate();

    const { certificateId } =
      useParams<{
        certificateId: string;
      }>();

    const [
      certificate,
      setCertificate,
    ] = useState<
      DonationCertificateResponse | null
    >(null);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [copied, setCopied] =
      useState(false);

    const [
      showRevokeForm,
      setShowRevokeForm,
    ] = useState(false);

    const [
      revokeReason,
      setRevokeReason,
    ] = useState("");

    const [
      revoking,
      setRevoking,
    ] = useState(false);

    const [
      revokeError,
      setRevokeError,
    ] = useState<string | null>(
      null,
    );

    useEffect(() => {
      const loadCertificate =
        async () => {
          const parsedId =
            Number(certificateId);

          if (
            !Number.isInteger(
              parsedId,
            )
          ) {
            setError(
              "Invalid certificate ID.",
            );

            setLoading(false);
            return;
          }

          try {
            setLoading(true);
            setError(null);

            const certificates =
              await getHospitalCertificates();

            const selected =
              certificates.find(
                (item) =>
                  item.certificateId ===
                  parsedId,
              );

            if (!selected) {
              setError(
                "Certificate was not found.",
              );

              return;
            }

            setCertificate(selected);
          } catch {
            setError(
              "Unable to load this certificate.",
            );
          } finally {
            setLoading(false);
          }
        };

      void loadCertificate();
    }, [certificateId]);

    const handlePrint = () => {
      window.print();
    };

    const handleCopyNumber =
      async () => {
        if (!certificate) {
          return;
        }

        await navigator.clipboard.writeText(
          certificate.certificateNumber,
        );

        setCopied(true);

        window.setTimeout(
          () => setCopied(false),
          1800,
        );
      };

    const handleRevoke =
      async () => {
        if (!certificate) {
          return;
        }

        const normalizedReason =
          revokeReason.trim();

        if (!normalizedReason) {
          setRevokeError(
            "Revoke reason is required.",
          );

          return;
        }

        if (
          normalizedReason.length > 500
        ) {
          setRevokeError(
            "Reason must not exceed 500 characters.",
          );

          return;
        }

        try {
          setRevoking(true);
          setRevokeError(null);

          const updatedCertificate =
            await revokeHospitalCertificate(
              certificate.certificateId,
              {
                reason:
                  normalizedReason,
              },
            );

          setCertificate(
            updatedCertificate,
          );

          setShowRevokeForm(false);
          setRevokeReason("");
        } catch {
          setRevokeError(
            "Unable to revoke this certificate.",
          );
        } finally {
          setRevoking(false);
        }
      };

    if (loading) {
      return (
        <div className="flex min-h-[500px] items-center justify-center">
          <LoaderCircle className="h-9 w-9 animate-spin text-red-600" />
        </div>
      );
    }

    if (
      error ||
      !certificate
    ) {
      return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="font-bold text-red-700">
            {error ??
              "Certificate was not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/hospital/certificates",
              )
            }
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
          >
            Back to certificates
          </button>
        </div>
      );
    }

    const isActive =
      certificate.status ===
      "ACTIVE";

    return (
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/hospital/certificates",
              )
            }
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to certificates
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                handleCopyNumber
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-600"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              {copied
                ? "Copied"
                : "Copy number"}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>

            {isActive && (
              <button
                type="button"
                onClick={() => {
                  setShowRevokeForm(
                    true,
                  );

                  setRevokeError(
                    null,
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <ShieldAlert className="h-4 w-4" />
                Revoke certificate
              </button>
            )}
          </div>
        </div>

        {!isActive && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 print:hidden">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="font-black text-red-800">
                  This certificate has
                  been revoked
                </p>

                <p className="mt-1 text-sm font-medium text-red-700">
                  {certificate.revokeReason ??
                    "No revoke reason was recorded."}
                </p>

                {certificate.revokedAt && (
                  <p className="mt-2 text-xs font-semibold text-red-600/70">
                    Revoked at:{" "}
                    {new Date(
                      certificate.revokedAt,
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl bg-slate-100 p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0">
          <div className="min-w-[900px] print:min-w-0">
            <DonationCertificate
              certificate={
                certificate
              }
            />
          </div>
        </div>

        {showRevokeForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm print:hidden">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                    Certificate action
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Revoke certificate
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    The certificate will
                    remain in the system,
                    but it will be marked
                    as no longer valid.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRevokeForm(
                      false,
                    );

                    setRevokeError(
                      null,
                    );
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Certificate
                </p>

                <p className="mt-1 text-sm font-black text-slate-900">
                  {
                    certificate.certificateNumber
                  }
                </p>

                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {
                    certificate.donorName
                  }
                </p>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-black text-slate-800">
                  Revoke reason
                </span>

                <textarea
                  value={revokeReason}
                  onChange={(event) => {
                    setRevokeReason(
                      event.target.value,
                    );

                    setRevokeError(
                      null,
                    );
                  }}
                  rows={5}
                  maxLength={500}
                  placeholder="Explain why this certificate is being revoked..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                />

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-600">
                    {revokeError}
                  </span>

                  <span className="text-xs font-semibold text-slate-400">
                    {
                      revokeReason.length
                    }
                    /500
                  </span>
                </div>
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={revoking}
                  onClick={() =>
                    setShowRevokeForm(
                      false,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    revoking ||
                    !revokeReason.trim()
                  }
                  onClick={() =>
                    void handleRevoke()
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {revoking && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}

                  Confirm revoke
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

export default HospitalCertificateDetailsPage;