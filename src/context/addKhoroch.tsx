import { Khoroch } from "@/models/Khoroch";
import { Polapain } from "@/models/Polapain";
import { createContext, useContext } from "react";

const AddKhoroch = createContext<{
  polapains: Polapain[] | null;
  khroch: Khoroch | undefined;
  setKhoroch: (khroch: Khoroch) => void;
}>({
  polapains: {} as Polapain[],
  khroch: {} as Khoroch,
  setKhoroch: () => {},
});

const useKhoroch = () => {
  const context = useContext(AddKhoroch);
  return context;
};

export { AddKhoroch, useKhoroch };
