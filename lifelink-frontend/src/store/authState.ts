import type { User } from "../types/User";
import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  //refreshToken: string | null;
  user : User | null;
  isInitialized: boolean;


  setAuth:(access: string,user: User) => void;
  setInitialized: (val:boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  setAuth: (access: string, user: User) =>
    set(() => ({
      accessToken: access,
      user,
      isInitialized: true,
    })),

  setInitialized: (val: boolean) => set(() => ({ 
    isInitialized: val 
  })),
  logout: () => set(() => ({
     accessToken: null, 
     user: null 
    })),
}));


interface LoginErrorResponse {
  code?:
    | "ACCOUNT_UNDER_REVIEW"
    | "ACCOUNT_REJECTED";

  message?: string;
  status?: number;
}