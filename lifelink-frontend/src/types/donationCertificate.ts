export type CertificateStatus = "ACTIVE" | "REVOKED";

export interface RevokeCertificateRequest {
  reason: string;
}

export interface DonationCertificateResponse {
  certificateId: number;
  certificateNumber: string;
  verificationCode: string;
  status: CertificateStatus;

  registrationId: number;
  donorId: number;
  donorCode: string;
  donorName: string;
  bloodType: string;

  hospitalId: number;
  hospitalName: string;

  eventId: number;
  eventTitle: string;

  donationDate: string;
  issuedAt: string;

  revokedAt: string | null;
  revokeReason: string | null;
}
