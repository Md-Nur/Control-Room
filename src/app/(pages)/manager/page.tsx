"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Manager = () => {
  const [polapains, setPolapains] = useState<Polapain[]>();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit } = useForm<{
    addTaka: { id: string; amount: number }[];
  }>();
  const router = useRouter();
  useEffect(() => {
    axios
      .get<Polapain[]>("/api/polapain")
      .then((res) => {
        setPolapains(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const onSubmit = (data: { addTaka: { id: string; amount: number }[] }) => {
    axios
      .post("/api/add-taka", data.addTaka)
      .then(() => {
        toast.success("Taka added successfully");
        router.push("/all-balance");
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
  };

  return (
    <section className="flex flex-wrap">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl my-10">
        <h1 className="text-3xl font-bold text-center">Add Taka</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          {!loading &&
            polapains?.map((polapain, i) => (
              <div className="flex" key={i}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{polapain.name}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Taka"
                    className="hidden"
                    required
                    value={polapain._id}
                    {...register(`addTaka.${i}.id`)}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="input input-bordered"
                    required
                    {...register(`addTaka.${i}.amount`)}
                    defaultValue={0}
                  />
                </div>
              </div>
            ))}
          <div className="form-control mt-6">
            <button className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Manager;
