import type { Address } from "./User";

export type HospitalVerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface HospitalAddress {
  street: string;
  township: string;
  city: string;
}

export interface HospitalProfileResponse {
  id: number;

  hospitalName: string;
  hospitalLicenseCode: string;
  representativeStaffName: string;
  email: string;
  phone: string;
  address: HospitalAddress;
  verificationStatus: HospitalVerificationStatus;
  enabled: boolean;
}

export interface HospitalProfileUpdateRequest {
  hospitalName: string;
  representativeStaffName: string;
  phone: string;
  address:Address;
}