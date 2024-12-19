"use client";

import { AddKhoroch } from "@/context/addKhoroch";
import { Khoroch } from "@/models/Khoroch";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import { ReactNode, useEffect, useState } from "react";

const AddKhorochProvider = ({ children }: { children: ReactNode }) => {
  const [khroch, setKhoroch] = useState<Khoroch>();
  const [polapains, setPolapains] = useState<Polapain[] | null>(null);

  useEffect(() => {
    axios.get("/api/polapain").then((res) => {
      setPolapains(res.data);
    });
  }, []);

  return (
    <AddKhoroch.Provider
      value={{ polapains, setPolapains, khroch, setKhoroch }}
    >
      {children}
    </AddKhoroch.Provider>
  );
};

export default AddKhorochProvider;
