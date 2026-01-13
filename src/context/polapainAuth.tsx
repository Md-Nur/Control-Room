import { BasePolapain } from "@/models/Polapain";
import { createContext, useContext } from "react";

const PolapainAuth = createContext<{
  polapainAuth: BasePolapain | undefined;
  setPolapainAuth: (polapainAuth: BasePolapain | undefined) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  polapainAuth: {} as BasePolapain,
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
