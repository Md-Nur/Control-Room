"use client";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, DragEvent } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaImage, FaTimes, FaTrash } from "react-icons/fa";

const AddImg = () => {
    const imgFile = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [defaultDate, setDefaultDate] = useState("");
    
    const router = useRouter();
    const { register, handleSubmit, setValue } = useForm<PhotoData>();

    interface PhotoData {
        title: string;
        date: string;
        img: string;
        isPrivate?: boolean;
    }

    useEffect(() => {
        setDefaultDate(new Date().toISOString().split("T")[0]);
    }, []);

    const handleFile = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }
        setPreview(URL.createObjectURL(file));
        // Reset file input if needed or handle manually
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
        
        // Update the hidden input file manually if needed
        if (imgFile.current && file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imgFile.current.files = dataTransfer.files;
        }
    };

    const removeImage = () => {
        setPreview("");
        if (imgFile.current) {
            imgFile.current.value = "";
        }
    };

    const onSubmit: SubmitHandler<PhotoData> = async (data) => {
        const file = imgFile.current?.files?.[0];
        
        if (!file && !data.img) {
            toast.error("Please select a photo");
            return;
        }

        try {
            setProgress(10);
            
            // Upload to ImgBB
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

            // Save to DB
            await axios.post("/api/img", data);
            setProgress(100);
            toast.success("Photo added successfully!");
            router.push("/");
            
        } catch (error: any) {
            setProgress(0);
            console.error(error);
            toast.error(error?.response?.data?.error || "Failed to upload photo");
        }
    };

    return (
        <section className="min-h-screen py-10 px-4 md:px-8 max-w-2xl mx-auto pb-24">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">
                    Upload Memory
                </h1>
                <p className="text-sm opacity-60 mt-2">Share your moments with the squad</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Zone */}
                <div 
                    className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 ${
                        isDragging 
                            ? "border-primary bg-primary/10 scale-[1.02]" 
                            : preview 
                                ? "border-transparent p-0 overflow-hidden shadow-2xl" 
                                : "border-base-content/20 hover:border-primary/50 hover:bg-base-200/50"
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
                                width={600} 
                                height={600} 
                                className="w-full h-auto rounded-3xl object-cover max-h-[500px]"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                <button 
                                    type="button" 
                                    onClick={removeImage}
                                    className="btn btn-circle btn-error btn-lg text-white"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="flex flex-col items-center justify-center h-64 cursor-pointer"
                            onClick={() => imgFile.current?.click()}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/40"}`}>
                                <FaCloudUploadAlt className="text-4xl" />
                            </div>
                            <h3 className="font-bold text-lg">Click or Drag Image Here</h3>
                            <p className="text-xs opacity-50 mt-2">Supports JPG, PNG, GIF</p>
                        </div>
                    )}
                    
                    <input
                        ref={imgFile}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                    />
                </div>

                {/* Form Fields */}
                <div className="grid gap-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-bold">Caption</span>
                        </label>
                        <input
                            type="text"
                            placeholder="What's this memory about?"
                            className="input input-bordered w-full focus:input-primary rounded-xl"
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
                                defaultValue={defaultDate}
                                className="input input-bordered w-full focus:input-primary rounded-xl"
                                {...register("date", { required: true })}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-bold">Visibility</span>
                            </label>
                            <label className="label cursor-pointer justify-start gap-4 p-3 border border-base-content/20 rounded-xl hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    {...register("isPrivate")}
                                />
                                <span className="label-text">Private Photo</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {progress > 0 && progress < 100 && (
                    <div className="w-full">
                        <progress 
                            className="progress progress-primary w-full h-3" 
                            value={progress} 
                            max="100"
                        ></progress>
                        <p className="text-center text-xs mt-2 font-mono opacity-60">Uploading... {progress}%</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!preview && !progress) || (progress > 0 && progress < 100)}
                >
                    {progress > 0 && progress < 100 ? (
                        <span className="loading loading-spinner text-primary-content"></span>
                    ) : (
                        "Upload Memory"
                    )}
                </button>
            </form>
        </section>
    );
};

export default AddImg;
