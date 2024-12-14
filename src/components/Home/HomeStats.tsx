"use client";
import Image from "next/image";

const images = [
  {
    src: "/images/1.jpg",
    alt: "Photo 1",
  },
  {
    src: "/images/2.jpg",
    alt: "Photo 2",
  },
  {
    src: "/images/3.jpg",
    alt: "Photo 3",
  },
  {
    src: "/images/4.jpg",
    alt: "Photo 4",
  },
  {
    src: "/images/5.jpg",
    alt: "Photo 5",
  },
  {
    src: "/images/6.jpg",
    alt: "Photo 6",
  },
  {
    src: "/images/7.jpg",
    alt: "Photo 7",
  },
  {
    src: "/images/8.jpg",
    alt: "Photo 8",
  },
  {
    src: "/images/9.jpg",
    alt: "Photo 9",
  },
  {
    src: "/images/10.jpg",
    alt: "Photo 10",
  },
  {
    src: "/images/11.jpg",
    alt: "Photo 11",
  },
];
const HomeStats = () => {
  return (
    <section>
      <h1 className="text-center text-4xl font-bold my-10">Photos</h1>
      <div className="flex gap-3 flex-wrap justify-center items-baseline">
        {images.map((image, index) => (
          <div className="max-w-xs h-full" key={index}>
            <Image
              src={image.src}
              alt={image.alt}
              width={300}
              height={300}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeStats;
