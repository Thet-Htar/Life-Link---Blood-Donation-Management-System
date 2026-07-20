import AppRouter from "@/routes/AppRouter";
import authService from "@/services/authService";
import { useAuthStore } from "./store/authState";
import { useEffect } from "react";

export default function App() {
  const { setAuth, setInitialized, isInitialized } = useAuthStore();

  useEffect(() => {
    const intializeAuth = async () => {
      try {
        const res = await authService.refresh();

        setAuth(res.accessToken, res.user);
      } catch (err) {
        console.error("No valid refresh token found ");
        setInitialized(true);
      }
    };
    intializeAuth();
  }, [setAuth, setInitialized]);

  if (!isInitialized) {
    return <div>Loading Application....</div>;
  }

  return <AppRouter />;
}
