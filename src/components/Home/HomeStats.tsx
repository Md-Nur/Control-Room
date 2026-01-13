"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { Photos } from "@/models/Photos";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const HomeStats = () => {
  const [images, setImages] = useState<Photos[]>([]);
  const { polapainAuth } = usePolapainAuth();
  useEffect(() => {
    axios
      .get("/api/img")
      .then((res) => {
        setImages(res.data);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Something went wrong");
      });
  }, []);
  return (
    <section className="w-full my-10">
      <h1 className="text-center text-4xl font-bold my-10">Photos</h1>
      <div className="flex gap-3 flex-wrap justify-center items-center w-full">
        {images.length ? (
          images.map(
            (image) =>
              (!image?.isPrivate || polapainAuth) && (
                <div className="card w-72 md:w-96 shadow-xl bg-base-300" key={String(image._id)}>
                  <figure>
                    <Image
                      width={400}
                      height={400}
                      src={image.img}
                      alt={image.title}
                      className="sm:max-h-96 object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{image.title}</h2>
                    <div className="card-actions justify-end">
                      <div className="badge badge-outline">
                        {new Date(image.date)
                          .toUTCString()
                          .split(" ")
                          .slice(0, 4)
                          .join(" ")}
                      </div>
                    </div>
                  </div>
                </div>
              )
          )
        ) : (
          <span className="loading loading-bars loading-lg"></span>
        )}
      </div>
    </section>
  );
};

export default HomeStats;
