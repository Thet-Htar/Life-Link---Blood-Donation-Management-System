import type {
  HospitalProfileResponse,
  HospitalProfileUpdateRequest,
} from "@/types/profile";
import api from "../axios";

const HOSPITAL_PROFILE_URL = "/lifelink/hospital/profile";

export const getHospitalProfile =
  async (): Promise<HospitalProfileResponse> => {
    const response =
      await api.get<HospitalProfileResponse>(HOSPITAL_PROFILE_URL);
    console.log(response.data);
    return response.data;
  };

export const updateHospitalProfile = async (
  request: HospitalProfileUpdateRequest,
): Promise<HospitalProfileResponse> => {
  const response = await api.patch<HospitalProfileResponse>(
    HOSPITAL_PROFILE_URL,
    request,
  );

  return response.data;
};
