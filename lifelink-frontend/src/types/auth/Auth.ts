import type { User } from "../User";
import type { Address } from "../User";

export type AccountType = "DONOR" | "HOSPITAL" | null;

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/*
public record RegisterRequest(
        String fullName,
        String email,
        String password,
        String phone
) {
}

*/

export const BLOOD_TYPES = [
  { label: "A+", value: "A_POSITIVE" },
  { label: "A-", value: "A_NEGATIVE" },
  { label: "B+", value: "B_POSITIVE" },
  { label: "B-", value: "B_NEGATIVE" },
  { label: "AB+", value: "AB_POSITIVE" },
  { label: "AB-", value: "AB_NEGATIVE" },
  { label: "O+", value: "O_POSITIVE" },
  { label: "O-", value: "O_NEGATIVE" },
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number]["value"];

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type DonationHistoryType =
  | "NEVER_DONATED"
  | "EXACT_DATE"
  | "OVER_FOUR_MONTHS_NO_DATE";

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;

  bloodType: BloodType;
  dateOfBirth: string;
  weightKg: number;
  gender: Gender;

  donationHistoryType: DonationHistoryType;
  lastDonationDate: string | null;

  address: Address;
}

/*
public record HospitalRegisterRequest(
        String hospitalName,
        String hospitalLicenseCode,
        String phone,
        String email,
        Address address,
        String hospitalStaff
) {

}
*/

export interface HospitalRegister {
  name: string;
  email: string;
  phone?: string;
  password: string;
  address: Address;
}

export interface HospitalRegisterRequest {
  hospitalName: string;
  email: string;
  phone: string;
  password: string;
  hospitalLicenseCode: string;
  representativeStaffName: string;
  address: Address;
}



//For Login

/*
public record LoginRequest(
        String email,
        String password
) {
}
*/

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginApiError {
  code?: string;
  errorCode?: string;
  message?: string;
  errorMessage?: string;
  status?: number;
}
