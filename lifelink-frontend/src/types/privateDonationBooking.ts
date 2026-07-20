import type { BloodType } from "./auth/Auth";

export type PrivateDonationBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "NO_SHOW"
  | "DEFERRED";


export interface CreatePrivateDonationBookingRequest {
  hospitalId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  eligibilityDeclarationAccepted: boolean;
  donorNote: string | null;
}

export interface ConfirmPrivateDonationBookingRequest {
  hospitalNote: string | null;
}

export interface CompletePrivateDonationBookingRequest {
  outcomeNote: string | null;
}

export interface DeferPrivateDonationBookingRequest {
  reason: string;
  note: string | null;
}

export interface PrivateDonationBookingResponse {
  bookingId: number;

  donorId: number;
  donorCode: string;
  donorName: string;
  donorEmail: string;
  bloodType: BloodType;

  hospitalId: number;
  hospitalName: string;

  bookingDate: string;
  startTime: string;
  endTime: string;

  status: PrivateDonationBookingStatus;

  donorNote: string | null;
  hospitalNote: string | null;

  eligibilityDeclarationAccepted: boolean;
  eligibilityDeclarationAcceptedAt: string | null;

  confirmedAt: string | null;
  confirmedBy: string | null;

  completedAt: string | null;
  completedBy: string | null;

  noShowAt: string | null;
  noShowMarkedBy: string | null;

  deferredAt: string | null;
  deferredBy: string | null;
  deferralReason: string | null;

  outcomeNote: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface PrivateBookingInventorySourceResponse {
  bookingId: number;

  donorId: number;
  donorCode: string;
  donorName: string;
  donorEmail: string;
  bloodType: BloodType;

  bookingDate: string;
  completedAt: string;
}

export interface PrivateBookingHospitalResponse {
  hospitalId: number;
  hospitalName: string;
  city?: string | null;
  township?: string | null;
  address?: string | null;
}
