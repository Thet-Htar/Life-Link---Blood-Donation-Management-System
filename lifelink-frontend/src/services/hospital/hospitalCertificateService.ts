import api from "../axios";

import type { DonationCertificateResponse, RevokeCertificateRequest } from "@/types/donationCertificate";

const HOSPITAL_CERTIFICATE_URL = "/lifelink/hospital/certificates";

export const getHospitalCertificates = async (): Promise<
  DonationCertificateResponse[]
> => {
  const response = await api.get<DonationCertificateResponse[]>(
    HOSPITAL_CERTIFICATE_URL,
  );

  return response.data;
};

export const revokeHospitalCertificate = async (
  certificateId: number,
  request: RevokeCertificateRequest,
): Promise<DonationCertificateResponse> => {
  const response = await api.post<DonationCertificateResponse>(
    `${HOSPITAL_CERTIFICATE_URL}/${certificateId}/revoke`,
    request,
  );

  return response.data;
};
