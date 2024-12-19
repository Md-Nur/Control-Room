"use client";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
import Image from "next/image";
// import Image from "next/image";
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
      <div className="overflow-x-auto w-full">
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
            {expenses.length &&
              expenses?.map(
                (expense, i) =>
                  expense.type != "add-taka" && (
                    <tr className="hover" key={i}>
                      <td>{expense.title}</td>
                      <td>{new Date(expense.date).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {expense.dibo.map(
                            (pola, i) =>
                              pola.amount > 0 && (
                                <div
                                  className="avatar tooltip"
                                  data-tip={`name: ${pola.name} amount: ${pola.amount}`}
                                  key={i}
                                >
                                  <div className="mask mask-squircle w-12">
                                    <Image
                                      src={
                                        pola?.avatar ||
                                        "https://i.ibb.co.com/2hCrWYB/470181383-1221349485635395-209613915809854821-n.jpg"
                                      }
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
                          {expense.dise.map(
                            (pola, i) =>
                              pola.amount > 0 && (
                                <div
                                  className="avatar tooltip"
                                  data-tip={`name: ${pola.name} amount: ${pola.amount}`}
                                  key={i}
                                >
                                  <div className="mask mask-squircle w-12">
                                    <img
                                      src={
                                        pola?.avatar ||
                                        "https://i.ibb.co.com/2hCrWYB/470181383-1221349485635395-209613915809854821-n.jpg"
                                      }
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
                      <td className="capitalize">{expense.type}</td>
                      <td>{expense.amount}</td>
                    </tr>
                  )
              )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Expenses;
