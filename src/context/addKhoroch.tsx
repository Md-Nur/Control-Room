import { Khoroch } from "@/models/Khoroch";
import { Polapain } from "@/models/Polapain";
import { createContext, useContext } from "react";

const AddKhoroch = createContext<{
  polapains: Polapain[] | null;
  setPolapains: (polapains: Polapain[]) => void;
  khroch: Khoroch | undefined;
  setKhoroch: (khroch: Khoroch) => void;
}>({
  polapains: {} as Polapain[],
  setPolapains: () => {},
  khroch: {} as Khoroch,
  setKhoroch: () => {},
});

const useKhoroch = () => {
  const context = useContext(AddKhoroch);
  return context;
};

export { AddKhoroch, useKhoroch };
