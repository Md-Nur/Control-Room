"use client";
import { createContext, useContext } from "react";

const PolapainAuth = createContext({
  polapainAuth: {},
  setPolapainAuth: (polapainAuth: any) => {},
  loading: true,
  setLoading: (loading: boolean) => {},
});

const usePolapainAuth = () => {
  const context = useContext(PolapainAuth);
//   if (!context) {
//     return "polapainAuth must be used within a UserAuthProvider";
//   }
  return context;
};

export { PolapainAuth, usePolapainAuth };
