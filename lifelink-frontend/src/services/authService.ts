import type {
  HospitalRegisterRequest,
  RegisterRequest,
} from "@/types/auth/Auth";

import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post("/lifelink/auth/login", data);
    console.log("res", response.data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post("/lifelink/auth/register", data);

    return response.data;
  },

  registerHospital: async (data: HospitalRegisterRequest) => {
    const response = await api.post("/lifelink/auth/register/hospital", data);

    return response.data;
  },

  registerDonor: async (data: RegisterRequest) => {
    const response = await api.post("/lifelink/auth/register/donor", data);

    return response.data;
  },

  refresh: async () => {
    const response = await api.post(
      "/lifelink/auth/refresh",
      {},
      {
        withCredentials: true,
      },
    );

    return response.data;
  },
};

export default authService;
