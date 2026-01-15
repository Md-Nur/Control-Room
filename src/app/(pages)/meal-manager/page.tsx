"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import CreativeLoader from "@/components/CreativeLoader";
import Image from "next/image";
import toast from "react-hot-toast";
import { calculateMonthlyMealCost } from "@/lib/mealCalculator";

interface MealRecord {
  _id?: string;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

interface MealSummary {
  user: {
      _id: string;
      name: string;
      avatar?: string;
  };
  cost: number;
  breakfast: number;
  lunch: number;
  dinner: number;
}

const MealManager = () => {
  const { polapainAuth } = usePolapainAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manager State
  const [polapains, setPolapains] = useState<{_id: string, name: string, avatar?: string}[]>([]);
  const [selecteduserId, setSelectedUserId] = useState<string>(""); 
  const [viewMode, setViewMode] = useState<"calendar" | "summary">("calendar");
  const [summaryData, setSummaryData] = useState<MealSummary[]>([]);
  const [allowHistoryEditing, setAllowHistoryEditing] = useState(false);

  const fetchPolapains = useCallback(async () => {
     try {
        const res = await axios.get("/api/polapain");
        setPolapains(res.data);
     } catch {
        console.error("Failed to fetch polapains");
     }
  }, []);

  const fetchUserMeals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/meals?userId=${selecteduserId}&month=${format(currentMonth, "yyyy-MM")}`
      );
      
      // The API now returns UTC dates, we store them as-is but we'll use string comparison
      setMeals(res.data);
    } catch {
      toast.error("Failed to load meals");
    } finally {
      setLoading(false);
    }
  }, [selecteduserId, currentMonth]);

  const fetchSummary = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
        const res = await axios.get(`/api/meals?month=${format(currentMonth, "yyyy-MM")}`);
        const allMeals = res.data;
        
        // Group by User
        const stats = polapains.map(user => {
            const userMeals = allMeals.filter((m: any) => m.userId.toString() === user._id.toString());
            
            const cost = calculateMonthlyMealCost(userMeals);
            
            // Calculate counts
            let b = 0, l = 0, d = 0;
            userMeals.forEach((m: MealRecord) => {
                 if (m.breakfast) b++;
                 if (m.lunch) l++;
                 if (m.dinner) d++;
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
    } catch {
        toast.error("Failed to fetch summary");
    } finally {
        if (!silent) setLoading(false);
    }
  }, [currentMonth, polapains]);

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
  }, [polapainAuth, fetchPolapains]);

  useEffect(() => {
    if (viewMode === "calendar" && selecteduserId) {
       fetchUserMeals();
    } else if (viewMode === "summary") {
       fetchSummary();
    }
  }, [selecteduserId, currentMonth, viewMode, fetchUserMeals, fetchSummary]);

  const handleToggle = async (date: Date, type: "breakfast" | "lunch" | "dinner") => {
    const dateStr = format(date, "yyyy-MM-dd");
    const previousMeals = [...meals];
    
    // Find existing record using string comparison
    const existingRecord = meals.find((m) => {
        const mDate = new Date(m.date).toISOString().split('T')[0];
        return mDate === dateStr;
    });
    
    // Default new record structure
    const newRecord = existingRecord
      ? { ...existingRecord }
      : { date: dateStr, breakfast: false, lunch: false, dinner: false };

    newRecord[type] = !newRecord[type];
    
    // Check if all are false now
    const isEmpty = !newRecord.breakfast && !newRecord.lunch && !newRecord.dinner;

    // Optimistic Update
    if (isEmpty) {
        setMeals(meals.filter(m => new Date(m.date).toISOString().split('T')[0] !== dateStr));
    } else {
        if (existingRecord) {
            setMeals(meals.map(m => new Date(m.date).toISOString().split('T')[0] === dateStr ? newRecord : m));
        } else {
            setMeals([...meals, newRecord]);
        }
    }

    try {
        if (isEmpty) {
            await axios.delete("/api/meals", {
                data: {
                    userId: selecteduserId,
                    date: dateStr
                }
            });
        } else {
            await axios.post("/api/meals", {
                userId: selecteduserId,
                ...newRecord,
                date: dateStr
            });
        }
        
        // Refresh summary silently
        if (polapainAuth?.isManager) {
            fetchSummary(true);
        }
    } catch {
        toast.error("Failed to update");
        setMeals(previousMeals);
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

          {viewMode === "calendar" && (
            <div className="flex items-center gap-2 bg-base-100 p-2 rounded-lg border border-base-200">
                <span className="text-xs font-semibold opacity-70">HISTORY MODE</span>
                <input 
                    type="checkbox" 
                    className="toggle toggle-sm toggle-primary" 
                    checked={allowHistoryEditing}
                    onChange={(e) => setAllowHistoryEditing(e.target.checked)}
                />
            </div>
          )}
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
                                                <Image src={stat.user.avatar || "/avatar.jpg"} alt={stat.user.name} width={40} height={40} />
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
                    const dayStr = format(day, "yyyy-MM-dd");
                    const record = meals.find(m => {
                        const mDate = new Date(m.date).toISOString().split('T')[0];
                        return mDate === dayStr;
                    });
                    const isToday = isSameDay(day, new Date());
                    
                    const todayAtMidnight = new Date();
                    todayAtMidnight.setHours(0,0,0,0);
                    const dayAtMidnight = new Date(day);
                    dayAtMidnight.setHours(0,0,0,0);

                    const isFuture = dayAtMidnight > todayAtMidnight;
                    const isPast = dayAtMidnight < todayAtMidnight;
                    const isLocked = (isPast && !allowHistoryEditing) || isFuture;

                    return (
                        <div 
                            key={day.toString()} 
                            id={isToday ? "today-card" : undefined}
                            className={`card bg-base-100 shadow-sm border transition-all duration-300 ${isToday ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-base-200'} ${isLocked ? 'opacity-60 grayscale-[50%] bg-base-200/50' : ''}`}
                        >
                            <div className="card-body p-4 relative overflow-hidden">
                                {isLocked && isPast && (
                                    <div className="absolute top-2 right-2 opacity-30">
                                        🔒
                                    </div>
                                )}
                                <h3 className="font-bold flex justify-between items-center">
                                    {format(day, "MMM dd, EEE")}
                                    {/* No Default Badge */}
                                </h3>
                                <div className="flex justify-between mt-2">
                                    {(["breakfast", "lunch", "dinner"] as const).map(type => (
                                         <label key={type} className={`label cursor-pointer flex-col gap-1 ${isLocked ? 'cursor-not-allowed' : ''}`}>
                                            <span className="label-text text-xs capitalize">{type}</span>
                                            <input 
                                                type="checkbox" 
                                                className={`checkbox checkbox-sm ${isMyProfile ? 'checkbox-primary' : 'checkbox-warning'}`}
                                                checked={record?.[type] || false}
                                                onChange={() => handleToggle(day, type)}
                                                disabled={isLocked}
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
