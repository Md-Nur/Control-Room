"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Balance = () => {
  const [polapain, setPolapain] = useState<Polapain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/polapain")
      .then((res) => {
        setPolapain(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return (
    <section>
      <h1 className="text-4xl text-center my-10 font-bold">All Balance</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              polapain.length &&
              polapain?.map((pola, i) => (
                <tr key={i} className="hover">
                  <td>{pola.name}</td>
                  <td>{pola.balance.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td>
                  <span className="loading loading-bars loading-md"></span>
                </td>
                <td>
                  <span className="loading loading-bars loading-md"></span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>Manager</td>
              <td>{polapain.reduce((acc, pola) => acc + pola.balance, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default Balance;
