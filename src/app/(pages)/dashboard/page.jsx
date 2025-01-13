"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { polapainAuth } = usePolapainAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("");

  useEffect(() => {
    axios
      .get(`/api/all-expenses?sort=${sort}`)
      .then((res) => {
        setExpenses(res.data);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || err.message || "Something went wrong"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sort]);

  return (
    <section className="flex gap-1 justify-evenly w-full flex-wrap">
      <div className="max-w-xs space-y-3">
        <h1 className="text-center text-4xl font-bold my-10">
          {polapainAuth?.name}
        </h1>
        <Image
          width={100}
          height={100}
          className="mask mask-squircle w-24 mx-auto"
          src={polapainAuth?.avatar || "/avatar.jpg"}
          alt={polapainAuth.name}
        />
        {polapainAuth?.dob && (
          <p className="text-lg">
            Date of Birth: {polapainAuth.dob.split("T")[0]}
          </p>
        )}
        <p className="text-lg">Phone: {polapainAuth.phone}</p>
        <p className={"text-lg"}>
          Balance:{" "}
          <span
            className={`${
              polapainAuth.balance > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {polapainAuth.balance.toFixed(2)}
          </span>
        </p>
      </div>
      <div className="flex flex-col gap-5 w-full max-w-3xl p-3">
        <h1 className="text-3xl font-bold my-10 text-center">
          Recent Expenses
        </h1>
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
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Day & Date</th>
                <th>Disi</th>
                <th>Dimu</th>
              </tr>
            </thead>
            <tbody>
              {!loading && expenses.length ? (
                expenses.map(
                  (expense) =>
                    (expense.dise.find((d) => d.id === polapainAuth._id)
                      ?.amount > 0 ||
                      expense.dibo.find((d) => d.id === polapainAuth._id)
                        ?.amount > 0) && (
                      <tr key={expense._id}>
                        <td>{expense.title}</td>
                        <td>{expense.amount.toFixed(2)}</td>
                        <td className="capitalize">{expense.type}</td>
                        <td>
                          {new Date(expense.date)
                            .toUTCString()
                            .split(" ")
                            .slice(0, 4)
                            .join(" ")}
                        </td>
                        <td className="text-green-500">
                          +
                          {expense.dise
                            .find((d) => d.id === polapainAuth._id)
                            .amount.toFixed(2)}
                        </td>
                        <td className="text-red-500">
                          -
                          {(expense?.dibo?.length &&
                            expense.dibo
                              .find((d) => d.id === polapainAuth._id)
                              ?.amount.toFixed(2)) ||
                            0}
                        </td>
                      </tr>
                    )
                )
              ) : (
                <tr>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <td key={i}>
                      <span className="loading loading-bars loading-md"></span>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
