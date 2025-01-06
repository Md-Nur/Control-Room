"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import Image from "next/image";
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
              <th>Avatar</th>
              <th>Name</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              polapain.length &&
              polapain?.map((pola, i) => (
                <tr key={i} className="hover">
                  <td>
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <Image
                          src={pola?.avatar || "/avatar.jpg"}
                          alt={pola.name}
                          width={50}
                          height={50}
                          className="rounded-full"
                        />
                      </div>
                    </div>
                  </td>
                  <td>{pola.name}</td>
                  <td
                    className={
                      pola.balance < 0 ? "text-red-500" : "text-green-500"
                    }
                  >
                    {pola.balance.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="w-full text-center">
                  <span className="loading loading-bars loading-md"></span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <Image
                      src="/logo.jpg"
                      alt="Manager"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                </div>
              </td>
              <td>Manager</td>
              <td>
                {polapain
                  .reduce((acc, pola) => acc + pola.balance, 0)
                  .toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

export default Balance;
