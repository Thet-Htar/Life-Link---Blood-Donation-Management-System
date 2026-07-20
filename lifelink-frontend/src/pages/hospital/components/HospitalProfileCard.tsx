import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Clock3,
  FileBadge2,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import EditHospitalProfileModal from "./EditHospitalProfileModal";
import type { HospitalProfileResponse, HospitalVerificationStatus } from "@/types/profile";
import { getHospitalProfile } from "@/services/hospital/hospitalProfileService";

const HospitalProfileCard = () => {
  const [
    hospital,
    setHospital,
  ] = useState<HospitalProfileResponse | null>(
    null,
  );

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadHospitalProfile =
    async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        const profile =
          await getHospitalProfile();

        setHospital(profile);
      } catch (error) {
        console.error(
          "Failed to load hospital profile:",
          error,
        );

        setError(
          "Unable to load the hospital profile. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void loadHospitalProfile();
  }, []);

  const handleProfileUpdated = (
    updatedProfile: HospitalProfileResponse,
  ): void => {
    setHospital(updatedProfile);
    setOpenEditModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />

          <p className="mt-3 text-xs font-bold text-slate-500">
            Loading hospital profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
        <TriangleAlert className="h-9 w-9 text-red-500" />

        <h2 className="mt-4 text-lg font-black text-red-800">
          Profile could not be loaded
        </h2>

        <p className="mt-2 max-w-sm text-xs font-medium leading-5 text-red-700/80">
          {error}
        </p>

        <button
          type="button"
          onClick={() => {
            void loadHospitalProfile();
          }}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-[10px] font-black text-white transition hover:bg-red-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Building2 className="mx-auto h-9 w-9 text-slate-300" />

        <p className="mt-3 text-sm font-bold text-slate-600">
          Hospital profile was not found.
        </p>
      </div>
    );
  }

  const verification =
    verificationStyles[
      hospital.verificationStatus
    ];

  const fullAddress = [
    hospital.address?.street,
    hospital.address?.township,
    hospital.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const hospitalInitials =
    hospital.hospitalName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-36 overflow-hidden bg-gradient-to-r from-red-800 via-red-600 to-rose-500 sm:h-44">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.95) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />

          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full border-[36px] border-white/5" />

          <div className="absolute right-5 top-5 sm:right-7">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black backdrop-blur-md ${
                hospital.enabled
                  ? "border-emerald-300/30 bg-emerald-400/20 text-emerald-50"
                  : "border-red-300/30 bg-red-950/30 text-red-100"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hospital.enabled
                    ? "bg-emerald-300"
                    : "bg-red-300"
                }`}
              />

              {hospital.enabled
                ? "Account active"
                : "Account disabled"}
            </span>
          </div>
        </div>

        <div className="px-4 pb-7 sm:px-6 lg:px-8">
          <div className="-mt-14 flex flex-col items-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-white shadow-xl">
              <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-gradient-to-br from-red-50 to-rose-100 text-2xl font-black text-red-700">
                {hospitalInitials}
              </div>

              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
              Registered healthcare institution
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
              {hospital.hospitalName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black ${verification.className}`}
              >
                {verification.icon}
                {verification.label}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-500">
                <FileBadge2 className="h-3.5 w-3.5" />
                {hospital.hospitalLicenseCode}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpenEditModal(true)
              }
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Hospital Profile
            </button>
          </div>

          <div
            className={`mx-auto mt-7 flex max-w-3xl items-start gap-3 rounded-2xl border p-4 ${verification.className}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
              {verification.icon}
            </span>

            <div>
              <p className="text-[10px] font-black">
                {verification.label}
              </p>

              <p className="mt-1 text-[9px] font-semibold leading-4 opacity-80">
                {verification.description}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ProfilePanel
              icon={
                <Building2 className="h-4 w-4" />
              }
              title="Hospital Information"
            >
              <InfoItem
                label="Hospital name"
                value={hospital.hospitalName}
              />

              <InfoItem
                label="License code"
                value={
                  hospital.hospitalLicenseCode
                }
                icon={
                  <FileBadge2 className="h-3.5 w-3.5 text-red-500" />
                }
              />

              <InfoItem
                label="Representative staff"
                value={
                  hospital.representativeStaffName
                }
                icon={
                  <UserRound className="h-3.5 w-3.5 text-red-500" />
                }
              />
            </ProfilePanel>

            <ProfilePanel
              icon={
                <Phone className="h-4 w-4" />
              }
              title="Contact Information"
            >
              <InfoItem
                label="Login email"
                value={hospital.email}
                icon={
                  <Mail className="h-3.5 w-3.5 text-red-500" />
                }
              />

              <InfoItem
                label="Phone number"
                value={
                  hospital.phone ||
                  "Not provided"
                }
                icon={
                  <Phone className="h-3.5 w-3.5 text-red-500" />
                }
              />

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Account ownership
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">
                    <UserRound className="h-3.5 w-3.5" />
                  </span>

                  <p className="text-[10px] font-bold text-slate-700">
                    One staff account for this hospital
                  </p>
                </div>
              </div>
            </ProfilePanel>

            <ProfilePanel
              icon={
                <MapPin className="h-4 w-4" />
              }
              title="Address & Security"
            >
              <div>
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Hospital address
                </p>

                <div className="mt-2 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <p className="text-[11px] font-bold leading-5 text-slate-700">
                      {fullAddress ||
                        "Address not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoItem
                  label="Township"
                  value={
                    hospital.address
                      ?.township || "--"
                  }
                />

                <InfoItem
                  label="City"
                  value={
                    hospital.address?.city ||
                    "--"
                  }
                />
              </div>
            </ProfilePanel>
          </div>
        </div>
      </section>

      <EditHospitalProfileModal
        open={openEditModal}
        profile={hospital}
        onClose={() =>
          setOpenEditModal(false)
        }
        onProfileUpdated={
          handleProfileUpdated
        }
      />
    </>
  );
};

const verificationStyles: Record<
  HospitalVerificationStatus,
  {
    label: string;
    description: string;
    className: string;
    icon: ReactNode;
  }
> = {
  APPROVED: {
    label: "Approved Hospital",
    description:
      "This hospital account has been verified and approved by the LifeLink administration team.",
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: (
      <BadgeCheck className="h-4 w-4" />
    ),
  },

  PENDING: {
    label: "Application Under Review",
    description:
      "The hospital application is currently waiting for administrator approval.",
    className:
      "border-amber-100 bg-amber-50 text-amber-700",
    icon: (
      <Clock3 className="h-4 w-4" />
    ),
  },

  REJECTED: {
    label: "Application Not Approved",
    description:
      "This hospital application was not approved. Please contact LifeLink support.",
    className:
      "border-red-100 bg-red-50 text-red-700",
    icon: (
      <TriangleAlert className="h-4 w-4" />
    ),
  },
};

interface ProfilePanelProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

const ProfilePanel = ({
  icon,
  title,
  children,
}: ProfilePanelProps) => {
  return (
    <article className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
          {icon}
        </span>

        <h2 className="text-sm font-black text-slate-950">
          {title}
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </article>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  icon?: ReactNode;
}

const InfoItem = ({
  label,
  value,
  icon,
}: InfoItemProps) => {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2 break-words text-[11px] font-bold text-slate-800">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};

export default HospitalProfileCard;