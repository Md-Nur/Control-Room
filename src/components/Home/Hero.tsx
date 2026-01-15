"use client";
import Link from "next/link";
import { usePolapainAuth } from "@/context/polapainAuth";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaCheck, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const Hero = () => {
  const { polapainAuth } = usePolapainAuth();
  const [heroImage, setHeroImage] = useState(
    "https://i.ibb.co.com/HnmfKMd/PXL-20241204-062046799-PORTRAIT.jpg"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch Hero Image
    axios.get("/api/settings?key=hero_image").then((res) => {
      if (res.data?.value) {
        setHeroImage(res.data.value);
        setNewImage(res.data.value);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      if (!newImage) return toast.error("Image URL cannot be empty");
      
      await axios.post("/api/settings", {
        key: "hero_image",
        value: newImage,
      });
      
      setHeroImage(newImage);
      setIsEditing(false);
      toast.success("Hero image updated!");
    } catch (error) {
      toast.error("Failed to update image");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await axios.post(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          formData
      );
      
      const url = res.data.data.url;
      setNewImage(url);
      setUploading(false);
    } catch (error) {
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  return (
    <div
      className="hero h-[60vh] min-h-[500px] mb-12 relative group"
      style={{
        backgroundImage: `url(${heroImage})`,
      }}
    >
      <div className="hero-overlay bg-black/60"></div>
      
      {/* Edit Button */}
      {polapainAuth && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             className="btn btn-circle btn-sm btn-ghost bg-base-100/20 text-white hover:bg-base-100/40"
             onClick={() => {
                 setIsEditing(true);
                 setNewImage(heroImage);
             }}
           >
              <FaEdit />
           </button>
        </div>
      )}

      {/* Edit Modal / Popover */}
      {isEditing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="card w-full max-w-lg bg-base-100 shadow-2xl animate-in zoom-in duration-200">
                  <div className="card-body">
                      <h3 className="text-lg font-bold">Change Hero Image</h3>
                      
                      <div className="form-control">
                          <label className="label">Image URL</label>
                          <input 
                              type="text" 
                              className="input input-bordered" 
                              value={newImage}
                              onChange={(e) => setNewImage(e.target.value)}
                              placeholder="https://..."
                          />
                      </div>
                      
                      <div className="divider">OR</div>
                      
                      <div 
                        className="border-2 border-dashed border-base-content/20 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-base-200 hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                           {uploading ? (
                               <span className="loading loading-spinner text-primary"></span>
                           ) : (
                               <>
                                   <FaCloudUploadAlt className="text-3xl mb-2 text-primary" />
                                   <span className="text-sm font-bold">Upload New Photo</span>
                               </>
                           )}
                           <input 
                               type="file" 
                               ref={fileInputRef} 
                               className="hidden" 
                               accept="image/*"
                               onChange={handleFileUpload}
                           />
                      </div>

                      <div className="card-actions justify-end mt-4">
                          <button 
                             className="btn btn-ghost"
                             onClick={() => setIsEditing(false)}
                          >
                             Cancel
                          </button>
                          <button 
                             className="btn btn-primary"
                             onClick={handleSave}
                             disabled={uploading}
                          >
                             Save Changes
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="hero-content text-neutral-content text-center z-10">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Control Room</h1>
          <p className="mb-5">
            Your flatmate expense tracker. Manage shared expenses, track balances, and settle up easily.
          </p>
          {polapainAuth && (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/add-expenses" className="btn btn-primary font-bold shadow-lg hover:scale-105 transition-transform">
                💸 Add Expense
              </Link>
              <Link href="/all-balance" className="btn btn-secondary font-bold shadow-lg hover:scale-105 transition-transform text-secondary-content">
                💰 View Balances
              </Link>
            </div>
          )}
          {!polapainAuth && (
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
