"use client";
import React, { useRef, useState, DragEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";

interface AddPhotoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PhotoData {
  title: string;
  date: string;
  img: string;
  isPrivate?: boolean;
}

const AddPhotoModal = ({ onClose, onSuccess }: AddPhotoModalProps) => {
  const imgFile = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<PhotoData>({
    defaultValues: {
        date: new Date().toISOString().split("T")[0]
    }
  });

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setPreview(URL.createObjectURL(file));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
    if (imgFile.current && file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      imgFile.current.files = dataTransfer.files;
    }
  };

  const removeImage = () => {
    setPreview("");
    if (imgFile.current) imgFile.current.value = "";
  };

  const onSubmit: SubmitHandler<PhotoData> = async (data) => {
    const file = imgFile.current?.files?.[0];

    if (!file && !data.img) {
      toast.error("Please select a photo");
      return;
    }

    try {
      setProgress(10);
      
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
        setProgress(30);
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          formData
        );
        data.img = response.data.data.url;
        setProgress(70);
      }

      await axios.post("/api/img", data);
      setProgress(100);
      toast.success("Photo added successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      setProgress(0);
      toast.error(error?.response?.data?.error || "Failed to upload photo");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
        >✕</button>
        
        <div className="card-body">
            <h2 className="text-2xl font-bold text-center mb-6">Upload Memory</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Drag & Drop Zone */}
                <div 
                    className={`relative border-2 border-dashed rounded-3xl p-6 transition-all duration-300 ${
                        isDragging 
                            ? "border-primary bg-primary/10 scale-[1.02]" 
                            : preview 
                                ? "border-transparent p-0 overflow-hidden shadow-md" 
                                : "border-base-content/20 hover:border-primary/50 hover:bg-base-200"
                    }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {preview ? (
                        <div className="relative group">
                            <Image 
                                src={preview} 
                                alt="Preview" 
                                width={400} 
                                height={400} 
                                className="w-full h-auto rounded-3xl object-cover max-h-[300px]"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className="btn btn-circle btn-error text-white"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="flex flex-col items-center justify-center h-48 cursor-pointer"
                            onClick={() => imgFile.current?.click()}
                        >
                            <FaCloudUploadAlt className="text-4xl mb-3 text-base-content/40" />
                            <h3 className="font-bold">Click or Drag Image</h3>
                            <p className="text-xs opacity-50 mt-1">Supports JPG, PNG</p>
                        </div>
                    )}
                    <input ref={imgFile} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>

                {/* Fields */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-bold">Caption</span>
                    </label>
                    <input
                        type="text"
                        placeholder="What's this memory?"
                        className="input input-bordered w-full rounded-xl"
                        {...register("title", { required: true })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full rounded-xl"
                            {...register("date", { required: true })}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Visibility</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-4 p-3 border border-base-content/20 rounded-xl hover:border-primary">
                            <input type="checkbox" className="toggle toggle-primary" {...register("isPrivate")} />
                            <span className="label-text">Private</span>
                        </label>
                    </div>
                </div>

                {/* Progress */}
                {progress > 0 && progress < 100 && (
                    <div className="w-full">
                        <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
                        <p className="text-center text-xs mt-1 opacity-60">Uploading... {progress}%</p>
                    </div>
                )}

                <button
                    className="btn btn-primary w-full rounded-xl shadow-lg"
                    disabled={(!preview && !progress) || (progress > 0 && progress < 100)}
                >
                    {progress > 0 && progress < 100 ? <span className="loading loading-spinner"></span> : "Upload Memory"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddPhotoModal;
