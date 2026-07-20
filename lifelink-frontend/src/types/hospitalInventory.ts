import type { BloodType } from "./auth/Auth";

export type BloodUnitStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ISSUED"
  | "EXPIRED"
  | "DISCARDED";

export type BloodUnitSource =
  | "MANUAL_ENTRY"
  | "DONATION_EVENT"
  | "PRIVATE_BOOKING";

export type BloodIssuePurpose =
  | "PATIENT_USE"
  | "EMERGENCY"
  | "SURGERY"
  | "WARD_STOCK"
  | "OTHER";

export type BloodDiscardReason =
  | "EXPIRED"
  | "DAMAGED"
  | "LEAKAGE"
  | "STORAGE_ISSUE"
  | "OTHER";

export type StockLevel = "HEALTHY" | "LOW" | "CRITICAL";

export interface BloodInventoryUnitResponse {
  id: number;
  unitCode: string;
  bloodType: BloodType;
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  status: BloodUnitStatus;
  source: BloodUnitSource;
  storageLocation: string;
  notes: string | null;

  eventRegistrationId: number | null;
  donationEventId: number | null;
  donationEventTitle: string | null;

  privateBookingId: number | null;

  reservedFor: string | null;
  reservationNote: string | null;
  reservedAt: string | null;
  reservedBy: string | null;

  issuePurpose: BloodIssuePurpose | null;
  issuedDepartment: string | null;
  patientReference: string | null;
  receivedBy: string | null;
  issuedAt: string | null;
  issuedBy: string | null;
  issueNote: string | null;

  discardReason: BloodDiscardReason | null;
  discardNote: string | null;
  discardedAt: string | null;
  discardedBy: string | null;

  hospitalId: number;
  hospitalName: string;

  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BloodTypeInventorySummary {
  bloodType: BloodType;
  availableUnits: number;
  reservedUnits: number;
  totalUsableUnits: number;
  stockLevel: StockLevel;
}

export interface BloodInventorySummaryResponse {
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  issuedUnits: number;
  expiredUnits: number;
  discardedUnits: number;
  expiringSoonUnits: number;
  bloodTypes: BloodTypeInventorySummary[];
}

export interface CreateBloodUnitRequest {
  source: BloodUnitSource;

  eventRegistrationId: number | null;
  privateBookingId: number | null;

  unitCode: string;

  bloodType: BloodType | null;

  volumeMl: number;

  collectionDate: string | null;
  expiryDate: string;

  storageLocation: string;
  notes: string | null;
}

export interface EventInventorySourceResponse {
  registrationId: number;
  eventId: number;
  eventTitle: string;

  donorId: number;
  donorCode: string;
  donorName: string;
  donorEmail: string;

  bloodType: BloodType;

  eventDate: string;
  completedAt: string;
}

export interface PrivateBookingInventorySourceResponse {
  bookingId: number;

  donorId: number;
  donorCode: string;
  donorName: string;
  donorEmail?: string;

  bloodType: BloodType;

  bookingDate: string;
  bookingTime?: string | null;
  completedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ReserveBloodUnitRequest {
  reservedFor: string;
  reservationNote: string | null;
}

export interface IssueBloodUnitRequest {
  issuePurpose: BloodIssuePurpose;
  issuedDepartment: string;
  patientReference: string | null;
  receivedBy: string;
  issueNote: string | null;
}

export interface DiscardBloodUnitRequest {
  discardReason: BloodDiscardReason;
  discardNote: string | null;
}

