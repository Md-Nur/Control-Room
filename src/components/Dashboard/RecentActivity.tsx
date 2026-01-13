"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Khoroch } from "@/models/Khoroch";

import CreativeLoader from "@/components/CreativeLoader";

const RecentActivity = () => {
  const { polapainAuth, loading: authLoading } = usePolapainAuth();
  const [recentExpenses, setRecentExpenses] = useState<Khoroch[]>([]);
  const [loading, setLoading] = useState(true); // fetching expenses loading
  const [mounted, setMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return; // Wait for auth to finish loading
    if (!polapainAuth?._id) {
       setLoading(false); 
       return;
    }

    const fetchRecentExpenses = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          sort: "date",
          limit: "5",
          page: currentPage.toString(),
          excludeType: "Point Transfer",
          skipStats: "true"
        };
        if (polapainAuth?._id) params.participant = polapainAuth._id;
        
        const queryParams = new URLSearchParams(params);
        
        const res = await axios.get<{expenses: Khoroch[], meta: {totalPages: number}}>(`/api/all-expenses?${queryParams}`);
        
        const expenses = res.data.expenses || [];
        setRecentExpenses(expenses);
        setTotalPages(res.data.meta?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching recent expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExpenses();
  }, [polapainAuth, mounted, currentPage, authLoading]);

  // If auth is loading, show creative loader
  if (!mounted || authLoading) {
     return (
        <section className="w-full px-4 py-6">
           <div className="max-w-7xl mx-auto">
              <CreativeLoader />
           </div>
        </section>
     );
  }

  if (!polapainAuth?._id) return null;

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "food":
        return "🍔";
      case "others":
        return "📦";
      default:
        return "📝";
    }
  };

  return (
    <section className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

        {loading ? (
          <CreativeLoader />
        ) : (
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              {recentExpenses && recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div
                      key={String(expense._id) || Math.random()}
                      className="flex items-center gap-3 p-3 bg-base-100 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="text-3xl">
                        {getCategoryIcon(expense.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{expense.title}</h3>
                        <p className="text-sm text-base-content/70" suppressHydrationWarning>
                          {new Date(expense.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          {(expense.dise.find((p) => p.id === polapainAuth._id)?.amount || 0) > 0 && (
                            <div className="badge badge-success badge-lg font-bold text-white">
                              +{expense.dise.find((p) => p.id === polapainAuth._id)?.amount.toFixed(2)} ৳
                            </div>
                          )}
                          {(expense.dibo.find((p) => p.id === polapainAuth._id)?.amount || 0) > 0 && (
                            <div className="badge badge-error badge-lg font-bold text-white">
                              -{expense.dibo.find((p) => p.id === polapainAuth._id)?.amount.toFixed(2)} ৳
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 mt-1 justify-end">
                          {expense.dise
                            .filter((p) => p.amount > 0)
                            .slice(0, 3)
                            .map((person, i) => (
                              <div
                                key={i}
                                className="avatar tooltip"
                                data-tip={person.name}
                              >
                                <div className="w-6 rounded-full">
                                  <Image
                                    src={person.avatar || "/avatar.jpg"}
                                    alt={person.name}
                                    width={24}
                                    height={24}
                                  />
                                </div>
                              </div>
                            ))}
                          {expense.dise.reduce((a, p) => a + p.amount, 0) ===
                            0 && (
                            <div className="avatar tooltip" data-tip="Manager">
                              <div className="w-6 rounded-full">
                                <Image
                                  src="/logo.jpg"
                                  alt="Manager"
                                  width={24}
                                  height={24}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-base-content/70">
                  <p className="text-lg">No expenses yet</p>
                  <p className="text-sm">Start tracking your flatmate expenses!</p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-base-300">
                  <div className="text-sm text-base-content/70">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-sm pointer-events-none">
                       {currentPage}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentActivity;
