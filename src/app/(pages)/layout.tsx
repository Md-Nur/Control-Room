"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";

const RootLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { polapainAuth, loading } = usePolapainAuth();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = useMemo(() => ["/login", "/signup", "/verify"], []);

  // Redirect to login if not authenticated (must be in useEffect to avoid setState during render)
  useEffect(() => {
    if (!loading && !polapainAuth && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [pathname, polapainAuth, loading, router, publicRoutes]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (!polapainAuth && !publicRoutes.includes(pathname)) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
};

export default RootLayoutContent;
