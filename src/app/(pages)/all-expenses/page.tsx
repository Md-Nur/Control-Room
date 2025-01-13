"use client";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Avatars from "./avatars";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Khoroch[]>([]);
  const [sort, setSort] = useState<string>("");
  useEffect(() => {
    axios
      .get(`/api/all-expenses?sort=${sort}`)
      .then((res) => {
        setExpenses(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
      });
  }, [sort]);

  return (
    <section className="w-full px-5">
      <h1 className="text-4xl text-center my-10 font-bold">Expenses</h1>
      <div className="w-full flex items-center justify-between gap-3">
        <select
          onChange={(e) => {
            setSort(e.target.value);
          }}
          className="select select-bordered w-32 max-w-xs mx-auto"
        >
          <option disabled selected>
            Sort
          </option>
          <option value="date">Date</option>
          <option value="_id">Added</option>
        </select>
      </div>
      <div className="overflow-x-auto w-full my-10 max-w-7xl mx-auto">
        <table className="table">
          <thead>
            <tr className="hover">
              <th>Title</th>
              <th>Day & Date</th>
              <th>Polapains Taka Dibo</th>
              <th>Polapain Taka Dise</th>
              <th>Type</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length ? (
              expenses?.map(
                (expense) =>
                  expense.type != "add-taka" && (
                    <tr className="hover" key={expense._id}>
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
                          <Avatars polapains={expense.dibo} />
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {expense.dise.reduce((a, p) => a + p.amount, 0) ? (
                            <Avatars polapains={expense.dise} />
                          ) : (
                            <div
                              className="avatar tooltip"
                              data-tip={`Manager; Amount: ${expense.amount}`}
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
                <td colSpan={6} className="w-full text-center">
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
