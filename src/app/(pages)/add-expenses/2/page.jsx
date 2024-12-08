"use client";
import { useKhoroch } from "@/context/addKhoroch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const AddExpense2 = () => {
  const router = useRouter();

  const { polapains, khroch, setKhoroch } = useKhoroch();
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
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
              className="flex justify-between w-full max-w-80"
            >
              <label className="label">{polapain.name}</label>
              <input
                className="hidden"
                type="text"
                value={polapain._id}
                {...register(`dibo.${i}.id`)}
              />
              <input
                className="input input-bordered"
                type="number"
                placeholder="Amount"
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
        <div className="flex w-full max-w-80 justify-between my-10">
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
