import type { BloodType } from "./Auth";


export type VerificationStatus = "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface AdminHospitalActionResponse {
  message: string;
}

export interface AdminHospitalResponse {
  hospitalId: number;
  userId: number;

  hospitalName: string;
  hospitalLicenseCode: string;
  representativeStaffName: string;
  email: string;

  verificationStatus: VerificationStatus;
  accountLocked: boolean;

  registeredAt: string | null;
  verifiedAt: string | null;
  remarks: string | null;
}

export interface AdminHospitalApprovalResponse {
  status: VerificationStatus;
  message: string;
}

export interface AdminDonorResponse {
  donorId: number;
  userId: number;

  donorCode: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  bloodType: BloodType | null;

  accountLocked: boolean;
  registeredAt: string | null;
}

export interface AdminDonorActionResponse {
  message: string;
}

export interface PageResponse<T> {
  content: T[];

  totalElements: number;
  totalPages: number;

  number: number;
  size: number;

  first: boolean;
  last: boolean;
  empty: boolean;
}
