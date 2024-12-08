"use client";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
// import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Khoroch[]>([]);
  useEffect(() => {
    axios
      .get("/api/expenses")
      .then((res) => {
        setExpenses(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
        // console.log(err);
      });
  }, []);

  return (
    <section>
      <h1>Expenses</h1>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Polapains Taka Dibo</th>
              <th>Polapain Taka Dise</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {expenses.length &&
              expenses?.map((expense, i) => (
                <tr key={i}>
                  <td>{expense.title}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    {expense.dise.map((pola, i) => (
                      <div className="avatar" key={i}>
                        <div className="mask mask-squircle w-24">
                          {/* <Image 
                             src={pola.avatar}
                             alt="avatar"
                             width={100}
                             height={100}
                           /> */}
                        </div>
                        <div className="avatar-content">
                          <div className="font-bold">{pola.name}</div>
                          <div>{pola.amount}</div>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td>
                    {expense.dibo.map((pola, i) => (
                      <div className="avatar" key={i}>
                        <div className="mask mask-squircle w-24">
                          {/* <Image
                            src={pola.avatar}
                            alt="avatar"
                            width={100}
                            height={100}
                          /> */}
                        </div>
                        <div className="avatar-content">
                          <div className="font-bold">{pola.name}</div>
                          <div>{pola.amount}</div>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td>{expense.amount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Expenses;
