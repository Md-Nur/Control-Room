"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import toast from "react-hot-toast";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { polapainAuth } = usePolapainAuth();
  const pathname = usePathname();
  if (!polapainAuth && pathname === "/dashboard") {
    router.push("/login");
    toast.error("You are not authorized to view this page");
    return <>You are not authorized to view this page</>;
  } else {
    return children;
  }
};

export default PageLayout;
