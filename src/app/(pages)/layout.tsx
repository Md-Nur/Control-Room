"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const PageLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { polapainAuth, loading } = usePolapainAuth();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];

  // Redirect to login if not authenticated (must be in useEffect to avoid setState during render)
  useEffect(() => {
    if (!loading && !polapainAuth && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [loading, polapainAuth, pathname, router]);

  if (loading) {
    return <span className="loading loading-bars loading-lg"></span>;
  }

  if (!polapainAuth && !publicRoutes.includes(pathname)) {
    return null; // Return null while redirecting
  }

  return children;
};

export default PageLayout;
