"use client";
import { useKhoroch } from "@/context/addKhoroch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const AddExpense2 = () => {
  const router = useRouter();

  const { polapains, khroch, setKhoroch } = useKhoroch();
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    let amount = 0;
    data.dibo.forEach((d) => {
      amount += Number(d.amount);
    });
    if (Math.abs(khroch.amount - amount) > 1) {
      toast.error("Amount is not equal to total amount");
      return;
    }
    setKhoroch({
      ...khroch,
      ...data,
    });
    router.push("/add-expenses/3");
  };
  return (
    <div className="w-full max-w-3xl mx-auto px-5">
      <h1 className="text-center text-3xl font-bold my-10">Dite Hobe</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-3 w-full my-10"
      >
        {polapains?.length ? (
          polapains.map((polapain, i) => (
            <div
              key={polapain._id}
              className="flex gap-3 items-center"
            >
              <div className="avatar tooltip" data-tip={polapain.name}>
                <div className="mask mask-squircle w-12">
                  <img src={polapain.avatar} />
                </div>
              </div>
              <input
                className="hidden"
                type="text"
                value={polapain._id}
                {...register(`dibo.${i}.id`)}
              />
              <input
                className="hidden"
                type="text"
                value={polapain.name}
                {...register(`dibo.${i}.name`)}
              />
              <input
                className="hidden"
                type="text"
                value={polapain.avatar}
                {...register(`dibo.${i}.avatar`)}
              />
              <input
                className="input input-bordered w-40"
                type="number"
                placeholder="Amount"
                step="any"
                defaultValue={
                  (khroch?.amount &&
                    (khroch.amount / polapains.length).toFixed(2)) ||
                  0
                }
                {...register(`dibo.${i}.amount`)}
              />
            </div>
          ))
        ) : (
          <span className="loading loading-bars loading-sm"></span>
        )}
        <div className="flex w-full max-w-72 justify-between my-10">
          <Link className="btn btn-primary" href="/add-expenses/1">
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

export default AddExpense2;
