"use client";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Khoroch[]>([]);
  useEffect(() => {
    axios
      .get("/api/all-expenses")
      .then((res) => {
        setExpenses(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
        // console.log(err);
      });
  }, []);

  return (
    <section className="w-full px-5">
      <h1 className="text-4xl text-center my-10 font-bold">Expenses</h1>
      <div className="overflow-x-auto w-full my-10 max-w-7xl mx-auto">
        <table className="table">
          <thead>
            <tr className="hover">
              <th>Title</th>
              <th>Date</th>
              <th>Polapains Taka Dibo</th>
              <th>Polapain Taka Dise</th>
              <th>Category</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length ? (
              expenses?.map(
                (expense, i) =>
                  expense.type != "add-taka" && (
                    <tr className="hover" key={i}>
                      <td>{expense.title}</td>
                      <td>
                        {new Date(expense.date)
                          .toUTCString()
                          .split(" ")
                          .slice(0, 4)
                          .join(" ")}
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {expense.dibo.map(
                            (pola) =>
                              pola.amount > 0 && (
                                <div
                                  className="avatar tooltip"
                                  data-tip={`Name: ${pola.name}; Amount: ${pola.amount}`}
                                  key={pola.id}
                                >
                                  <div className="mask mask-squircle w-12">
                                    <Image
                                      src={pola?.avatar || "/avatar.jpg"}
                                      alt={pola.name}
                                      width={100}
                                      height={100}
                                    />
                                  </div>
                                </div>
                              )
                          )}
                        </div>
                      </td>
                      <td className="flex gap-2">
                        <div className="flex gap-1 flex-wrap">
                          {expense.dise.reduce((a, p) => a + p.amount, 0) ? (
                            expense.dise.map(
                              (pola, i) =>
                                pola.amount > 0 && (
                                  <div
                                    className="avatar tooltip"
                                    data-tip={`Name: ${pola.name}; Amount: ${pola.amount}`}
                                    key={i}
                                  >
                                    <div className="mask mask-squircle w-12">
                                      <Image
                                        src={pola?.avatar || "/avatar.jpg"}
                                        alt={pola.name}
                                        width={100}
                                        height={100}
                                      />
                                    </div>
                                  </div>
                                )
                            )
                          ) : (
                            <div
                              className="avatar tooltip"
                              data-tip={`Manager; Amount: ${expense.amount}`}
                              key={i}
                            >
                              <div className="mask mask-squircle w-12">
                                <Image
                                  src={"/logo.jpg"}
                                  alt="Manager"
                                  width={100}
                                  height={100}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="capitalize">{expense.type}</td>
                      <td>{expense.amount}</td>
                    </tr>
                  )
              )
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  <span className="loading loading-bars loading-lg"></span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Expenses;
