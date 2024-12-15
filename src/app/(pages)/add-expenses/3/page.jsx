"use client";
import { useKhoroch } from "@/context/addKhoroch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AddExpenses3 = () => {
  const router = useRouter();
  const { polapains, khroch, setKhoroch } = useKhoroch();
  const { handleSubmit, register } = useForm();
  const [managerDise, setManagerDise] = useState(0);
  const onSubmit = (data) => {
    let amount = Number(managerDise || 0);
    data.dise.forEach((d) => {
      amount += Number(d.amount);
    });
    if (Math.abs(khroch.amount - amount) > 1) {
      console.log(khroch.amount, amount);
      toast.error("Amount is not equal to total amount");
      return;
    }

    setKhoroch({
      ...khroch,
      ...data,
      date: new Date(),
    });
    router.push("/add-expenses/4");
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-5 my-10">
      <h1 className="text-center text-3xl font-bold">Diya dise</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-5 w-full my-10"
      >
        {polapains?.length ? (
          polapains.map((polapain, i) => (
            <div key={polapain._id} className="flex gap-3 items-center">
              <div className="avatar tooltip" data-tip={polapain.name}>
                <div className="mask mask-squircle w-12">
                  <img src={polapain.avatar} />
                </div>
              </div>
              <input
                className="hidden"
                type="text"
                value={polapain._id}
                {...register(`dise.${i}.id`)}
              />
              <input
                className="hidden"
                type="text"
                value={polapain.name}
                {...register(`dise.${i}.name`)}
              />
              <input
                className="hidden"
                type="text"
                value={polapain.avatar}
                {...register(`dise.${i}.avatar`)}
              />
              <input
                className="input input-bordered w-40"
                type="number"
                placeholder="Amount"
                defaultValue={0}
                {...register(`dise.${i}.amount`)}
              />
            </div>
          ))
        ) : (
          <span className="loading loading-bars loading-sm"></span>
        )}
        <div className="flex gap-3 items-center">
          <label className="label">Manager</label>
          <input
            className="input input-bordered w-40"
            type="number"
            placeholder="Amount"
            defaultValue={0}
            onChange={(e) => setManagerDise(e.target.value)}
          />
        </div>
        <div className="flex w-full max-w-72 justify-between my-10">
          <Link className="btn btn-primary" href="/add-expenses/2">
            Previous
          </Link>
          <button className="btn btn-primary" type="submit">
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenses3;
