import api from "@/services/axios";

import type {
    AdminDonorActionResponse,
  AdminDonorResponse,
  AdminHospitalActionResponse,
  AdminHospitalApprovalResponse,
  AdminHospitalResponse,
  PageResponse,
  VerificationStatus,
} from "@/types/auth/Admin";

const ADMIN_HOSPITAL_URL = "/lifelink/admin/hospitals";

const ADMIN_DONOR_URL = "/lifelink/admin/donors";

export interface SearchAdminHospitalsParams {
  search?: string;
  status?: VerificationStatus;
  page?: number;
  size?: number;
}

export const searchAdminHospitals = async (
  params: SearchAdminHospitalsParams = {},
): Promise<PageResponse<AdminHospitalResponse>> => {
  const response = await api.get<PageResponse<AdminHospitalResponse>>(
    ADMIN_HOSPITAL_URL,
    {
      params: {
        search: params.search ?? "",
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    },
  );

  return response.data;
};

export const approveHospital = async (
  hospitalId: number,
): Promise<AdminHospitalApprovalResponse> => {
  const response = await api.put<AdminHospitalApprovalResponse>(
    `${ADMIN_HOSPITAL_URL}/${hospitalId}/approve`,
  );

  return response.data;
};

export const lockHospital = async (
  hospitalId: number,
): Promise<AdminHospitalActionResponse> => {
  const response = await api.put<AdminHospitalActionResponse>(
    `${ADMIN_HOSPITAL_URL}/${hospitalId}/lock`,
  );

  return response.data;
};

export const unlockHospital = async (
  hospitalId: number,
): Promise<AdminHospitalActionResponse> => {
  const response = await api.put<AdminHospitalActionResponse>(
    `${ADMIN_HOSPITAL_URL}/${hospitalId}/unlock`,
  );

  return response.data;
};

export interface SearchAdminDonorsParams {
  search?: string;
  page?: number;
  size?: number;
}

export const searchAdminDonors = async (
  params: SearchAdminDonorsParams = {},
): Promise<PageResponse<AdminDonorResponse>> => {
  const response = await api.get<
    PageResponse<AdminDonorResponse>
  >(ADMIN_DONOR_URL, {
    params: {
      search: params.search ?? "",
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  });

  return response.data;
};

export const lockDonor = async (
  donorId: number,
): Promise<AdminDonorActionResponse> => {
  const response =
    await api.put<AdminDonorActionResponse>(
      `${ADMIN_DONOR_URL}/${donorId}/lock`,
    );

  return response.data;
};

export const unlockDonor = async (
  donorId: number,
): Promise<AdminDonorActionResponse> => {
  const response =
    await api.put<AdminDonorActionResponse>(
      `${ADMIN_DONOR_URL}/${donorId}/unlock`,
    );

  return response.data;
};
