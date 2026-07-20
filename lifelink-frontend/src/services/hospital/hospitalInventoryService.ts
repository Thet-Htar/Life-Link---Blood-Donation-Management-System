import api from "../axios";

import type {
  BloodInventorySummaryResponse,
  BloodInventoryUnitResponse,
  CreateBloodUnitRequest,
  DiscardBloodUnitRequest,
  EventInventorySourceResponse,
  IssueBloodUnitRequest,
  PageResponse,
  PrivateBookingInventorySourceResponse,
  ReserveBloodUnitRequest,
} from "@/types/hospitalInventory";

const INVENTORY_URL = "/lifelink/hospital/inventory";

const EVENT_SOURCE_URL =
  "/lifelink/hospital/donation-events/inventory-source-registrations";

const BOOKING_SOURCE_URL =
  "/lifelink/hospital/private-bookings/inventory-sources";

export const getHospitalInventory = async (): Promise<
  BloodInventoryUnitResponse[]
> => {
  const response = await api.get<BloodInventoryUnitResponse[]>(INVENTORY_URL);

  return response.data;
};

export const getHospitalInventorySummary =
  async (): Promise<BloodInventorySummaryResponse> => {
    const response = await api.get<BloodInventorySummaryResponse>(
      `${INVENTORY_URL}/summary`,
    );

    return response.data;
  };

export const createHospitalBloodUnit = async (
  request: CreateBloodUnitRequest,
): Promise<BloodInventoryUnitResponse> => {
  const response = await api.post<BloodInventoryUnitResponse>(
    INVENTORY_URL,
    request,
  );

  return response.data;
};

export const searchEventInventorySources = async (
  search: string,
  page = 0,
  size = 10,
): Promise<PageResponse<EventInventorySourceResponse>> => {
  const response = await api.get<PageResponse<EventInventorySourceResponse>>(
    EVENT_SOURCE_URL,
    {
      params: {
        search,
        page,
        size,
      },
    },
  );
  console.log(response.data);
  return response.data;
};

export const searchPrivateBookingInventorySources = async (
  search: string,
  page = 0,
  size = 10,
): Promise<PageResponse<PrivateBookingInventorySourceResponse>> => {
  const response = await api.get<
    PageResponse<PrivateBookingInventorySourceResponse>
  >(BOOKING_SOURCE_URL, {
    params: {
      search,
      page,
      size,
    },
  });

  return response.data;
};

export const reserveHospitalBloodUnit = async (
  unitId: number,
  request: ReserveBloodUnitRequest,
): Promise<BloodInventoryUnitResponse> => {
  const response = await api.post<BloodInventoryUnitResponse>(
    `${INVENTORY_URL}/${unitId}/reserve`,
    request,
  );

  return response.data;
};

export const releaseHospitalBloodUnit = async (
  unitId: number,
): Promise<BloodInventoryUnitResponse> => {
  const response = await api.post<BloodInventoryUnitResponse>(
    `${INVENTORY_URL}/${unitId}/release`,
  );

  return response.data;
};

export const issueHospitalBloodUnit = async (
  unitId: number,
  request: IssueBloodUnitRequest,
): Promise<BloodInventoryUnitResponse> => {
  const response = await api.post<BloodInventoryUnitResponse>(
    `${INVENTORY_URL}/${unitId}/issue`,
    request,
  );

  return response.data;
};

export const discardHospitalBloodUnit = async (
  unitId: number,
  request: DiscardBloodUnitRequest,
): Promise<BloodInventoryUnitResponse> => {
  const response = await api.post<BloodInventoryUnitResponse>(
    `${INVENTORY_URL}/${unitId}/discard`,
    request,
  );

  return response.data;
};
