"use client";
import React, { useEffect, useState } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import CreativeLoader from "@/components/CreativeLoader";
import toast from "react-hot-toast";
import { calculateMonthlyMealCost } from "@/lib/mealCalculator";

interface MealRecord {
  _id?: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

const MealManager = () => {
  const { polapainAuth } = usePolapainAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manager State
  const [polapains, setPolapains] = useState<any[]>([]);
  const [selecteduserId, setSelectedUserId] = useState<string>(""); 
  const [viewMode, setViewMode] = useState<"calendar" | "summary">("calendar");
  const [summaryData, setSummaryData] = useState<any[]>([]);

  useEffect(() => {
    if (viewMode === "calendar" && !loading) {
       setTimeout(() => {
         const todayCard = document.getElementById("today-card");
         if (todayCard) {
            todayCard.scrollIntoView({ behavior: "smooth", block: "center" });
         }
       }, 500); // Small delay to ensure render
    }
  }, [loading, viewMode, currentMonth]);

  useEffect(() => {
    if (polapainAuth?._id) {
       setSelectedUserId(polapainAuth._id);
       fetchPolapains();
    }
  }, [polapainAuth]);

  useEffect(() => {
    if (viewMode === "calendar" && selecteduserId) {
       fetchUserMeals();
    } else if (viewMode === "summary") {
       fetchSummary();
    }
  }, [selecteduserId, currentMonth, viewMode]);

  const fetchPolapains = async () => {
     try {
        const res = await axios.get("/api/polapain");
        setPolapains(res.data);
     } catch (e) {
        console.error(e);
     }
  };

  const fetchUserMeals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/meals?userId=${selecteduserId}&month=${format(currentMonth, "yyyy-MM")}`
      );
      setMeals(res.data);
    } catch (error) {
      toast.error("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
        const res = await axios.get(`/api/meals?month=${format(currentMonth, "yyyy-MM")}`);
        const allMeals = res.data;
        
        // Group by User
        const stats = polapains.map(user => {
            const userMeals = allMeals.filter((m: any) => m.userId === user._id);
            const cost = calculateMonthlyMealCost(userMeals);
            
            // Calculate counts
            let b = 0, l = 0, d = 0;
            userMeals.forEach((m: any) => {
                 // Check if it's a default day (counts as B+D) or specific
                 const isDefault = !m.breakfast && !m.lunch && !m.dinner;
                 if (isDefault) {
                     b++; d++;
                 } else {
                     if (m.breakfast) b++;
                     if (m.lunch) l++;
                     if (m.dinner) d++;
                 }
            });

            return {
                user,
                cost,
                breakfast: b,
                lunch: l,
                dinner: d
            };
        });
        
        setSummaryData(stats);
    } catch (error) {
        toast.error("Failed to fetch summary");
    } finally {
        setLoading(false);
    }
  };

  const handleToggle = async (date: Date, type: "breakfast" | "lunch" | "dinner") => {
    const previousMeals = [...meals];
    const existingRecord = meals.find((m) => isSameDay(new Date(m.date), date));
    
    // Default new record structure
    const newRecord = existingRecord
      ? { ...existingRecord }
      : { date: date.toISOString(), breakfast: false, lunch: false, dinner: false };

    newRecord[type] = !newRecord[type];
    
    // Check if all are false now
    const isEmpty = !newRecord.breakfast && !newRecord.lunch && !newRecord.dinner;

    if (isEmpty) {
        // Remove from UI
        setMeals(meals.filter(m => !isSameDay(new Date(m.date), date)));
        
        // Delete from API
        try {
            await axios.delete("/api/meals", {
                data: {
                    userId: selecteduserId,
                    date: date.toISOString()
                }
            });
        } catch (error) {
            toast.error("Failed to delete");
            setMeals(previousMeals);
        }
    } else {
        // Update UI
        if (existingRecord) {
            setMeals(meals.map(m => m._id === existingRecord._id ? newRecord : m));
        } else {
            setMeals([...meals, newRecord]);
        }

        // Save to API
        try {
            await axios.post("/api/meals", {
                userId: selecteduserId,
                ...newRecord,
                date: date.toISOString()
            });
        } catch (error) {
            toast.error("Failed to save");
            setMeals(previousMeals);
        }
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const totalCost = calculateMonthlyMealCost(meals.map(m => ({
    date: m.date,
    breakfast: m.breakfast,
    lunch: m.lunch,
    dinner: m.dinner
  })));

  if (!polapainAuth) return <CreativeLoader />;

  const isMyProfile = selecteduserId === polapainAuth._id;

  return (
    <section className="w-full px-4 py-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">🍔 Meal Manager</h1>
            {polapainAuth.isManager && (
                <div className="join">
                    <button 
                        className={`join-item btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setViewMode('calendar')}
                    >Calendar</button>
                    <button 
                        className={`join-item btn btn-sm ${viewMode === 'summary' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setViewMode('summary')}
                    >Summary</button>
                </div>
            )}
          </div>

          <div className="flex items-center gap-4 bg-base-200 p-2 rounded-lg">
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="btn btn-sm btn-ghost">◀</button>
             <span className="font-bold w-32 text-center">{format(currentMonth, "MMMM yyyy")}</span>
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="btn btn-sm btn-ghost">▶</button>
          </div>
        </div>

        {/* Manager Controls: User Selector */}
        {polapainAuth.isManager && viewMode === "calendar" && (
            <div className="mb-6 flex items-center gap-2">
                <span className="font-semibold">Viewing:</span>
                <select 
                    className="select select-bordered select-sm"
                    value={selecteduserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                >
                    {polapains.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.name} {user._id === polapainAuth._id ? "(Me)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        )}

        {/* Summary View */}
        {viewMode === "summary" ? (
             <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-200">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th className="text-center">Breakfasts</th>
                            <th className="text-center">Lunches</th>
                            <th className="text-center">Dinners</th>
                            <th className="text-right">Est. Cost</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summaryData.map((stat, i) => (
                            <tr key={i}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-10 rounded-full">
                                                <img src={stat.user.avatar || "/avatar.jpg"} />
                                            </div>
                                        </div>
                                        <div className="font-bold">{stat.user.name}</div>
                                    </div>
                                </td>
                                <td className="text-center font-mono">{stat.breakfast}</td>
                                <td className="text-center font-mono">{stat.lunch}</td>
                                <td className="text-center font-mono">{stat.dinner}</td>
                                <td className="text-right font-bold text-primary">{stat.cost.toFixed(2)} ৳</td>
                                <td>
                                    <button 
                                        className="btn btn-xs btn-outline"
                                        onClick={() => {
                                            setSelectedUserId(stat.user._id);
                                            setViewMode("calendar");
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={4} className="text-right font-bold text-lg">Grand Total:</td>
                            <td className="text-right font-bold text-lg text-primary">
                                {summaryData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)} ৳
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
             </div>
        ) : (
            <>
                {/* Cost Summary Card */}
                <div className={`stats shadow w-full mb-8 text-primary-content ${isMyProfile ? 'bg-primary' : 'bg-warning'}`}>
                    <div className="stat place-items-center">
                        <div className={`stat-title ${isMyProfile ? 'text-primary-content/70' : 'text-warning-content/70'}`}>
                            {isMyProfile ? "Your Estimated Cost" : `${polapains.find(p => p._id === selecteduserId)?.name}'s Cost`}
                        </div>
                        <div className={`stat-value ${isMyProfile ? '' : 'text-warning-content'}`}>{totalCost.toFixed(2)} ৳</div>
                        <div className={`stat-desc ${isMyProfile ? 'text-primary-content/60' : 'text-warning-content/60'}`}>For {format(currentMonth, "MMMM")}</div>
                    </div>
                </div>

                {loading ? (
                    <CreativeLoader />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daysInMonth.map((day) => {
                    const record = meals.find(m => isSameDay(new Date(m.date), day));
                    const isDefault = record && !record.breakfast && !record.lunch && !record.dinner;
                    const isToday = isSameDay(day, new Date());
                    const isFuture = day > new Date();

                    return (
                        <div 
                            key={day.toString()} 
                            id={isToday ? "today-card" : undefined}
                            className={`card bg-base-100 shadow-sm border ${isToday ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-base-200'} ${isFuture ? 'opacity-50 grayscale' : ''}`}
                        >
                            <div className="card-body p-4">
                                <h3 className="font-bold flex justify-between items-center">
                                    {format(day, "MMM dd, EEE")}
                                    {isDefault && <span className="badge badge-warning badge-xs tooltip pointer-events-auto" data-tip="No meals selected = Breakfast + Lunch">Default (65৳)</span>}
                                </h3>
                                <div className="flex justify-between mt-2">
                                    {(["breakfast", "lunch", "dinner"] as const).map(type => (
                                         <label key={type} className={`label cursor-pointer flex-col gap-1 ${isFuture ? 'cursor-not-allowed' : ''}`}>
                                            <span className="label-text text-xs capitalize">{type}</span>
                                            <input 
                                                type="checkbox" 
                                                className={`checkbox checkbox-sm ${isMyProfile ? 'checkbox-primary' : 'checkbox-warning'}`}
                                                checked={record?.[type] || false}
                                                onChange={() => handleToggle(day, type)}
                                                disabled={isFuture}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
            </>
        )}
      </div>
    </section>
  );
};

export default MealManager;
