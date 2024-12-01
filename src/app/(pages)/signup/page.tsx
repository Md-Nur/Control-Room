"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaUserAlt } from "react-icons/fa";

const SignUp = () => {
  const { handleSubmit, register } = useForm();
  const avatarFile = useRef(null);
  const [avatar, setAvatar] = useState("");
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const auth = usePolapainAuth();
  if (typeof auth === "string") {
    throw new Error(auth);
  }
  const { polapainAuth, setPolapainAuth } = auth;
  if (polapainAuth) {
    router.push("/dashboard");
    return null;
  }

  const onSubmit = async (data: any) => {
    toast.loading("Signing up...");
    data.avatar = avatar;
    try {
      const polapain = await axios.post("/api/signup", data);
      toast.dismiss();
      if (polapain.status >= 400) {
        toast.error(polapain.data.error);
      } else {
        toast.success("Welcome chutiya");
        setPolapainAuth(polapain.data);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.log(error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.error || error.message || "Something went wrong"
      );
    }
  };

  const onFileChange = () => {
    console.log(avatarFile.current);
    const file: File | null =
      (avatarFile.current as unknown as HTMLInputElement)?.files?.[0] || null;
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    setProgress(10);
    const file: File | null =
      (avatarFile.current as unknown as HTMLInputElement)?.files?.[0] || null;
    setProgress(20);
    if (file) {
      setProgress(30);
      const formData = new FormData();
      setProgress(40);
      formData.append("image", file);
      setProgress(50);
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formData
      );
      setProgress(90);
      setAvatar(response.data.data.url);
      setProgress(100);
      toast.success("Avatar uploaded");
    }
  };

  return (
    <div className="h-full w-full my-10">
      <h1 className="text-5xl font-bold text-center my-5">Sign Up Kor!</h1>
      <div className="flex justify-center gap-5 items-center flex-col lg:flex-row-reverse w-full">
        <div className="">
          <label
            htmlFor="avatar"
            className="btn btn-outline w-auto h-auto m-3 p-5"
          >
            {preview ? (
              <Image
                alt="avatar"
                height={300}
                width={300}
                className="w-72"
                src={preview}
              />
            ) : (
              <FaUserAlt className="w-72 h-72" />
            )}
          </label>

          <input
            accept="image/*"
            onChange={onFileChange}
            ref={avatarFile}
            id="avatar"
            type="file"
            className="hidden"
          />
          <progress
            className={`progress progress-primary w-80 block mx-auto ${
              progress === 100 || progress === 0 ? "hidden" : ""
            }`}
            value={progress}
            max="100"
          ></progress>
          <button
            onClick={uploadAvatar}
            className="btn btn-primary m-3 block mx-auto"
            disabled={progress === 100 || !preview}
          >
            Upload
          </button>
        </div>
        <div className="card bg-base-300 w-96 shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
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
                <span className="label-text">Phone</span>
              </label>
              <input
                type="text"
                placeholder="Phone Number"
                className="input input-bordered"
                {...register("phone")}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date of Birth</span>
              </label>
              <input
                type="date"
                placeholder="Phone Number"
                className="input input-bordered"
                {...register("dob")}
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

export default SignUp;
