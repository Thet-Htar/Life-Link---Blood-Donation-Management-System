import { useState } from "react";
import DonorRegister from "./DonorRegister";
import HospitalRegister from "./HospitalRegister";
import RegisterTypePage from "./RegisterTypePage";
import type { AccountType } from "@/types/auth/Auth";


const Register = () => {
  const [type, setType] = useState<AccountType>(null);

  if (!type) {
    return <RegisterTypePage onSelect={setType} />;
  }

  return (
    <>
      {type === "DONOR" && <DonorRegister />}
      {type === "HOSPITAL" && <HospitalRegister />}
    </>
  );
};

export default Register;