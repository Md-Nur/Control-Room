"use client";
import React, { useEffect, useState, useCallback } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import axios from "axios";
import { format, startOfMonth, endOfMonth } from "date-fns";
import CreativeLoader from "@/components/CreativeLoader";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import DateInput from "@/components/DateInput";

interface MealRecord {
    _id: string;
    date: string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    isGuest: boolean;
    user: {
        _id: string;
        name: string;
        avatar?: string;
    };
}

const MealSummaryPage = () => {
    const { polapainAuth } = usePolapainAuth();
    const router = useRouter();
    
    // State
    const [meals, setMeals] = useState<MealRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
    const [sort, setSort] = useState("date_desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [stats, setStats] = useState({ totalBreakfast: 0, totalLunch: 0, totalDinner: 0, totalAmount: 0 });
    const [editingMeal, setEditingMeal] = useState<MealRecord | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchMeals = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: debouncedSearch,
                sort,
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
            });
            const res = await axios.get(`/api/meals?${queryParams}`);
            setMeals(res.data.meals);
            setTotalItems(res.data.meta.total);
            setStats(res.data.stats);
        } catch (err) {
            toast.error("Failed to fetch meals");
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, sort, dateFrom, dateTo]);

    const handleDeleteMeal = async (mealId: string) => {
        if (!window.confirm("Are you sure you want to delete this meal record?")) return;
        
        try {
            await axios.delete("/api/meals", { data: { mealId } });
            toast.success("Meal record deleted");
            fetchMeals(); // Refresh list and stats
        } catch (err) {
            toast.error("Failed to delete meal");
        }
    };

    const handleUpdateMeal = async () => {
        if (!editingMeal) return;
        setIsSubmitting(true);
        try {
            await axios.post("/api/meals", {
                userId: editingMeal.user._id,
                date: format(new Date(editingMeal.date), "yyyy-MM-dd"),
                breakfast: editingMeal.breakfast,
                lunch: editingMeal.lunch,
                dinner: editingMeal.dinner
            });
            toast.success("Meal updated");
            setEditingMeal(null);
            fetchMeals();
        } catch {
            toast.error("Failed to update meal");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, sort, dateFrom, dateTo]);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    if (!polapainAuth) return <CreativeLoader />;

    return (
        <section className="w-full px-4 py-8 pb-32">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-primary">🍟 All Meals</h1>
                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Nutrition History v2.0</p>
                    </div>

                    <div className="stats shadow-lg bg-base-200/50 border border-base-content/5 rounded-2xl">
                        <div className="stat px-4 py-2 text-center">
                            <div className="stat-title text-[10px] font-black uppercase opacity-40">Breakfast</div>
                            <div className="stat-value text-xl text-primary">{stats.totalBreakfast}</div>
                        </div>
                        <div className="stat px-4 py-2 text-center">
                            <div className="stat-title text-[10px] font-black uppercase opacity-40">Lunch</div>
                            <div className="stat-value text-xl text-secondary">{stats.totalLunch}</div>
                        </div>
                        <div className="stat px-4 py-2 text-center">
                            <div className="stat-title text-[10px] font-black uppercase opacity-40">Dinner</div>
                            <div className="stat-value text-xl text-accent">{stats.totalDinner}</div>
                        </div>
                        <div className="stat px-4 py-2 text-center bg-primary/10">
                            <div className="stat-title text-[10px] font-black uppercase opacity-40 text-primary">Total ৳</div>
                            <div className="stat-value text-xl text-primary font-black">{stats.totalAmount}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 bg-base-200/30 p-4 rounded-2xl border border-base-content/5">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                         {/* Search */}
                         <div className="relative w-full md:flex-1">
                            <input
                                type="text"
                                placeholder="Search by user name..."
                                className="input input-bordered w-full h-12 pl-12 bg-base-100 rounded-2xl focus:ring-2 ring-primary/20 transition-all font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
                        </div>

                        {/* Sort */}
                        <select 
                            className="select select-bordered h-12 rounded-2xl bg-base-100 font-bold w-full md:w-auto"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="date_desc">📅 Date (Newest)</option>
                            <option value="date_asc">📅 Date (Oldest)</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <DateInput 
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="!h-9 !rounded-xl !input-ghost !input-sm !font-bold !w-32 !px-2"
                        />
                        <span className="opacity-30">-</span>
                        <DateInput 
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="!h-9 !rounded-xl !input-ghost !input-sm !font-bold !w-32 !px-2"
                        />
                        <div className="flex-1"></div>
                        <button className="btn btn-ghost btn-circle" onClick={fetchMeals} title="Refresh">🔄</button>
                    </div>
                </div>

                {/* Table/List */}
                {loading ? (
                    <div className="py-20"><CreativeLoader /></div>
                ) : totalItems === 0 ? (
                    <div className="text-center py-20 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-content/10">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-black italic opacity-40">No meal records found</h3>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-hidden rounded-2xl bg-base-100 shadow-xl border border-base-content/5">
                            <table className="table table-lg w-full">
                                <thead className="bg-base-200/50">
                                    <tr className="text-[10px] uppercase font-black tracking-widest opacity-50 border-none">
                                        <th className="py-6">Date</th>
                                        <th>User</th>
                                        <th className="text-center">Breakfast</th>
                                        <th className="text-center">Lunch</th>
                                        <th className="text-center">Dinner</th>
                                        {polapainAuth.isManager && <th className="text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-base-content/5">
                                    {meals.map((meal) => (
                                        <tr key={meal._id} className="hover:bg-primary/5 transition-all group">
                                            <td className="w-40">
                                                <div className="font-mono text-xs font-black opacity-60">
                                                    {format(new Date(meal.date), "dd-MM-yyyy")}
                                                </div>
                                                <div className="text-[10px] uppercase font-black opacity-30 tracking-tighter">
                                                    {format(new Date(meal.date), "EEEE")}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="avatar">
                                                        <div className="w-10 rounded-full ring ring-primary/20 ring-offset-2">
                                                            <Image src={meal.user.avatar || "/avatar.jpg"} alt={meal.user.name} width={40} height={40} />
                                                        </div>
                                                    </div>
                                                    <div className="font-black text-sm">{meal.user.name}</div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {meal.breakfast ? <span className="text-2xl" title="Breakfast">🥪</span> : <span className="opacity-10 text-xl">•</span>}
                                            </td>
                                            <td className="text-center">
                                                {meal.lunch ? <span className="text-2xl" title="Lunch">🍱</span> : <span className="opacity-10 text-xl">•</span>}
                                            </td>
                                            <td className="text-center">
                                                {meal.dinner ? <span className="text-2xl" title="Dinner">🍽️</span> : <span className="opacity-10 text-xl">•</span>}
                                            </td>
                                            {polapainAuth.isManager && (
                                                <td className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => setEditingMeal(meal)}
                                                            className="btn btn-ghost btn-xs text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/10 rounded-lg transition-all"
                                                            title="Edit Record"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteMeal(meal._id)}
                                                            className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 hover:bg-error/10 rounded-lg transition-all"
                                                            title="Delete Record"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List */}
                        <div className="md:hidden grid gap-4">
                            {meals.map((meal) => (
                                <div key={meal._id} className="card bg-base-100 shadow-lg border border-base-content/5 rounded-2xl">
                                    <div className="card-body p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="w-10 rounded-full ring ring-primary/20 ring-offset-1">
                                                        <Image src={meal.user.avatar || "/avatar.jpg"} alt={meal.user.name} width={40} height={40} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm">{meal.user.name}</h3>
                                                    <p className="text-[10px] font-mono opacity-50">{format(new Date(meal.date), "dd-MM-yyyy")}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {polapainAuth.isManager && (
                                                    <>
                                                        <button 
                                                            onClick={() => setEditingMeal(meal)}
                                                            className="btn btn-circle btn-xs btn-ghost text-primary"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteMeal(meal._id)}
                                                            className="btn btn-circle btn-xs btn-ghost text-error"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between bg-base-200/50 rounded-2xl p-3">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[8px] font-black opacity-30 uppercase">Brkfst</span>
                                                <span className={meal.breakfast ? "text-xl" : "text-xl opacity-10"}>🥪</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[8px] font-black opacity-30 uppercase">Lunch</span>
                                                <span className={meal.lunch ? "text-xl" : "text-xl opacity-10"}>🍱</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[8px] font-black opacity-30 uppercase">Dinner</span>
                                                <span className={meal.dinner ? "text-xl" : "text-xl opacity-10"}>🍽️</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-8">
                            <div className="join bg-base-200/50 p-1 rounded-2xl ring-1 ring-base-content/5">
                                <button 
                                    className="join-item btn btn-md btn-ghost hover:bg-base-300 disabled:opacity-30 rounded-xl"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    « Previous
                                </button>
                                <button className="join-item btn btn-md pointer-events-none font-black px-6 rounded-xl bg-base-100">
                                    Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                                </button>
                                <button 
                                    className="join-item btn btn-md btn-ghost hover:bg-base-300 disabled:opacity-30 rounded-xl"
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalItems / itemsPerPage), p + 1))}
                                    disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                                >
                                    Next »
                                </button>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-center pt-8">
                    <button className="btn btn-ghost btn-sm opacity-50 hover:opacity-100" onClick={() => router.push("/dashboard")}>
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Edit Modal */}
                {editingMeal && (
                    <div className="modal modal-open">
                        <div className="modal-box bg-base-100 rounded-2xl p-8 border border-base-content/5 shadow-2xl">
                            <h3 className="font-black text-2xl mb-2 text-primary">✏️ Edit Meal</h3>
                            <p className="text-xs uppercase font-black opacity-40 mb-6 tracking-widest">
                                {editingMeal.user.name} • {format(new Date(editingMeal.date), "dd-MM-yyyy")}
                            </p>
                            
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {(["breakfast", "lunch", "dinner"] as const).map(type => (
                                    <button 
                                        key={type}
                                        className={`flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all duration-300 ${editingMeal[type] ? (polapainAuth?.isManager ? 'bg-primary/10 border-primary text-primary scale-105 shadow-lg shadow-primary/5' : 'bg-warning/10 border-warning text-warning scale-105 shadow-lg shadow-warning/5') : 'border-transparent bg-base-200/50 opacity-50 hover:opacity-100'}`}
                                        onClick={() => setEditingMeal({...editingMeal, [type]: !editingMeal[type]})}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{type.slice(0, 3)}</span>
                                        <span className="text-3xl">
                                            {type === 'breakfast' ? '🥪' : type === 'lunch' ? '🍱' : '🍽️'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="modal-action gap-2">
                                <button className="btn btn-ghost rounded-2xl px-6" onClick={() => setEditingMeal(null)}>Cancel</button>
                                <button 
                                    className="btn btn-primary rounded-2xl px-8 font-black" 
                                    onClick={handleUpdateMeal}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                        <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setEditingMeal(null)}></div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MealSummaryPage;
