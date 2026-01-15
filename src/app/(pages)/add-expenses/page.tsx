"use client";
import { useKhoroch } from "@/context/addKhoroch";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import StepIndicator from "@/components/StepIndicator";
import ConfirmDialog from "@/components/ConfirmDialog";

interface FormData {
  title: string;
  amount: number;
  date: string;
  type: string;
  dibo: { id: string; name: string; amount: number; avatar: string }[];
  dise: { id: string; name: string; amount: number; avatar: string }[];
}

const AddExpenses = () => {
  const router = useRouter();
  const { polapains } = useKhoroch();
  const { setPolapainAuth } = usePolapainAuth();
  
  // New state for selected members
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const { handleSubmit, register, watch, setValue, reset, getValues } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "food",
      dibo: [],
      dise: []
    }
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formPreview, setFormPreview] = useState<FormData | null>(null);
  const [diboTotal, setDiboTotal] = useState(0);
  const [diseTotal, setDiseTotal] = useState(0);
  const [defaultDate, setDefaultDate] = useState("");

  const watchedAmount = watch("amount");
  const watchedDibo = watch("dibo");
  const watchedDise = watch("dise");

  // Set default date on client side
  useEffect(() => {
    setDefaultDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Filtered members based on selection
  const selectedMembers = useMemo(() => {
    if (!polapains) return [];
    return polapains.filter(p => selectedMemberIds.includes(p._id));
  }, [polapains, selectedMemberIds]);

  // Sync Form Arrays when selectedMembers changes.
  useEffect(() => {
    // Only init if we are moving forward to step 2/3/4/5 or if we are already in form steps
    if (selectedMembers.length > 0) {
        const currentDibo = getValues("dibo") || [];
        // Helper to check if array matches selection
        const isMatch = currentDibo.length === selectedMembers.length && 
                        currentDibo.every((d, i) => d.id === selectedMembers[i]._id);
        
        if (!isMatch) {
            const newDibo = selectedMembers.map(m => {
                const existing = currentDibo.find(d => d.id === m._id);
                return {
                    id: m._id,
                    name: m.name,
                    amount: existing ? existing.amount : 0,
                    avatar: m.avatar || ""
                };
            });
            setValue("dibo", newDibo);
            
            const currentDise = getValues("dise") || [];
            const newDise = selectedMembers.map(m => {
                const existing = currentDise.find(d => d.id === m._id);
                return {
                    id: m._id,
                    name: m.name,
                    amount: existing ? existing.amount : 0,
                    avatar: m.avatar || ""
                };
            });
            setValue("dise", newDise);
        }
    }
  }, [selectedMembers, setValue, getValues]); // Removed currentStep dependency to keep it synced always

  // Smart Scrolling
  useEffect(() => {
    const stepCardId = `step-card-${currentStep}`;
    const activeCard = document.getElementById(stepCardId);
    if (activeCard) {
      setTimeout(() => {
        activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300); // Increased delay slightly
    }
  }, [currentStep]);

  // Calculate totals - simplified to reduce complexity
  useEffect(() => {
    // Calculate from the FORM values directly to ensure sync
    const sub = watch((value, { name, type }) => {
        if (name?.startsWith('dibo')) {
             const total = (value.dibo as any[])?.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0) || 0;
             setDiboTotal(total);
        }
        if (name?.startsWith('dise')) {
             const total = (value.dise as any[])?.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0) || 0;
             setDiseTotal(total);
        }
    });
    return () => sub.unsubscribe();
  }, [watch]);
  
  // Initial total calc on mount/change (in case watch doesn't fire immediately)
  useEffect(() => {
      if (watchedDibo) {
          setDiboTotal(watchedDibo.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0));
      }
  }, [watchedDibo]);
    
  useEffect(() => {
      if (watchedDise) {
          setDiseTotal(watchedDise.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0));
      }
  }, [watchedDise]);

  const handleEqualSplitDibo = () => {
    if (!watchedAmount || !selectedMembers.length) return;
    const equalAmount = (Number(watchedAmount) / selectedMembers.length).toFixed(2);
    // Use proper array updates
    const newDibo = selectedMembers.map((m) => ({
        id: m._id,
        name: m.name,
        amount: Number(equalAmount),
        avatar: m.avatar || ""
    }));
    setValue("dibo", newDibo, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    toast.success("Split equally among selected members!");
  };

  const handleManagerPaid = () => {
    if (!watchedAmount) return;
    const newDise = selectedMembers.map((m) => ({
        id: m._id,
        name: m.name,
        amount: 0,
        avatar: m.avatar || ""
    }));
    setValue("dise", newDise, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    toast.success("Manager paid set!");
  };

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) 
        ? prev.filter(mId => mId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
     if (polapains) {
         if (selectedMemberIds.length === polapains.length) {
             setSelectedMemberIds([]);
         } else {
             setSelectedMemberIds(polapains.map(p => p._id));
         }
     }
  };

  const validateStep = (step: number): boolean => {
    const amount = watch("amount");
    const title = watch("title");

    switch (step) {
      case 1: // Selection
        if (selectedMemberIds.length === 0) {
            toast.error("Please select at least one member");
            return false;
        }
        return true;
      case 2: // Basic Info
        if (!title || !amount || amount <= 0) {
          toast.error("Please fill in title and amount");
          return false;
        }
        return true;
      case 3: // Who Pays
        if (Math.abs(Number(amount) - diboTotal) > 1) {
          toast.error(
            `Who pays total (${diboTotal.toFixed(2)}) must equal expense amount (${amount})`
          );
          return false;
        }
        return true;
      case 4: // Who Paid
        // Allow BOTH Manager paid (0) OR full amount matched
        if (diseTotal !== 0 && Math.abs(Number(amount) - diseTotal) > 1) {
          toast.error(
            `Who paid total (${diseTotal.toFixed(2)}) must equal expense amount (${amount}) or be 0 (Manager Paid)`
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: FormData) => {
    if (!validateStep(4)) return; // Validate the Who Paid step before review
    // Filter data to only include selected members (extra safety, though the form arrays should be correct)
    const filteredDibo = data.dibo.filter(d => selectedMemberIds.includes(d.id));
    const filteredDise = data.dise.filter(d => selectedMemberIds.includes(d.id));
    
    setFormPreview({
        ...data,
        dibo: filteredDibo,
        dise: filteredDise
    });
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    if (!formPreview) return;
    
    toast.loading("Submitting...");
    setShowConfirm(false);
    
    axios
      .post("/api/all-expenses", formPreview)
      .then(() => {
        toast.dismiss();
        toast.success("Expense added successfully!");
        router.push("/all-balance");
        axios.get("/api/jwt").then((res) => {
          setPolapainAuth(res.data);
        });
      })
      .catch((err) => {
        toast.dismiss();
        toast.error(err?.response?.data?.error || "Something went wrong");
      });
  };

  const stepLabels = ["Select Members", "Basic Info", "Who Pays", "Who Paid", "Review"];

  return (
    <section className="w-full min-h-screen py-10 px-4 pb-24 md:pb-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Add Expense</h1>

        <StepIndicator
          currentStep={currentStep}
          totalSteps={5}
          stepLabels={stepLabels}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Member Selection */}
          <div
            id="step-card-1"
            className={`card bg-base-200 shadow-xl ${
              currentStep === 1 ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="card-title text-2xl">👥 Select Members</h2>
                 <button type="button" onClick={handleSelectAll} className="btn btn-sm btn-ghost">
                    {polapains && selectedMemberIds.length === polapains.length ? "Deselect All" : "Select All"}
                 </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {polapains?.map((member) => {
                     const isSelected = selectedMemberIds.includes(member._id);
                     return (
                         <div 
                             key={member._id}
                             className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                 isSelected 
                                 ? "border-primary bg-primary/10" 
                                 : "border-transparent bg-base-100 hover:bg-base-300"
                             }`}
                             onClick={() => handleToggleMember(member._id)}
                         >
                            <div className="avatar">
                                <div className={`w-16 h-16 rounded-full ring ring-offset-2 ${isSelected ? "ring-primary" : "ring-transparent"}`}>
                                    <Image 
                                        src={member.avatar || "/avatar.jpg"} 
                                        alt={member.name} 
                                        width={64} 
                                        height={64}
                                        className="rounded-full"
                                    />
                                </div>
                            </div>
                            <span className="font-semibold text-center">{member.name}</span>
                             {isSelected && (
                                 <div className="badge badge-primary badge-sm">Selected</div>
                             )}
                         </div>
                     );
                 })}
              </div>

               {currentStep === 1 && (
                <div className="card-actions justify-end mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={selectedMemberIds.length === 0}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Step 2: Basic Info */}
          {currentStep >= 2 && (
          <div
            id="step-card-2"
            className={`card bg-base-200 shadow-xl ${
              currentStep === 2 ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">
                📝 Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Lunch at restaurant"
                    className="input input-bordered w-full"
                    {...register("title", { required: true })}
                    disabled={currentStep !== 2}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Amount (৳)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="input input-bordered w-full"
                    step="0.01"
                    min="1"
                    {...register("amount", { required: true, min: 1 })}
                    disabled={currentStep !== 2}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    defaultValue={defaultDate}
                    {...register("date")}
                    disabled={currentStep !== 2}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    {...register("type")}
                    defaultValue="food"
                    disabled={currentStep !== 2}
                  >
                    <option value="food">🍔 Food</option>
                    <option value="grocery">🛒 Grocery</option>
                    <option value="transportation">🚌 Transportation</option>
                    <option value="house_rent">🏠 House Rent</option>
                    <option value="utilities">💡 Utilities</option>
                    <option value="entertainment">🎬 Entertainment</option>
                    <option value="healthcare">💊 Healthcare</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="personal_care">🧴 Personal Care</option>
                    <option value="others">📦 Other</option>
                  </select>
                </div>
              </div>
              {currentStep === 2 && (
                 <div className="card-actions justify-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handlePrevious}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next →
                    </button>
                  </div>
              )}
            </div>
          </div>
          )}

          {/* Step 3: Who Pays (Dibo) */}
          {currentStep >= 3 && (
            <div
              id="step-card-3"
              className={`card bg-base-200 shadow-xl ${
                currentStep === 3 ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">💰 Who Pays?</h2>
                  {currentStep === 3 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleEqualSplitDibo}
                    >
                      Split Equally
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedMembers.map((polapain, i) => (
                    <div
                      key={polapain._id}
                      className="flex items-center gap-3 p-3 bg-base-100 rounded-lg"
                    >
                      <div className="avatar">
                        <div className="mask mask-squircle w-12">
                          <Image
                            width={48}
                            height={48}
                            src={polapain?.avatar || "/avatar.jpg"}
                            alt={polapain.name}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {polapain.name}
                        </p>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="input input-bordered input-sm w-full mt-1"
                          step="0.01"
                          defaultValue={
                              watchedAmount && currentStep === 3 && !getValues(`dibo.${i}.amount`) // Only suggest if empty
                              ? (Number(watchedAmount) / selectedMembers.length).toFixed(2)
                              : 0
                          }
                          {...register(`dibo.${i}.amount`)}
                          disabled={currentStep !== 3}
                        />
                        <input
                          type="hidden"
                          value={polapain._id}
                          {...register(`dibo.${i}.id`)}
                        />
                        <input
                          type="hidden"
                          value={polapain.name}
                          {...register(`dibo.${i}.name`)}
                        />
                        <input
                          type="hidden"
                          value={polapain.avatar || ""}
                          {...register(`dibo.${i}.avatar`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info mt-4">
                  <div className="flex justify-between w-full">
                    <span>Total who pays:</span>
                    <span className={`font-bold ${Math.abs(diboTotal - Number(watchedAmount)) > 1 ? 'text-error' : 'text-success'}`}>
                      {diboTotal.toFixed(2)} ৳ / {watchedAmount || 0} ৳
                    </span>
                  </div>
                </div>

                {currentStep === 3 && (
                  <div className="card-actions justify-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handlePrevious}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Who Paid (Dise) */}
          {currentStep >= 4 && (
            <div
              id="step-card-4"
              className={`card bg-base-200 shadow-xl ${
                currentStep === 4 ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">💳 Who Paid?</h2>
                  {currentStep === 4 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleManagerPaid}
                    >
                      Manager Paid
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedMembers.map((polapain, i) => (
                    <div
                      key={polapain._id}
                      className="flex items-center gap-3 p-3 bg-base-100 rounded-lg"
                    >
                      <div className="avatar">
                        <div className="mask mask-squircle w-12">
                          <Image
                            width={48}
                            height={48}
                            src={polapain?.avatar || "/avatar.jpg"}
                            alt={polapain.name}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {polapain.name}
                        </p>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="input input-bordered input-sm w-full mt-1"
                          step="0.01"
                          defaultValue={0}
                          {...register(`dise.${i}.amount`)}
                          disabled={currentStep !== 4}
                        />
                        <input
                          type="hidden"
                          value={polapain._id}
                          {...register(`dise.${i}.id`)}
                        />
                        <input
                          type="hidden"
                          value={polapain.name}
                          {...register(`dise.${i}.name`)}
                        />
                        <input
                          type="hidden"
                          value={polapain.avatar || ""}
                          {...register(`dise.${i}.avatar`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="alert alert-info mt-4">
                  <div className="flex justify-between w-full">
                    <span>Total who paid:</span>
                    <span className="font-bold">
                      {diseTotal.toFixed(2)} ৳ / {watchedAmount || 0} ৳
                    </span>
                  </div>
                </div>

                {currentStep === 4 && (
                  <div className="card-actions justify-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handlePrevious}
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Review →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div id="step-card-5" className="card bg-base-200 shadow-xl ring-2 ring-primary">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">✅ Review & Submit</h2>

                <div className="bg-base-100 p-4 rounded-lg space-y-3">
                   <div className="flex justify-between">
                     <span className="font-semibold">Participants:</span>
                     <span className="text-right">
                        {watchedDibo?.map(d => d.name).join(", ")}
                     </span>
                   </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Title:</span>
                    <span>{watch("title")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Amount:</span>
                    <span className="text-lg font-bold">
                      {watch("amount")} ৳
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span suppressHydrationWarning>
                      {watch("date")
                        ? new Date(watch("date")).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Type:</span>
                    <span className="capitalize">{watch("type")}</span>
                  </div>

                  <div className="divider"></div>

                  <div>
                    <p className="font-semibold mb-2">Who Pays:</p>
                    <div className="space-y-1">
                      {watchedDibo?.map(
                        (person, i) =>
                          Number(person.amount) > 0 && (
                            <div
                              key={i}
                              className="flex justify-between text-sm"
                            >
                              <span>{person.name}</span>
                              <span>{Number(person.amount).toFixed(2)} ৳</span>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div>
                    <p className="font-semibold mb-2">Who Paid:</p>
                    <div className="space-y-1">
                      {watchedDise?.reduce(
                        (acc, curr) => acc + Number(curr.amount || 0),
                        0
                      ) > 0 ? (
                        watchedDise?.map(
                          (person, i) =>
                            Number(person.amount) > 0 && (
                              <div
                                key={i}
                                className="flex justify-between text-sm"
                              >
                                <span>{person.name}</span>
                                <span>
                                  {Number(person.amount).toFixed(2)} ৳
                                </span>
                              </div>
                            )
                        )
                      ) : (
                        <div className="text-sm">
                          <span>Manager paid {watch("amount")} ৳</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-actions justify-between mt-6">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePrevious}
                  >
                    ← Previous
                  </button>
                  <button type="submit" className="btn btn-success">
                    Submit Expense ✓
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Expense"
        message={`Are you sure you want to add this expense of ${formPreview?.amount} ৳?`}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Submit"
        confirmButtonClass="btn-success"
      />
    </section>
  );
};

export default AddExpenses;
