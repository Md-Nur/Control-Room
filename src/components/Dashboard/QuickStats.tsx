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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link
                    href="/add-expenses"
                    className="btn btn-primary btn-sm md:btn-md"
                  >
                    💸 Add Expense
                  </Link>
                  <Link
                    href="/all-expenses"
                    className="btn btn-outline btn-sm md:btn-md"
                  >
                    📊 View Expenses
                  </Link>
                  <Link
                    href="/all-balance"
                    className="btn btn-outline btn-sm md:btn-md"
                  >
                    💰 Check Balances
                  </Link>
                  {polapainAuth.isManager && (
                    <Link
                      href="/manager"
                      className="btn btn-outline btn-sm md:btn-md"
                    >
                      👑 Manager Panel
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
