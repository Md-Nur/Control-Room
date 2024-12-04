"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { polapainAuth } = usePolapainAuth();
  const pathname = usePathname();
  if (!polapainAuth && !["/login", "/signup"].includes(pathname)) {
    router.push("/login");
    return <>You are not authorized to view this page</>;
  } else if (polapainAuth && ["/login", "/signup"].includes(pathname)) {
    router.push("/dashboard");
  } else {
    return children;
  }
};

export default PageLayout;
