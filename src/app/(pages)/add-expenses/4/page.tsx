"use client";
import { useKhoroch } from "@/context/addKhoroch";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AddExpenses4 = () => {
  const { khroch, polapains } = useKhoroch();
  const router = useRouter();
  const handleSubmit = () => {
    toast.loading("Submitting...");
    axios
      .post("/api/all-expenses", khroch)
      .then(() => {
        toast.dismiss();
        toast.success("Submitted");
        router.push("/all-expenses");
      })
      .catch((err) => {
        toast.dismiss();
        toast.error(err?.response?.data?.error || "Something went wrong");
      });
  };
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="flex flex-col">
        <h1 className="text-3xl text-center font-bold">
          {khroch?.title || "Title Nai"}
        </h1>
        <p className="text-center text-lg">
          Amount: {khroch?.amount || "Amount Nai"}
        </p>
        <p className="text-center text-lg">
          Type: {khroch?.type || "Type Nai"}
        </p>
        <p className="text-center text-lg">
          Date: {khroch?.date.toDateString() || "Date Nai"}
        </p>
      </div>
      <table className="table rounded bg-base-300 max-w-72 mt-10">
        <thead>
          <tr className="hover">
            <th>Polapain</th>
            <th>Dise</th>
            <th>Dibo</th>
          </tr>
        </thead>
        <tbody>
          {polapains?.map((pola, i) => (
            <tr key={i} className="hover">
              <th>{pola.name}</th>
              <td>{khroch?.dise[i].amount}</td>
              <td>{khroch?.dibo[i].amount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>
              {khroch?.dise.reduce(
                (acc, curr) => Number(acc) + Number(curr.amount),
                0
              )}
            </td>
            <td>
              {khroch?.dibo
                .reduce((acc, curr) => Number(acc) + Number(curr.amount), 0)
                ?.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="flex justify-between w-full items-center max-w-72 mt-2 mb-10">
        <Link className="btn btn-primary" href="/add-expenses/3">
          Previous
        </Link>
        <button onClick={handleSubmit} className="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddExpenses4;
