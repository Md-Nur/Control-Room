"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Manager = () => {
  const [polapains, setPolapains] = useState<Polapain[]>();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit } = useForm<{
    id: string;
    amount: number;
  }>();
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

  const onSubmit = (data: { id: string; amount: number }) => {
    axios
      .post("/api/add-taka", data)
      .then(() => {
        
        toast.success("Taka added successfully");
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      });
  };

  return (
    <section className="flex flex-wrap">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <h1 className="text-3xl font-bold text-center">Add Taka</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <select {...register("id")} className="select select-bordered">
              <option>Select</option>
              {!loading &&
                polapains?.map((polapain) => (
                  <option key={polapain._id} value={polapain._id}>
                    {polapain.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <input
              type="number"
              placeholder="Taka"
              className="input input-bordered"
              required
              {...register("amount")}
            />
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Manager;