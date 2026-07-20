import type { BloodType } from "./auth/Auth";
import type { Address } from "./User";

export type DonationEventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED"
  | "CANCELLED";

export interface DonationEventAddress {
  street: string;
  township: string;
  city: string;
}

export interface DonationEventFormData {
  eventTitle: string;
  targetDonorCount: number;
  description: string;

  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;

  requiredBloodTypes: BloodType[];

  contactPersonName: string;
  contactPhone: string;

  address: DonationEventAddress;
}

export interface DonationEventListItem extends DonationEventFormData {
  id: number;
  hospitalName: string;
  status: DonationEventStatus;
  registeredDonors: number;
  createdAt: string;
}

export interface DonationEventFormErrors {
  eventTitle?: string;
  targetDonorCount?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  requiredBloodTypes?: string;
  contactPersonName?: string;
  contactPhone?: string;
  street?: string;
  township?: string;
  city?: string;
}

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export type DonationEventRegistrationStatus =
  | "REGISTERED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "DEFERRED";

export type DonationDeferralReason =
  | "LOW_HEMOGLOBIN"
  | "RECENT_DONATION"
  | "UNDERWEIGHT"
  | "AGE_REQUIREMENT"
  | "CURRENT_ILLNESS"
  | "MEDICATION"
  | "VITAL_SIGNS"
  | "OTHER";

export interface RegisteredEventDonorResponse {
  registrationId: number;
  donorId: number;
  donorCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  bloodType: string;

  status: DonationEventRegistrationStatus;

  registeredAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  noShowAt: string | null;
  deferredAt: string | null;

  deferralReason: DonationDeferralReason | null;
  outcomeNote: string | null;
}

export interface DeferDonationRequest {
  reason: DonationDeferralReason;
  note?: string;
}

export interface DonationEventRequest {
  eventTitle: string;
  targetDonorCount: number | null;
  description: string | null;

  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;

  requiredBloodTypes: BloodType[];

  contactPersonName: string | null;
  contactPhone: string | null;

  address: Address | null;
}

export interface DonationEventResponse {
  id: number;
  hospitalName: string;

  eventTitle: string;
  targetDonorCount: number | null;
  description: string;

  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  registrationDeadline: string | null;

  requiredBloodTypes: BloodType[];

  contactPersonName: string;
  contactPhone: string;

  address: Address;

  status: DonationEventStatus;

  registeredDonors: number;
  editable: boolean;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface RegisteredEventDonorResponse {
  registrationId: number;
  donorId: number;
  donorCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  bloodType: string;

  status: DonationEventRegistrationStatus;

  registeredAt: string;

  cancelledAt: string | null;
  completedAt: string | null;
  noShowAt: string | null;
  deferredAt: string | null;

  deferralReason: DonationDeferralReason | null;

  outcomeNote: string | null;
}

export interface DeferDonationRequest {
  reason: DonationDeferralReason;
  note?: string;
}

export interface PublicDonationEvent {
  id: number;

  hospitalName: string;
  eventTitle: string;
  description: string;

  eventDate: string;
  startTime: string | null;
  endTime: string | null;

  requiredBloodTypes: string[];

  street: string;
  township: string;
  city: string;

  targetDonorCount: number | null;
}
