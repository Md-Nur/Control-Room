"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { ReactNode } from "react";
import toast from "react-hot-toast";

const ManagerLayout = ({ children }: { children: ReactNode }) => {
  const { polapainAuth } = usePolapainAuth();
  if (!polapainAuth?.isManager) {
    toast.error("Unauthorised");
    return <div>Unauthorised</div>;
  }
  return children;
};

export default ManagerLayout;
