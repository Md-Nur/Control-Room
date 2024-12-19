"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Login = () => {
  const { handleSubmit, register } = useForm<{
    name: string;
    password: string;
  }>();
  const authContext = usePolapainAuth();
  if (typeof authContext === "string") {
    throw new Error(authContext);
  }
  const { setPolapainAuth } = authContext;

  const router = useRouter();

  const onSubmit: SubmitHandler<{
    name: string;
    password: string;
  }> = async (data) => {
    toast.loading("Logging in...");
    try {
      const res = await axios.post("/api/login", data);
      toast.dismiss();
      if (res.data.error) {
        toast.error(res.data.error);
      } else {
        setPolapainAuth(res.data);
        toast.success("Logged in successfully");
        router.push("/dashboard");
      }
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.error || error.message || "Something went wrong"
      );
    }
  };
  return (
    <div className="hero py-10">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Ki bondhu amader data dekhte ashco taile to login korte hobe
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form
            className="card-body bg-base-300"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Name"
                className="input input-bordered"
                required
                {...register("name")}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                required
                {...register("password")}
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
