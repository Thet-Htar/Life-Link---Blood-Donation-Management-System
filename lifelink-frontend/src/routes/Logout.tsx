import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authState";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    useAuthStore.getState().logout();

    navigate("/", {
      replace: true,
    });
  }, [navigate]);

  return null;
};

export default Logout;
