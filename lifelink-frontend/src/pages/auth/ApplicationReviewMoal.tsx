import {
  ArrowRight,
  Clock3,
  ShieldCheck,
} from "lucide-react";

interface ApplicationReviewModalProps {
  onBackHome: () => void;
}

const ApplicationReviewModal = ({
  onBackHome,
}: ApplicationReviewModalProps) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-review-title"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white p-6 text-center shadow-[0_30px_100px_-30px_rgba(15,23,42,0.8)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-50" />

        <div className="pointer-events-none absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-red-50" />

        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/25">
            <Clock3
              className="h-8 w-8"
              strokeWidth={2.7}
            />
          </div>

          <h2
            id="application-review-title"
            className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950"
          >
            Application
            <br />
            Under Review
          </h2>

          <p className="mx-auto mt-3 max-w-[290px] text-xs font-medium leading-5 text-slate-500">
            Your account has not been approved
            yet. Our administrator is reviewing
            your application.
          </p>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-bold leading-5 text-amber-800">
              Please wait for approval before
              signing in. You will be able to
              access your dashboard once the
              application is approved.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackHome}
            className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c90b27] to-[#730010] text-sm font-extrabold text-white shadow-lg shadow-red-700/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-red-200"
          >
            Back to Home

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            LifeLink account verification
          </div>
        </div>
      </div>
    </div>
  );
};