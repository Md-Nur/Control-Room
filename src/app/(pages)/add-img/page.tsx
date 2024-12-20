"use client";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaImage } from "react-icons/fa";

const AddImg = () => {
  const imgFile = useRef(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const router = useRouter();
  const { register, handleSubmit } = useForm<PhotoData>();

  interface PhotoData {
    title: string;
    date: string;
    img: string;
    isPrivate?: boolean;
  }
  const onFileChange = () => {
    // console.log(avatarFile.current);
    const file: File | null =
      (imgFile.current as unknown as HTMLInputElement)?.files?.[0] || null;
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };
  const onSubmit: SubmitHandler<PhotoData> = async (data) => {
    // console.log(data);
    setProgress(10);
    const file: File | null =
      (imgFile.current as unknown as HTMLInputElement)?.files?.[0] || null;
    setProgress(20);
    if (file) {
      setProgress(30);
      const formData = new FormData();
      formData.append("image", file);
      setProgress(40);
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formData
      );
      setProgress(80);
      toast.dismiss();
      data.img = response.data.data.url;
    } else {
      toast.error("Please select a photo");
      return;
    }
    data.date = new Date().toISOString();
    try {
      await axios.post("/api/img", data);
      setProgress(100);
      toast.success("Photo added successfully");
      router.push("/");
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
      // console.log(error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.error || error.message || "Something went wrong"
      );
    }
  };
  return (
    <section>
      <h1 className="text-center text-4xl font-bold my-10">Photos</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-3 flex-col justify-center items-center"
      >
        <div className="flex w-full max-w-72 justify-between">
          <label className="label">Title</label>
          <input
            className="input input-bordered w-40"
            type="text"
            placeholder="Title"
            {...register("title")}
            required
          />
        </div>
        <div className="flex w-full max-w-72 justify-between">
          <label className="label">Date</label>
          <input
            className="input input-bordered w-40"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            {...register("date")}
            required
          />
        </div>
        <label
          htmlFor="avatar"
          className="btn btn-outline w-auto h-auto m-3 p-5"
        >
          {preview ? (
            <Image
              alt="photos"
              height={300}
              width={300}
              className="w-72"
              src={preview}
            />
          ) : (
            <FaImage className="w-72 h-72" />
          )}
        </label>
        <input
          accept="image/*"
          onChange={onFileChange}
          ref={imgFile}
          id="avatar"
          type="file"
          className="hidden"
          required
        />
        <progress
          className={`progress progress-primary w-80 block mx-auto ${
            progress === 100 || progress === 0 ? "hidden" : ""
          }`}
          value={progress}
          max="100"
        ></progress>
        <div className="form-control">
          <label className="label cursor-pointer gap-3">
            <span className="label-text">Private</span>
            <input
              type="checkbox"
              defaultChecked={false}
              className="checkbox checkbox-primary"
              {...register("isPrivate")}
            />
          </label>
        </div>
        <button
          className="btn btn-primary m-3 block mx-auto"
          disabled={progress === 100 || !preview}
        >
          Upload
        </button>
      </form>
    </section>
  );
};

export default AddImg;
