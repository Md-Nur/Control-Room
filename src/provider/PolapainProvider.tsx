"use client";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { PolapainAuth } from "@/context/polapainAuth";
import { BasePolapain } from "@/models/Polapain";

const PolapainAuthProvider = ({ children }: { children: ReactNode }) => {
  const [polapainAuth, setPolapainAuth] = useState<BasePolapain>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Fetch user data
    axios
      .get("/api/jwt")
      .then((res) => {
        setPolapainAuth(res.data);
      })
      .catch(() => {
        setPolapainAuth(undefined);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PolapainAuth.Provider
      value={{ polapainAuth, setPolapainAuth, loading, setLoading }}
    >
      {children}
    </PolapainAuth.Provider>
  );
};

export default PolapainAuthProvider;
