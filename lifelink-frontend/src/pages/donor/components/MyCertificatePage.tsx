import { getMyCertificates } from "@/services/donorServices";
import type { DonationCertificateResponse } from "@/types/donationCertificate";
import {
  Award,
  CalendarDays,
  ChevronRight,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const MyCertificatesPage = () => {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState<
    DonationCertificateResponse[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyCertificates();

        setCertificates(data);
      } catch {
        setError("Unable to load your certificates.");
      } finally {
        setLoading(false);
      }
    };

    void loadCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
          Recognition
        </p>

        <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">
          My Certificates
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500">
          View and print certificates earned from your completed blood
          donations.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {!error && certificates.length === 0 && (
        <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Award className="h-8 w-8" />
          </span>

          <h2 className="mt-5 text-lg font-black text-slate-950">
            No certificates yet
          </h2>

          <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
            A certificate will appear here after a hospital confirms your
            completed donation.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {certificates.map((certificate) => {
          const isActive = certificate.status === "ACTIVE";

          return (
            <button
              key={certificate.certificateId}
              type="button"
              onClick={() =>
                navigate(`/donor/certificates/${certificate.certificateId}`)
              }
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-50" />

              <div className="relative flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Award className="h-6 w-6" />
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                    isActive
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-red-100 bg-red-50 text-red-700"
                  }`}
                >
                  {certificate.status}
                </span>
              </div>

              <div className="relative mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Certificate of Appreciation
                </p>

                <h2 className="mt-2 text-lg font-black text-slate-950">
                  {certificate.eventTitle}
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {certificate.hospitalName}
                </p>
              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CalendarDays className="h-4 w-4 text-red-600" />

                    {formatDate(certificate.donationDate)}
                  </div>

                  <p className="mt-2 text-[10px] font-black tracking-wide text-red-700">
                    {certificate.certificateNumber}
                  </p>
                </div>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition group-hover:bg-red-600 group-hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MyCertificatesPage;
