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
        console.log(res.data[0].img);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.error || "Something went wrong");
      });
  }, []);
  return (
    <section className="w-full my-10">
      <h1 className="text-center text-4xl font-bold my-10">Photos</h1>
      <div className="flex gap-3 flex-wrap justify-center items-baseline w-full">
        {images.length ? (
          images.map(
            (image) =>
              (!image?.isPrivate || polapainAuth) && (
                <div
                  className="card bg-base-100 w-72 md:w-96 shadow-xl"
                  key={image._id}
                >
                  <figure>
                    <Image
                      width={400}
                      height={400}
                      src={image.img}
                      alt={image.title}
                      className="max-h-[400px] object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{image.title}</h2>
                    <div className="card-actions justify-end">
                      <div className="badge badge-outline">
                        {image.date.split("T")[0]}
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

// const images = [
//   {
//     src: "/images/1.jpg",
//     alt: "Photo 1",
//   },
//   {
//     src: "/images/2.jpg",
//     alt: "Photo 2",
//   },
//   {
//     src: "/images/3.jpg",
//     alt: "Photo 3",
//   },
//   {
//     src: "/images/4.jpg",
//     alt: "Photo 4",
//   },
//   {
//     src: "/images/5.jpg",
//     alt: "Photo 5",
//   },
//   {
//     src: "/images/6.jpg",
//     alt: "Photo 6",
//   },
//   {
//     src: "/images/7.jpg",
//     alt: "Photo 7",
//   },
//   {
//     src: "/images/8.jpg",
//     alt: "Photo 8",
//   },
//   {
//     src: "/images/9.jpg",
//     alt: "Photo 9",
//   },
//   {
//     src: "/images/10.jpg",
//     alt: "Photo 10",
//   },
//   {
//     src: "/images/11.jpg",
//     alt: "Photo 11",
//   },
// ];
