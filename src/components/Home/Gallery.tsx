"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
// @ts-expect-error - no types for react-responsive-masonry
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import CreativeLoader from "@/components/CreativeLoader";
import AddPhotoModal from "./AddPhotoModal";

interface Photo {
  _id: string;
  title: string;
  date: string;
  img: string;
  isPrivate?: boolean;
}

const Gallery = () => {
  const { polapainAuth } = usePolapainAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Memoize fetchPhotos to use in useEffect and callbacks
  const fetchPhotos = useCallback(async () => {
      try {
        const res = await axios.get("/api/img");
        setPhotos(res.data);
      } catch (_error: unknown) {
        toast.error("Failed to load photos");
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    // document.body.style.overflow = "hidden"; // Optional: keep scrolling enabled or disabled
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    // document.body.style.overflow = "auto";
  };

  return (
    <section className="w-full px-4 py-12 md:py-20 pb-24 md:pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            📸 Gallery
          </h1>
          {polapainAuth && (
            <button 
                onClick={() => setIsUploadOpen(true)}
                className="btn btn-primary btn-sm md:btn-md shadow-lg hover:scale-105 transition-transform"
            >
               ➕ Add Memory
            </button>
          )}
        </div>

        {loading ? (
             <CreativeLoader />
        ) : photos.length > 0 ? (
          <ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}
            >
                <Masonry gutter="1.5rem">
                    {photos.map((photo) => (
                        <div 
                            key={photo._id} 
                            className="w-full relative group cursor-zoom-in overflow-hidden rounded-xl shadow-md border border-base-200 bg-base-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                            onClick={() => openLightbox(photo)}
                        >
                            <div className="relative w-full aspect-square">
                                <Image
                                    src={photo.img}
                                    alt={photo.title || "Gallery image"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{photo.title}</h3>
                                    <p className="text-white/80 text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">{photo.date}</p>
                                </div>
                                {photo.isPrivate && (
                                    <div className="absolute top-2 right-2 badge badge-error gap-2 shadow-lg">
                                        🔒 Private
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        ) : (
          <div className="text-center py-20 bg-base-200 rounded-xl">
            <h3 className="text-2xl font-bold opacity-50">No photos found</h3>
            <p className="opacity-40 mt-2">Upload some photos to get started!</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <AddPhotoModal 
            onClose={() => setIsUploadOpen(false)} 
            onSuccess={fetchPhotos}
        />
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeLightbox}
        >
            <button 
                className="absolute top-4 right-4 btn btn-circle btn-ghost text-white text-xl hover:bg-white/20"
                onClick={closeLightbox}
            >
                ✕
            </button>
            
            <div 
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()} // Prevent close on image click
            >
                <div className="relative w-full h-[80vh]">
                    <Image 
                        src={selectedPhoto.img} 
                        alt={selectedPhoto.title || "Selected image"} 
                        fill
                        className="object-contain rounded-lg shadow-2xl"
                    />
                </div>
                <div className="mt-4 text-center text-white">
                    <h2 className="text-2xl font-bold">{selectedPhoto.title}</h2>
                    <p className="opacity-70 mt-1">{selectedPhoto.date}</p>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
