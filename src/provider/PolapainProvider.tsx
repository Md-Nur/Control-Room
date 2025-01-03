"use client";
import { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { PolapainAuth } from "@/context/polapainAuth";
import { Polapain } from "@/models/Polapain";

const PolapainAuthProvider = ({ children }: { children: ReactNode }) => {
  const [polapainAuth, setPolapainAuth] = useState<Polapain>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Fetch user data
    axios
      .get("/api/jwt")
      .then((res) => {
        // console.log(res.data);
        setPolapainAuth(res.data);
      })
      .catch(() => {
        setPolapainAuth(undefined);
        // toast.error(err?.response?.data?.error||err.message);
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
