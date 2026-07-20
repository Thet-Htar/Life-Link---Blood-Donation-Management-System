import api from "./axios";
import type { DonorProfileResponse } from "@/pages/donor/DonorDashboard";
import type { DonorProfileUpdateRequest } from "@/pages/donor/components/EditProfileModel";
import type { DonationCertificateResponse } from "@/types/donationCertificate";
import type {
  DonorEventRegistrationResponse,
  DonorEventResponse,
} from "@/types/donorEvents";
import type {
  CreatePrivateDonationBookingRequest,
  PrivateDonationBookingResponse,
} from "@/types/privateDonationBooking";

const DONOR_BASE_URL = "/lifelink/donor";
const DONOR_PRIVATE_BOOKING_URL = "/lifelink/donor/private-bookings";
const DONOR_CERTIFICATE_URL = "/lifelink/donor/certificates";
const PUBLIC_CERTIFICATE_URL = "/lifelink/public/certificates";


/*
* Donor Profile Services
*/
export const getDonorProfile = async (): Promise<DonorProfileResponse> => {
  const response = await api.get<DonorProfileResponse>(
    "/lifelink/donor/profile",
  );
  return response.data;
};

export const updateDonorProfile = async (
  profileData: DonorProfileUpdateRequest,
): Promise<DonorProfileResponse> => {
  const response = await api.put<DonorProfileResponse>(
    "/lifelink/donor/profile",
    profileData,
  );

  return response.data;
};

/*
* Donor Private Donation Booking Services
*/

export const createPrivateDonationBooking = async (
  request: CreatePrivateDonationBookingRequest,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.post<PrivateDonationBookingResponse>(
    DONOR_PRIVATE_BOOKING_URL,
    request,
  );

  return response.data;
};

export const getMyPrivateDonationBookings = async (): Promise<
  PrivateDonationBookingResponse[]
> => {
  const response = await api.get<PrivateDonationBookingResponse[]>(
    `${DONOR_PRIVATE_BOOKING_URL}/me`,
  );

  return response.data;
};

export const getMyPrivateDonationBooking = async (
  bookingId: number,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.get<PrivateDonationBookingResponse>(
    `${DONOR_PRIVATE_BOOKING_URL}/${bookingId}`,
  );

  return response.data;
};

/*
* Donor Donation Events Services
*/

export const getRecommendedDonorEvents = async (): Promise<
  DonorEventResponse[]
> => {
  const response = await api.get<DonorEventResponse[]>(
    `${DONOR_BASE_URL}/donation-events`,
  );
  return response.data;
};

export const registerDonorForEvent = async (
  eventId: number,
): Promise<DonorEventRegistrationResponse> => {
  const response = await api.post<DonorEventRegistrationResponse>(
    `${DONOR_BASE_URL}/donation-events/${eventId}/register`,
  );
  return response.data;
};

export const cancelDonorEventRegistration = async (
  eventId: number,
): Promise<DonorEventRegistrationResponse> => {
  const response = await api.put<DonorEventRegistrationResponse>(
    `${DONOR_BASE_URL}/donation-events/${eventId}/cancel`,
  );
  return response.data;
};

export const getMyDonorRegistrations = async (): Promise<
  DonorEventRegistrationResponse[]
> => {
  const response = await api.get<DonorEventRegistrationResponse[]>(
    `${DONOR_BASE_URL}/registrations`,
  );
  return response.data;
};

/*
* Donor Certificates Services
*/

export const getMyCertificates = async (): Promise<
  DonationCertificateResponse[]
> => {
  const response = await api.get<DonationCertificateResponse[]>(
    DONOR_CERTIFICATE_URL,
  );

  return response.data;
};

export const verifyCertificateByNumber = async (
  certificateNumber: string,
): Promise<DonationCertificateResponse> => {
  const normalizedNumber = certificateNumber.trim();

  const response = await api.get<DonationCertificateResponse>(
    `${PUBLIC_CERTIFICATE_URL}/verify-number/${encodeURIComponent(
      normalizedNumber,
    )}`,
  );

  return response.data;
};
