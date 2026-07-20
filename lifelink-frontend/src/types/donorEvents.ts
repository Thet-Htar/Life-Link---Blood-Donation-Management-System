import type { BloodType } from "./auth/Auth";


export type DonorEventMatchType =
  | "SAME_TOWNSHIP"
  | "SAME_CITY"
  | "OTHER_CITY";

export type DonationEventRegistrationStatus =
  | "REGISTERED"
  | "COMPLETED"
  | "CANCELLED";

export interface DonorEventResponse {
  id: number;

  eventTitle: string;
  description: string;
  hospitalName: string;

  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;

  requiredBloodTypes: BloodType[];


  contactPersonName: string;
  contactPhone: string;

  street: string;
  township: string;
  city: string;

  targetDonorCount: number;

  registeredDonorCount: number;
  remainingSlots: number;

  registrationFull: boolean;
  alreadyRegistered: boolean;

  matchType: DonorEventMatchType;
}

export interface DonorEventRegistrationResponse {
  registrationId: number;

  eventId: number;
  eventTitle: string;
  hospitalName: string;

  eventDate: string;
  startTime: string;
  endTime: string;

  street: string;
  township: string;
  city: string;

  status: DonationEventRegistrationStatus;

  registeredAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
}

export const MATCH_TYPE_LABELS: Record<
  DonorEventMatchType,
  string
> = {
  SAME_TOWNSHIP: "Near You",
  SAME_CITY: "Same City",
  OTHER_CITY: "Other City",
};

export const REGISTRATION_STATUS_LABELS: Record<
  DonationEventRegistrationStatus,
  string
> = {
  REGISTERED: "Registered",
  COMPLETED: "Donation Completed",
  CANCELLED: "Cancelled",
};