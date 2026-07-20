import {
  Award,
  Building2,
  CalendarDays,
  Droplet,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import type { DonationCertificateResponse } from "@/types/donationCertificate";

interface DonationCertificateProps {
  certificate: DonationCertificateResponse;
}

const formatDate = (value: string): string => {
  const parsedDate = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
};

const formatBloodType = (bloodType: string): string => {
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

  return labels[bloodType] ?? bloodType.replaceAll("_", " ");
};

const DonationCertificate = ({ certificate }: DonationCertificateProps) => {
  const isRevoked = certificate.status === "REVOKED";

  return (
    <article
      id="donation-certificate"
      className="relative mx-auto aspect-[297/210] w-full max-w-[1120px] overflow-hidden bg-[#fffdf7] font-serif text-slate-900 shadow-2xl print:h-[210mm] print:w-[297mm] print:max-w-none print:shadow-none"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[40px] border-red-50/80" />

        <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full border-[48px] border-amber-50/90" />

        <Droplet className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 fill-red-600/[0.025] text-red-600/[0.025]" />
      </div>

      {/* Outer border */}
      <div className="absolute inset-[14px] border-[3px] border-red-800" />

      <div className="absolute inset-[23px] border border-amber-500/80" />

      <div className="absolute inset-[29px] border border-red-800/30" />

      {/* Corner ornaments */}
      <div className="absolute left-[14px] top-[14px] h-16 w-16 border-l-[7px] border-t-[7px] border-amber-500" />

      <div className="absolute right-[14px] top-[14px] h-16 w-16 border-r-[7px] border-t-[7px] border-amber-500" />

      <div className="absolute bottom-[14px] left-[14px] h-16 w-16 border-b-[7px] border-l-[7px] border-amber-500" />

      <div className="absolute bottom-[14px] right-[14px] h-16 w-16 border-b-[7px] border-r-[7px] border-amber-500" />

      {/* Certificate content */}
      <div className="relative z-10 flex h-full flex-col px-[7%] py-[5%]">
        {/* Header */}
        <header className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-700 text-white shadow-md">
              <Droplet className="h-6 w-6 fill-current" />
            </span>

            <div className="text-left">
              <p className="font-sans text-2xl font-black tracking-[-0.04em] text-red-800">
                LifeLink
              </p>

              <p className="font-sans text-[9px] font-bold uppercase tracking-[0.28em] text-amber-700">
                Give blood. Give hope.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-md items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500" />

            <Award className="h-5 w-5 text-amber-600" />

            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500" />
          </div>

          <p className="mt-4 font-sans text-[10px] font-black uppercase tracking-[0.42em] text-red-700">
            Certificate of Appreciation
          </p>

          <h1 className="mt-2 text-[clamp(1.7rem,4vw,3.6rem)] font-bold uppercase tracking-[0.08em] text-slate-950">
            Blood Donation
          </h1>
        </header>

        {/* Recipient */}
        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            This certificate is proudly presented to
          </p>

          <h2 className="mt-3 max-w-[85%] border-b-2 border-amber-500/70 px-10 pb-2 text-[clamp(2rem,5vw,4.4rem)] font-bold leading-none tracking-[-0.04em] text-red-800">
            {certificate.donorName}
          </h2>

          <p className="mt-5 max-w-3xl text-[clamp(0.75rem,1.5vw,1.15rem)] font-medium leading-relaxed text-slate-700">
            In recognition of your voluntary blood donation and compassionate
            contribution to supporting patients and saving lives within our
            community.
          </p>

          {/* Donation details */}
          <div className="mt-7 grid w-full max-w-4xl grid-cols-2 gap-x-8 gap-y-4 font-sans md:grid-cols-4">
            <div className="border-r border-amber-200 px-3 last:border-r-0">
              <Droplet className="mx-auto h-5 w-5 fill-red-700 text-red-700" />

              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Blood type
              </p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {formatBloodType(certificate.bloodType)}
              </p>
            </div>

            <div className="border-r border-amber-200 px-3 last:border-r-0">
              <CalendarDays className="mx-auto h-5 w-5 text-red-700" />

              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Donation date
              </p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {formatDate(certificate.donationDate)}
              </p>
            </div>

            <div className="border-r border-amber-200 px-3 last:border-r-0">
              <HeartHandshake className="mx-auto h-5 w-5 text-red-700" />

              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Donation event
              </p>

              <p className="mt-1 line-clamp-2 text-sm font-black text-slate-900">
                {certificate.eventTitle}
              </p>
            </div>

            <div className="px-3">
              <Building2 className="mx-auto h-5 w-5 text-red-700" />

              <p className="mt-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
                Hospital
              </p>

              <p className="mt-1 line-clamp-2 text-sm font-black text-slate-900">
                {certificate.hospitalName}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="grid grid-cols-[1fr_auto_1fr] items-end gap-6 font-sans">
          <div>
            <div className="w-44 border-b border-slate-500" />

            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Authorized signature
            </p>

            <p className="mt-1 text-[10px] font-semibold text-slate-700">
              {certificate.hospitalName}
            </p>
          </div>

          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-500 bg-white text-red-700 shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </span>

            <p className="mt-2 text-[8px] font-black uppercase tracking-[0.16em] text-amber-700">
              Official LifeLink Certificate
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
              Certificate number
            </p>

            <p className="mt-1 text-xs font-black tracking-wide text-red-800">
              {certificate.certificateNumber}
            </p>

            <p className="mt-2 text-[8px] font-semibold text-slate-500">
              Verify this certificate using the certificate number on the
              LifeLink verification page.
            </p>
          </div>
        </footer>
      </div>

      {/* Revoked overlay */}
      {isRevoked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
          <div className="-rotate-12 border-[8px] border-red-700 px-12 py-5 text-center text-6xl font-black uppercase tracking-[0.18em] text-red-700">
            Revoked
          </div>
        </div>
      )}
    </article>
  );
};

export default DonationCertificate;
