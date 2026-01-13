"use client";
import React, { useRef, useState, useEffect } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import CreativeLoader from "@/components/CreativeLoader";

const ProfilePage = () => {
  const { polapainAuth, setPolapainAuth } = usePolapainAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (polapainAuth?.avatar) {
      setPreview(polapainAuth.avatar);
    }
    checkSubscription();
  }, [polapainAuth]);

  const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
      }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
      setSubscriptionLoading(true);
      try {
          if (!('serviceWorker' in navigator)) {
              toast.error("Service Worker not supported");
              return;
          }

          const registration = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;

          const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
          });

          await axios.post("/api/push/subscribe", {
              userId: polapainAuth?._id,
              subscription
          });

          setIsSubscribed(true);
        toast.success("Push notifications enabled!");
    } catch (_error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = _error as any;
        console.error(error);
        toast.error(error?.message || "Failed to subscribe");
      } finally {
          setSubscriptionLoading(false);
      }
  };

  const handleUnsubscribe = async () => {
      setSubscriptionLoading(true);
      try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
              await subscription.unsubscribe();
              // We could also call backend to remove it, but our utility handles expired subs
              setIsSubscribed(false);
            toast.success("Push notifications disabled");
        }
    } catch {
        toast.error("Failed to unsubscribe");
    } finally {
          setSubscriptionLoading(false);
      }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
        toast.error("Please select an image first");
        return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
        const formData = new FormData();
        formData.append("image", file);
        
        const imgBbRes = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
            formData
        );
        
        const newAvatarUrl = imgBbRes.data.data.url;

        await axios.put("/api/profile", {
            userId: polapainAuth?._id,
            avatar: newAvatarUrl
        });

        if (polapainAuth) {
            setPolapainAuth({ ...polapainAuth, avatar: newAvatarUrl });
        }

        toast.success("Profile picture updated!", { id: toastId });
    } catch (error) {
        console.error(error);
        toast.error("Failed to update profile", { id: toastId });
    } finally {
        setUploading(false);
    }
  };

  if (!polapainAuth) return <CreativeLoader />;

  return (
    <section className="w-full px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold mb-4">Edit Profile</h2>
              
              <div className="avatar mb-4 group relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden relative">
                      <Image src={preview || "/avatar.jpg"} alt={polapainAuth.name} fill className="object-cover" />
                      
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <span className="text-white text-sm font-bold">Change</span>
                      </div>
                  </div>
              </div>

              <h3 className="text-lg font-semibold">{polapainAuth.name}</h3>
              <p className="text-sm text-base-content/70 mb-6">{polapainAuth.phone || "No phone number"}</p>

              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
              />

              <div className="card-actions w-full">
                  <button 
                      className="btn btn-primary w-full" 
                      onClick={handleUpload}
                      disabled={uploading}
                  >
                      {uploading ? <span className="loading loading-spinner"></span> : "Save New Picture"}
                  </button>
              </div>
          </div>
        </div>

        {/* Web Push Section */}
        <div className="card bg-base-100 shadow-xl border border-base-200">
           <div className="card-body">
              <h2 className="card-title text-xl">Push Notifications</h2>
              <p className="text-sm opacity-70">Get alerts on your phone or laptop even when the app is closed.</p>
              
              <div className="flex items-center justify-between mt-4">
                  <span className="font-medium">{isSubscribed ? "Status: Enabled" : "Status: Disabled"}</span>
                  <button 
                    className={`btn btn-sm ${isSubscribed ? 'btn-error btn-outline' : 'btn-success'}`}
                    onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                    disabled={subscriptionLoading}
                  >
                    {subscriptionLoading ? <span className="loading loading-spinner loading-xs"></span> : (isSubscribed ? "Disable" : "Enable")}
                  </button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
