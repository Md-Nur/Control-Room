"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { usePolapainAuth } from "@/context/polapainAuth";
import toast from "react-hot-toast";
import DateInput from "@/components/DateInput";
import StepIndicator from "@/components/StepIndicator";
import CreativeLoader from "@/components/CreativeLoader";

const AddMealPage = () => {
    const router = useRouter();
    const { polapainAuth } = usePolapainAuth();
    const [polapains, setPolapains] = useState<{_id: string, name: string, avatar?: string}[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [mealTypes, setMealTypes] = useState({
        breakfast: false,
        lunch: false,
        dinner: false
    });
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingMealUserIds, setExistingMealUserIds] = useState<string[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        const fetchPolapains = async () => {
            try {
                const res = await axios.get("/api/polapain");
                setPolapains(res.data);
            } catch (err) {
                toast.error("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        fetchPolapains();
    }, []);

    const handleToggleMember = (id: string) => {
        setSelectedMemberIds(prev => 
            prev.includes(id) 
            ? prev.filter(mId => mId !== id)
            : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedMemberIds.length === polapains.length) {
            setSelectedMemberIds([]);
        } else {
            setSelectedMemberIds(polapains.map(p => p._id));
        }
    };

    const checkExistingMeals = async () => {
        setIsValidating(true);
        try {
            // We can fetch meals for the selected date and see which users already have records
            // The /api/meals GET endpoint supports date filtering
            const res = await axios.get(`/api/meals?dateFrom=${date}&dateTo=${date}&limit=100`);
            const existingMeals = res.data.meals;
            const existingIds = existingMeals.map((m: any) => m.user._id);
            const duplicates = selectedMemberIds.filter(id => existingIds.includes(id));
            setExistingMealUserIds(duplicates);
        } catch (err) {
            console.error("Failed to check existing meals", err);
        } finally {
            setIsValidating(false);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1 && selectedMemberIds.length === 0) {
            toast.error("Please select at least one member");
            return;
        }
        if (currentStep === 2 && !mealTypes.breakfast && !mealTypes.lunch && !mealTypes.dinner) {
            toast.error("Please select at least one meal type");
            return;
        }
        
        if (currentStep === 2) {
            await checkExistingMeals();
        }

        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const loadingToast = toast.loading("Adding meals...");
        try {
            // Send requests for each user
            const promises = selectedMemberIds.map(userId => 
                axios.post("/api/meals", {
                    userId,
                    date,
                    ...mealTypes
                })
            );
            await Promise.all(promises);
            toast.dismiss(loadingToast);
            toast.success("Meals added successfully!");
            router.push("/meal-summary");
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Failed to add some meals");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!polapainAuth || loading) return <CreativeLoader />;

    const stepLabels = ["Select Members", "Meal Info", "Review"];

    return (
        <section className="w-full min-h-screen py-16 px-4 pb-32">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-primary">🍟 Add Meal</h1>
                    <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Multi-user Entry</p>
                </div>

                <StepIndicator currentStep={currentStep} totalSteps={3} stepLabels={stepLabels} />

                <div className="mt-8 space-y-6">
                    {/* Step 1: Members */}
                    {currentStep === 1 && (
                        <div className="card bg-base-200/50 shadow-xl rounded-2xl border border-base-content/5">
                            <div className="card-body p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="card-title text-2xl font-black">👥 Participants</h2>
                                    <button onClick={handleSelectAll} className="btn btn-sm btn-ghost rounded-xl">
                                        {selectedMemberIds.length === polapains.length ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {polapains.map((member) => {
                                        const isSelected = selectedMemberIds.includes(member._id);
                                        return (
                                            <div 
                                                key={member._id}
                                                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                                                    isSelected 
                                                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/5 scale-105" 
                                                    : "border-transparent bg-base-100 hover:bg-base-300/50"
                                                }`}
                                                onClick={() => handleToggleMember(member._id)}
                                            >
                                                <div className="avatar">
                                                    <div className={`w-16 h-16 rounded-full ring ring-offset-2 ${isSelected ? "ring-primary" : "ring-transparent"}`}>
                                                        <Image src={member.avatar || "/avatar.jpg"} alt={member.name} width={64} height={64} className="rounded-full" />
                                                    </div>
                                                </div>
                                                <span className="font-bold text-sm text-center truncate w-full">{member.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="card-actions justify-end mt-8">
                                    <button className="btn btn-primary rounded-2xl px-8" onClick={handleNext}>Next Step →</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Meal Info */}
                    {currentStep === 2 && (
                        <div className="card bg-base-200/50 shadow-xl rounded-2xl border border-base-content/5">
                            <div className="card-body p-8">
                                <h2 className="card-title text-2xl font-black mb-6">🍱 Meal Details</h2>
                                <div className="space-y-6">
                                    <DateInput
                                        label="Select Date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="rounded-2xl h-14"
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['breakfast', 'lunch', 'dinner'] as const).map(type => (
                                            <button 
                                                key={type}
                                                className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all duration-300 ${mealTypes[type] ? 'bg-primary/10 border-primary text-primary scale-105 shadow-lg shadow-primary/5' : 'border-transparent bg-base-100 opacity-50 hover:opacity-100'}`}
                                                onClick={() => setMealTypes({...mealTypes, [type]: !mealTypes[type]})}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{type.slice(0, 3)}</span>
                                                <span className="text-4xl">
                                                    {type === 'breakfast' ? '🥪' : type === 'lunch' ? '🍱' : '🍽️'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="card-actions justify-between mt-10">
                                    <button className="btn btn-ghost rounded-2xl" onClick={handleBack}>← Back</button>
                                    <button 
                                        className="btn btn-primary rounded-2xl px-12" 
                                        onClick={handleNext}
                                        disabled={isValidating}
                                    >
                                        {isValidating ? (
                                            <span className="flex items-center gap-2">
                                                <span className="loading loading-spinner loading-xs"></span>
                                                Validating...
                                            </span>
                                        ) : "Review →"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {currentStep === 3 && (
                        <div className="card bg-base-200/50 shadow-xl rounded-2xl border border-base-content/5">
                            <div className="card-body p-8">
                                <h2 className="card-title text-2xl font-black mb-6">✅ Review Entry</h2>
                                
                                {existingMealUserIds.length > 0 && (
                                    <div className="alert alert-warning shadow-lg mb-6 rounded-2xl border-none bg-warning/20 text-warning-content animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⚠️</span>
                                            <div>
                                                <h3 className="font-bold text-sm">Duplicate Entry Warning</h3>
                                                <div className="text-[10px] opacity-80 leading-tight">
                                                    The following users already have meal records for this date:
                                                    <span className="font-bold ml-1">
                                                        {polapains.filter(p => existingMealUserIds.includes(p._id)).map(p => p.name).join(", ")}
                                                    </span>.
                                                    Saving will overwrite their existing records.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-base-100 p-6 rounded-2xl space-y-4 shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase opacity-40">Date</span>
                                        <span className="font-bold">{format(new Date(date), "dd-MM-yyyy")}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase opacity-40">Meals</span>
                                        <div className="flex gap-2">
                                            {mealTypes.breakfast && <span className="badge badge-primary font-black uppercase text-[10px] p-2">Breakfast</span>}
                                            {mealTypes.lunch && <span className="badge badge-primary font-black uppercase text-[10px] p-2">Lunch</span>}
                                            {mealTypes.dinner && <span className="badge badge-primary font-black uppercase text-[10px] p-2">Dinner</span>}
                                        </div>
                                    </div>
                                    <div className="divider opacity-10"></div>
                                    <div>
                                        <span className="text-xs font-black uppercase opacity-40 block mb-3">Recipients ({selectedMemberIds.length})</span>
                                        <div className="flex flex-wrap gap-2">
                                            {polapains.filter(p => selectedMemberIds.includes(p._id)).map(p => (
                                                <div key={p._id} className="flex items-center gap-2 bg-base-200 px-3 py-1.5 rounded-full ring-1 ring-base-content/5">
                                                    <div className="avatar">
                                                        <div className="w-5 rounded-full">
                                                            <Image src={p.avatar || "/avatar.jpg"} alt={p.name} width={20} height={20} />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-actions justify-between mt-10">
                                    <button className="btn btn-ghost rounded-2xl" onClick={handleBack}>← Back</button>
                                    <button 
                                        className="btn btn-success rounded-2xl px-12 font-black text-white hover:scale-105 transition-transform" 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Processing..." : "Confirm & Save ✓"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AddMealPage;
