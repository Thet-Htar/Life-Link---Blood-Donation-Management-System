
import type { DonationCertificateResponse } from "@/types/donationCertificate";
import { ArrowLeft, Check, Copy, LoaderCircle, Printer } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";
import DonationCertificate from "./DonationCertificate";
import { getMyCertificates } from "@/services/donorServices";

const CertificateDetailsPage = () => {
  const navigate = useNavigate();

  const { certificateId } = useParams<{
    certificateId: string;
  }>();

  const [certificate, setCertificate] =
    useState<DonationCertificateResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadCertificate = async () => {
      const parsedCertificateId = Number(certificateId);

      if (!Number.isInteger(parsedCertificateId)) {
        setError("Invalid certificate ID.");

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const certificates = await getMyCertificates();

        const selectedCertificate = certificates.find(
          (item) => item.certificateId === parsedCertificateId,
        );

        if (!selectedCertificate) {
          setError("Certificate was not found.");

          return;
        }

        setCertificate(selectedCertificate);
      } catch {
        setError("Unable to load this certificate.");
      } finally {
        setLoading(false);
      }
    };

    void loadCertificate();
  }, [certificateId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNumber = async () => {
    if (!certificate) {
      return;
    }

    await navigator.clipboard.writeText(certificate.certificateNumber);

    setCopied(true);

    window.setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <LoaderCircle className="h-9 w-9 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="font-bold text-red-700">
          {error ?? "Certificate was not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/donor/certificates")}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
        >
          Back to certificates
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="certificate-toolbar flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate("/donor/certificates")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to certificates
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyNumber}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-600"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}

            {copied ? "Copied" : "Copy certificate number"}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-slate-100 p-3 sm:p-6 print:overflow-visible print:bg-white print:p-0">
        <div className="min-w-[900px] print:min-w-0">
          <DonationCertificate certificate={certificate} />
        </div>
      </div>
    </section>
  );
};

export default CertificateDetailsPage;
