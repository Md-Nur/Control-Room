"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { polapainAuth } = usePolapainAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/all-expenses")
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
  }, []);

  return (
    <section className="flex gap-1 justify-evenly w-full flex-wrap">
      <div className="max-w-xs">
        <h1 className="text-center text-4xl font-bold">{polapainAuth.name}</h1>
        <img
          className="mask mask-squircle w-24"
          src={polapainAuth?.avatar || "/avatar.jpg"}
          alt={polapainAuth.name}
        />
        <p className="text-lg">
          Date of Birth: {polapainAuth.dob.split("T")[0]}
        </p>
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
      <div className="flex flex-col gap-5 w-full max-w-lg">
        <h1 className="text-3xl font-bold">Recent Expenses</h1>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Disi</th>
                <th>Dimu</th>
              </tr>
            </thead>
            <tbody>
              {!loading && expenses.length ? (
                expenses.map(
                  (expense) =>
                    (expense.dise.find((d) => d.id === polapainAuth._id)
                      ?.amount ||
                      expense.dibo.find((d) => d.id === polapainAuth._id)
                        ?.amount) && (
                      <tr key={expense._id}>
                        <td>{expense.title}</td>
                        <td>{expense.amount.toFixed(2)}</td>
                        <td className="capitalize">{expense.type}</td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td className="text-green-500">
                          +
                          {expense.dise
                            .find((d) => d.id === polapainAuth._id)
                            .amount.toFixed(2)}
                        </td>
                        <td className="text-red-500">
                          -
                          {expense.dibo
                            .find((d) => d.id === polapainAuth._id)
                            .amount.toFixed(2)}
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
