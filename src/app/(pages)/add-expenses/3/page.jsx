"use client";
import { useKhoroch } from "@/context/addKhoroch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const AddExpenses3 = () => {
  const router = useRouter();
  const { polapains, khroch, setKhoroch } = useKhoroch();
  const { handleSubmit, register } = useForm();

  const onSubmit = (data) => {
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
        className="flex flex-col items-center gap-3 w-full my-10"
      >
        {polapains?.length ? (
          polapains.map((polapain, i) => (
            <div
              key={polapain._id}
              className="flex w-full max-w-80 justify-between"
            >
              <label className="label">{polapain.name}</label>
              <input
                className="hidden"
                type="text"
                value={polapain._id}
                {...register(`dise.${i}.id`)}
              />
              <input
                className="input input-bordered"
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
        <div className="flex w-full max-w-80 justify-between my-10">
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
