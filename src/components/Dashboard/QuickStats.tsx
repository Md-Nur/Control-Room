"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Polapain } from "@/models/Polapain";

import CreativeLoader from "@/components/CreativeLoader";

const QuickStats = () => {
  const { polapainAuth } = usePolapainAuth();
  const [userBalance, setUserBalance] = useState<number>(0);
  const [last30DaysExpenses, setLast30DaysExpenses] = useState<number>(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!polapainAuth || !mounted) return;

    const fetchData = async () => {
      try {
        // Fetch All Stats (Server-Side Logic)
        const statsRes = await axios.get(`/api/dashboard-stats?userId=${polapainAuth._id}`);
        
        setLast30DaysExpenses(statsRes.data.last30DaysExpenses);
        setMonthlyExpenses(statsRes.data.thisMonthExpenses);
        setUserBalance(statsRes.data.userBalance);
        
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [polapainAuth, mounted]);

  if (!polapainAuth) return null;

  return (
    <section className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quick Overview</h2>
        
        {loading ? (
          <CreativeLoader />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-sm opacity-90">Your Balance</h3>
                  <p className="text-3xl font-bold">
                    {userBalance.toFixed(2)} ৳
                  </p>
                  <p className="text-xs opacity-75">
                    {userBalance >= 0 ? "You're in credit" : "You owe money"}
                  </p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-secondary to-secondary-focus text-secondary-content shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-sm opacity-90">This Month</h3>
                  <p className="text-3xl font-bold">
                    {monthlyExpenses.toFixed(2)} ৳
                  </p>
                  <p className="text-xs opacity-75">Total expenses</p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-accent to-accent-focus text-accent-content shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-sm opacity-90">Last 30 Days</h3>
                  <p className="text-3xl font-bold">
                    {last30DaysExpenses.toFixed(2)} ৳
                  </p>
                  <p className="text-xs opacity-75">Your share of recent expenses</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href="/add-expenses"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center mb-2 shadow-lg group-hover:rotate-6 transition-transform">
                        <span className="text-2xl">💸</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Add Expense</span>
                  </Link>

                  <Link
                    href="/all-expenses"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-content flex items-center justify-center mb-2 shadow-lg group-hover:-rotate-6 transition-transform">
                        <span className="text-2xl">📊</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Expenses</span>
                  </Link>

                  <Link
                    href="/all-balance"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-accent/10 hover:bg-accent/20 text-accent border border-accent/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent text-accent-content flex items-center justify-center mb-2 shadow-lg group-hover:rotate-6 transition-transform">
                        <span className="text-2xl">💰</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Balances</span>
                  </Link>

                  {polapainAuth.isManager && (
                    <Link
                      href="/manager"
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-info/10 hover:bg-info/20 text-info border border-info/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-xl bg-info text-info-content flex items-center justify-center mb-2 shadow-lg group-hover:-rotate-6 transition-transform">
                            <span className="text-2xl">👑</span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-center">Manager Panel</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default QuickStats;
