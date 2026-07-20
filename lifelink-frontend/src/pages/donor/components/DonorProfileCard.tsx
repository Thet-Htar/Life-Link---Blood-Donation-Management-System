import { useEffect, useState, type ReactNode } from "react";
import {
  Award,
  CalendarDays,
  Droplet,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  Weight,
} from "lucide-react";
import AvatarUpload from "./ProfileName";
import EditProfileModal from "./EditProfileModel";
import type { DonorProfileResponse } from "../DonorDashboard";
import { getDonorProfile } from "@/services/donorServices";


interface DonorProfileCardProps {
  profile?: DonorProfileResponse | null;
}

const formatBloodType = (bloodType: string): string => {
  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return labels[bloodType] ?? bloodType;
};

const formatDate = (value?: string | null): string => {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const DonorProfileCard = ({ profile }: DonorProfileCardProps) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [donor, setDonor] = useState<DonorProfileResponse | null>(profile ?? null);
  const [isLoading, setIsLoading] = useState(!profile);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setDonor(profile);
      setIsLoading(false);
      setError("");
      return;
    }

    const fetchDonorProfile = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getDonorProfile();
        setDonor(data);
      } catch (err) {
        console.error("Failed to fetch donor profile:", err);
        setError("Unable to load your profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonorProfile();
  }, [profile]);

  const handleProfileUpdated = (updatedProfile: any): void => {
    setDonor(updatedProfile as DonorProfileResponse);
    setOpenEdit(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-sm font-bold text-red-700">{error}</p>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <UserRound className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-600">
          No donor profile found.
        </p>
      </div>
    );
  }

  const address = [
    donor.address.street,
    donor.address.township,
    donor.address.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-28 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 sm:h-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_32%)]" />
        </div>

        <div className="px-4 pb-6 sm:px-6 lg:px-8">
          <div className="-mt-12 flex flex-col items-center text-center">
            <div className="relative rounded-3xl border-4 border-white bg-white shadow-xl">
              <AvatarUpload fullName={donor.fullName} />
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950">
              {donor.fullName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[9px] font-black text-white">
                <Droplet className="h-3 w-3 fill-current" />
                {donor.donorCode}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[9px] font-bold text-slate-500">
                <Award className="h-3 w-3" />
                Donor Badge
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpenEdit(true)}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-extrabold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile Settings
            </button>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ProfilePanel
              icon={<UserRound className="h-4 w-4" />}
              title="Personal Info"
            >
              <InfoItem label="Full name" value={donor.fullName} />

              <InfoItem
                label="Email address"
                value={donor.email}
                icon={<Mail className="h-3.5 w-3.5 text-red-500" />}
              />

              <InfoItem
                label="Phone number"
                value={donor.phone}
                icon={<Phone className="h-3.5 w-3.5 text-red-500" />}
              />
            </ProfilePanel>

            <ProfilePanel
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Health Status"
            >
              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="Blood type"
                  value={formatBloodType(donor.bloodType)}
                  valueClassName="text-red-600"
                />

                <InfoItem
                  label="Weight"
                  value={donor.weightKg ? `${donor.weightKg} kg` : "Not recorded"}
                  icon={<Weight className="h-3.5 w-3.5 text-slate-400" />}
                />

                
                  <InfoItem
                    label="Last donation"
                    value={formatDate(donor.lastDonationDate)}
                    icon={<CalendarDays className="h-3.5 w-3.5 text-red-500" />}
                  />
                  <InfoItem
                    label="Gender"
                    value={donor.gender ?? "Not recorded"}
                    icon={<UserRound className="h-3.5 w-3.5 text-red-500" />}
                  />
                
              </div>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>

                  <div>
                    <p className="text-[10px] font-black text-emerald-700">
                      Eligibility Status
                    </p>

                    <p className="mt-1 text-[9px] font-medium leading-4 text-emerald-700/80">
                      Check your dashboard for your current donation
                      eligibility.
                    </p>
                  </div>
                </div>
              </div>
            </ProfilePanel>

            <ProfilePanel
              icon={<MapPin className="h-4 w-4" />}
              title="Address & Access"
            >
              <div>
                <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                  Current address
                </p>

                <div className="mt-2 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <p className="text-[11px] font-bold leading-5 text-slate-700">
                      {address || "Address not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoItem
                  label="Township"
                  value={donor.address.township || "--"}
                />

                <InfoItem label="City" value={donor.address.city || "--"} />
              </div>
            </ProfilePanel>
          </div>
        </div>
      </section>

      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        profile={donor}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
};

const ProfilePanel = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => {
  return (
    <article className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
          {icon}
        </span>

        <h2 className="text-sm font-black text-slate-950">{title}</h2>
      </div>

      <div className="mt-5 space-y-4">{children}</div>
    </article>
  );
};

const InfoItem = ({
  label,
  value,
  icon,
  valueClassName = "text-slate-800",
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  valueClassName?: string;
}) => {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div
        className={`mt-1 flex items-center gap-2 break-words text-[11px] font-bold ${valueClassName}`}
      >
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};

export default DonorProfileCard;
