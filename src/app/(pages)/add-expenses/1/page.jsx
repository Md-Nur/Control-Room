"use client";

import { useKhoroch } from "@/context/addKhoroch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AddExpenses = () => {
  const router = useRouter();
  const { polapains, setPolapains, setKhoroch } = useKhoroch();
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
  const handleRemove = (id) => {
    setPolapains((prev) => prev.filter((p) => p._id !== id));
  };
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-center my-10">Add Khoroch</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex justify-center flex-col py-5 px-2 items-center flex-wrap gap-3"
      >
        <div className="flex w-full max-w-72 justify-between">
          <label className="label">Title</label>
          <input
            className="input input-bordered w-40"
            type="text"
            placeholder="Title"
            {...register("title")}
          />
        </div>
        <div className="flex max-w-72 w-full justify-between">
          <label className="label">Amount</label>
          <input
            className="input input-bordered w-40"
            type="number"
            placeholder="Total Amount"
            min={1}
            {...register("amount")}
          />
        </div>
        <div className="flex max-w-72 w-full justify-between">
          <label className="label">Date</label>
          <input
            className="input input-bordered w-40"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("date")}
          />
        </div>
        <div className="flex w-full max-w-72 justify-between">
          <label className="label">Type</label>
          <select
            className="select select-bordered w-40"
            {...register("type")}
            defaultValue="food"
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="food">Food</option>
            <option value="others">Other</option>
          </select>
        </div>
        <div className="flex justify-center items-center gap-3 my-3">
          {polapains?.length ? (
            polapains.map((pola) => (
              <div className="indicator" key={pola._id}>
                <span
                  onClick={() => {
                    handleRemove(pola._id);
                  }}
                  className="indicator-item badge badge-error cursor-pointer"
                >
                  X
                </span>
                <div className="avatar">
                  <div className="mask mask-squircle w-14">
                    <Image
                      width={100}
                      height={100}
                      src={
                        pola?.avatar ||
                        "https://i.ibb.co.com/2hCrWYB/470181383-1221349485635395-209613915809854821-n.jpg"
                      }
                      alt={pola.name}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className="loading loading-bars loading-xs"></span>
          )}
        </div>
        <button className="btn btn-primary" type="submit">
          Next
        </button>
      </form>
    </div>
  );
};

export default AddExpenses;
