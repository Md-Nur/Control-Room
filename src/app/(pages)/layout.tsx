"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { polapainAuth, loading } = usePolapainAuth();
  const pathname = usePathname();
  if (loading) {
    return <span className="loading loading-bars loading-lg"></span>;
  } else if (!polapainAuth && !["/login", "/signup"].includes(pathname)) {
    router.push("/login");
    return null;
  } else if (
    polapainAuth &&
    ["/login", "/signup"].includes(pathname) &&
    pathname !== "/dashboard"
  ) {
    router.push("/dashboard");
    return null;
  } else {
    return children;
  }
};

export default PageLayout;
