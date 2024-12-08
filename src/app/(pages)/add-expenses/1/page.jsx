"use client";

import { useKhoroch } from "@/context/addKhoroch";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AddExpenses = () => {
  const router = useRouter();
  const { setKhoroch } = useKhoroch();
  const { handleSubmit, register } = useForm();

  const onSubmit = async (data) => {
    if (!data.amount) {
      toast.error("Amount is required");
    } else {
      setKhoroch({
        ...data,
      });
      router.push("/add-expenses/2");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-center">Add Khoroch</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex justify-center flex-col p-5 items-center flex-wrap gap-3"
      >
        <div className="flex w-72 justify-between">
          <label className="label">Title</label>
          <input
            className="input input-bordered"
            type="text"
            placeholder="Title"
            {...register("title")}
          />
        </div>
        <div className="flex w-72 justify-between">
          <label className="label">Amount</label>
          <input
            className="input input-bordered"
            type="number"
            placeholder="Total Amount"
            min={1}
            {...register("amount")}
          />
        </div>
        <div className="flex w-72 justify-between">
          <label className="label">Type</label>
          <select
            className="select select-bordered"
            {...register("type")}
            defaultValue="food"
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Next
        </button>
      </form>
    </div>
  );
};

export default AddExpenses;
