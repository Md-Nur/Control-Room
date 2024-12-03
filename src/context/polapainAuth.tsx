"use client";
import { Polapain } from "@/models/Polapain";
import { createContext, useContext } from "react";

const PolapainAuth = createContext<{
  polapainAuth: Polapain | undefined;
  setPolapainAuth: (polapainAuth: Polapain | undefined) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  polapainAuth: {} as Polapain,
  setPolapainAuth: () => {},
  loading: true,
  setLoading: () => {},
});

const usePolapainAuth = () => {
  const context = useContext(PolapainAuth);
  // if (!context) {
  //   return "polapainAuth must be used within a UserAuthProvider";
  // }
  return context;
};

export { PolapainAuth, usePolapainAuth };
