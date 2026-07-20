import api from "../axios";

import type {
  DeferDonationRequest,
  DonationEventRequest,
  DonationEventResponse,
  PublicDonationEvent,
  RegisteredEventDonorResponse,
} from "@/types/hospitalEvents";

const HOSPITAL_EVENT_URL = "/lifelink/hospital/donation-events";

export const getHospitalDonationEvents = async (): Promise<
  DonationEventResponse[]
> => {
  const response = await api.get<DonationEventResponse[]>(HOSPITAL_EVENT_URL);
  console.log("get hospital donation events", response.data);
  return response.data;
};

export const updateHospitalDonationEvent = async (
  eventId: number,
  request: DonationEventRequest,
): Promise<DonationEventResponse> => {
  const response = await api.put<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}`,
    request,
  );
  console.log("res: update hospital donation events", response.data);
  return response.data;
};

export const getHospitalDonationEventById = async (
  eventId: number,
): Promise<DonationEventResponse> => {
  const response = await api.get<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}`,
  );
  console.log("res::get hospital donation event by id", response.data);
  return response.data;
};

export const getEventRegisteredDonors = async (
  eventId: number,
): Promise<RegisteredEventDonorResponse[]> => {
  const response = await api.get<RegisteredEventDonorResponse[]>(
    `${HOSPITAL_EVENT_URL}/${eventId}/registrations`,
  );
  return response.data;
};

export const completeEventDonation = async (
  eventId: number,
  registrationId: number,
): Promise<RegisteredEventDonorResponse> => {
  const response = await api.post<RegisteredEventDonorResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}/registrations/${registrationId}/complete`,
  );
  return response.data;
};

export const markEventDonorNoShow = async (
  eventId: number,
  registrationId: number,
): Promise<RegisteredEventDonorResponse> => {
  const response = await api.post<RegisteredEventDonorResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}/registrations/${registrationId}/no-show`,
  );
  return response.data;
};

export const deferEventDonation = async (
  eventId: number,
  registrationId: number,
  request: DeferDonationRequest,
): Promise<RegisteredEventDonorResponse> => {
  const response = await api.post<RegisteredEventDonorResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}/registrations/${registrationId}/defer`,
    request,
  );
  return response.data;
};

export const createDonationEventDraft = async (
  request: DonationEventRequest,
): Promise<DonationEventResponse> => {
  const response = await api.post<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/drafts`,
    request,
  );
  return response.data;
};

export const updateDonationEventDraft = async (
  eventId: number,
  request: DonationEventRequest,
): Promise<DonationEventResponse> => {
  const response = await api.put<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}/draft`,
    request,
  );
  return response.data;
};

export const createAndPublishDonationEvent = async (
  request: DonationEventRequest,
): Promise<DonationEventResponse> => {
  const response = await api.post<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/publish`,
    request,
  );
  return response.data;
};

export const publishDonationEventDraft = async (
  eventId: number,
  request: DonationEventRequest,
): Promise<DonationEventResponse> => {
  const response = await api.post<DonationEventResponse>(
    `${HOSPITAL_EVENT_URL}/${eventId}/publish`,
    request,
  );
  return response.data;
};

export const getPublicDonationEvents = async (
  limit = 3,
): Promise<PublicDonationEvent[]> => {
  const response = await api.get<PublicDonationEvent[]>(
    "/lifelink/public/events",
    {
      params: {
        limit,
      },
    },
  );

  return Array.isArray(response.data) ? response.data : [];
};
