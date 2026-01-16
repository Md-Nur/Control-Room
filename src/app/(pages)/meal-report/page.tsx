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

interface ReportRecord {
    _id: string;
    totalBreakfast: number;
    totalLunch: number;
    totalDinner: number;
    totalAmount: number;
    user: {
        name: string;
        avatar?: string;
    };
}

const MealReportPage = () => {
    const { polapainAuth } = usePolapainAuth();
    const router = useRouter();
    
    // State
    const [report, setReport] = useState<ReportRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
    const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
            });
            const res = await axios.get(`/api/meals/report?${queryParams}`);
            setReport(res.data);
        } catch (err) {
            toast.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (!polapainAuth) return <CreativeLoader />;

    const filteredReport = report.filter(item => 
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totals = report.reduce((acc, item) => ({
        breakfast: acc.breakfast + item.totalBreakfast,
        lunch: acc.lunch + item.totalLunch,
        dinner: acc.dinner + item.totalDinner,
        amount: acc.amount + item.totalAmount
    }), { breakfast: 0, lunch: 0, dinner: 0, amount: 0 });

    return (
        <section className="w-full px-4 py-8 pb-32">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tight text-primary">📊 Meal Report</h1>
                        <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Aggregate Summary v1.0</p>
                    </div>

                    <div className="stats shadow-lg bg-base-200/50 border border-base-content/5 rounded-2xl">
                        <div className="stat px-6 py-2 text-center">
                            <div className="stat-title text-[10px] font-black uppercase opacity-40">Total Consumption</div>
                            <div className="stat-value text-2xl text-primary">{totals.amount} <span className="text-lg opacity-50">৳</span></div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-base-200/30 p-6 rounded-2xl border border-base-content/5">
                    <div className="form-control">
                        <label className="label text-[10px] font-black uppercase opacity-40 ml-2">Search Member</label>
                        <input
                            type="text"
                            placeholder="Name..."
                            className="input input-bordered rounded-2xl font-bold bg-base-100 h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DateInput 
                        label="From Date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-2xl h-12"
                    />
                    <DateInput 
                        label="To Date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-2xl h-12"
                    />
                </div>

                {/* Report Table */}
                {loading ? (
                    <div className="py-20"><CreativeLoader /></div>
                ) : filteredReport.length === 0 ? (
                    <div className="text-center py-20 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-content/10">
                        <h3 className="text-xl font-black italic opacity-40">No data for this period</h3>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-base-100 shadow-xl border border-base-content/5">
                        <table className="table table-lg w-full">
                            <thead className="bg-base-200/50">
                                <tr className="text-[10px] uppercase font-black tracking-widest opacity-50 border-none">
                                    <th className="py-6">Member</th>
                                    <th className="text-center">Breakfasts</th>
                                    <th className="text-center">Lunches</th>
                                    <th className="text-center">Dinners</th>
                                    <th className="text-right pr-10">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-content/5">
                                {filteredReport.map((item) => (
                                    <tr key={item._id} className="hover:bg-primary/5 transition-all group">
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <div className="avatar">
                                                    <div className="w-10 rounded-full ring ring-primary/20 ring-offset-2">
                                                        <Image src={item.user.avatar || "/avatar.jpg"} alt={item.user.name} width={40} height={40} />
                                                    </div>
                                                </div>
                                                <div className="font-black text-sm">{item.user.name}</div>
                                            </div>
                                        </td>
                                        <td className="text-center font-mono font-bold text-primary">{item.totalBreakfast}</td>
                                        <td className="text-center font-mono font-bold text-secondary">{item.totalLunch}</td>
                                        <td className="text-center font-mono font-bold text-accent">{item.totalDinner}</td>
                                        <td className="text-right pr-10">
                                            <span className="font-black text-lg">{item.totalAmount}</span>
                                            <span className="text-[10px] opacity-40 ml-1 font-black">৳</span>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-base-200/30 font-black">
                                    <td className="py-4">Grand Total</td>
                                    <td className="text-center">{totals.breakfast}</td>
                                    <td className="text-center">{totals.lunch}</td>
                                    <td className="text-center">{totals.dinner}</td>
                                    <td className="text-right pr-10 text-xl text-primary">
                                        {totals.amount} <span className="text-xs opacity-50">৳</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MealReportPage;
