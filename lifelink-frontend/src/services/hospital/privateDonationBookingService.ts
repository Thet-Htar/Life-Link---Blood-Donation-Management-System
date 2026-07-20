import api from "@/services/axios";
import type {
  PageResponse,
  PrivateBookingInventorySourceResponse,
} from "@/types/hospitalInventory";
import type {
  CompletePrivateDonationBookingRequest,
  ConfirmPrivateDonationBookingRequest,
  DeferPrivateDonationBookingRequest,
  PrivateBookingHospitalResponse,
  PrivateDonationBookingResponse,
} from "@/types/privateDonationBooking";

const HOSPITAL_PRIVATE_BOOKING_URL = "/lifelink/hospital/private-bookings";

export const getHospitalPrivateDonationBookings = async (): Promise<
  PrivateDonationBookingResponse[]
> => {
  const response = await api.get<PrivateDonationBookingResponse[]>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/register`,
  );

  return response.data;
};

export const getHospitalPrivateDonationBooking = async (
  bookingId: number,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.get<PrivateDonationBookingResponse>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/${bookingId}`,
  );

  return response.data;
};

export const confirmPrivateDonationBooking = async (
  bookingId: number,
  request: ConfirmPrivateDonationBookingRequest,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.post<PrivateDonationBookingResponse>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/${bookingId}/confirm`,
    request,
  );

  return response.data;
};

export const completePrivateDonationBooking = async (
  bookingId: number,
  request: CompletePrivateDonationBookingRequest,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.post<PrivateDonationBookingResponse>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/${bookingId}/complete`,
    request,
  );

  return response.data;
};

export const markPrivateDonationBookingNoShow = async (
  bookingId: number,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.post<PrivateDonationBookingResponse>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/${bookingId}/no-show`,
  );

  return response.data;
};

export const deferPrivateDonationBooking = async (
  bookingId: number,
  request: DeferPrivateDonationBookingRequest,
): Promise<PrivateDonationBookingResponse> => {
  const response = await api.post<PrivateDonationBookingResponse>(
    `${HOSPITAL_PRIVATE_BOOKING_URL}/${bookingId}/defer`,
    request,
  );

  return response.data;
};

export const getPrivateBookingInventorySources = async (
  search = "",
  page = 0,
  size = 10,
): Promise<PageResponse<PrivateBookingInventorySourceResponse>> => {
  const response = await api.get<
    PageResponse<PrivateBookingInventorySourceResponse>
  >(`${HOSPITAL_PRIVATE_BOOKING_URL}/inventory-sources`, {
    params: {
      search,
      page,
      size,
    },
  });

  return response.data;
};

export const getPrivateBookingHospitals = async (): Promise<
  PrivateBookingHospitalResponse[]
> => {
  const response = await api.get<PrivateBookingHospitalResponse[]>(
    HOSPITAL_PRIVATE_BOOKING_URL,
  );

  return response.data;
};
