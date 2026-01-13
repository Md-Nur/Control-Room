"use client";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreativeLoader from "@/components/CreativeLoader";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Khoroch[]>([]);
  const [sort, setSort] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Stats state
  const [stats, setStats] = useState({
    totalAmount: 0,
    foodAmount: 0,
    othersAmount: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort,
        search: debouncedSearch,
        type: typeFilter,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const res = await axios.get(`/api/all-expenses?${queryParams}`);
      setExpenses(res.data.expenses);
      setTotalItems(res.data.meta.total);
      setStats(res.data.stats);
    } catch (_err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = _err as any;
      toast.error(error?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, dateFrom, dateTo, sort]);

  useEffect(() => {
    fetchExpenses();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch, typeFilter, dateFrom, dateTo, sort]);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "food":
        return "🍔";
      case "others":
        return "📦";
      case "add-taka":
        return "💰";
      default:
        return "📝";
    }
  };

  const exportToCSV = async () => {
      const loadingToast = toast.loading("Preparing CSV...");
      try {
        const queryParams = new URLSearchParams({
          page: "1",
          limit: "10000",
          sort,
          search: debouncedSearch,
          type: typeFilter,
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        });
        const res = await axios.get(`/api/all-expenses?${queryParams}`);
        const allData = res.data.expenses;
        
        const csvData = allData.map((exp: Khoroch) => ({
          Title: exp.title,
          Amount: exp.amount,
          Type: exp.type,
          Date: new Date(exp.date).toLocaleDateString(),
          "Who Pays": exp.dibo.map((p) => p.name).join(", "),
          "Who Paid": exp.dise.reduce((a, p) => a + p.amount, 0) > 0
            ? exp.dise.filter((p) => p.amount > 0).map((p) => p.name).join(", ")
            : "Manager",
        }));

        const headers = Object.keys(csvData[0] || {});
        const csv = [
          headers.join(","),
          ...csvData.map((row: Record<string, unknown>) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            headers.map((header) => `"${(row as any)[header]}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        toast.dismiss(loadingToast);
        toast.success("Exported to CSV!");
      } catch {
        toast.dismiss(loadingToast);
        toast.error("Failed to export");
      }
  };

  // Map API stats to component variables
  const totalExpenses = stats.totalAmount;
  // Note: We don't have arrays of food/other expenses anymore, 
  // but we only used them for length or sum. The UI used `.reduce` or `.length`.
  // I need to update the UI to avoid reducing arrays.
  // The UI code below line 130 uses `foodExpenses.reduce(...)`
  // I must update that part too.
  
  // For now, I'll pass simple numbers or mock arrays if strictly needed, 
  // but better to replace the usage in the render method.
  
  // This replacement block ends at line 115.
  // I need to update the render method in a separate call or extend this one.
  // I will extend this replacement to include the variable mapping.
  
  // paginatedExpenses is now just expenses
  const paginatedExpenses = expenses;
  // filteredExpenses.length usage needs to be replaced with totalItems
  const filteredExpenses = { length: totalItems }; // Hacky mock to satisfy simple checks? No, `filteredExpenses` is used in .map().
  // Wait, `paginatedExpenses` is used for mapping. `filteredExpenses` was used for length checks and pagination controls.
  
  // I need to carefully replace the render usages.
  // This tool call only replaces up to line 115.
  // The UI starts mainly after that. 
  // I will commit this setup part first, then do a second pass to fix the Render part.

  return (
    <section className="w-full min-h-screen bg-base-100 py-8 px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-base-content/60">
            Track and manage your shared expenses efficiently
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stats shadow-lg bg-base-100/50 backdrop-blur-md border border-base-content/5 hover:border-primary/50 transition-colors">
            <div className="stat place-items-center p-4">
              <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Total Spent</div>
              <div className="stat-value text-primary text-2xl md:text-3xl mt-1">{totalExpenses.toFixed(2)} ৳</div>
              <div className="stat-desc">All time</div>
            </div>
          </div>
          
          <div className="stats shadow-lg bg-base-100/50 backdrop-blur-md border border-base-content/5 hover:border-warning/50 transition-colors">
            <div className="stat place-items-center p-4">
              <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Food</div>
              <div className="stat-value text-warning text-2xl md:text-3xl mt-1">
                {stats.foodAmount.toFixed(2)} ৳
              </div>
              <div className="stat-desc">This filter</div>
            </div>
          </div>
 
          <div className="stats shadow-lg bg-base-100/50 backdrop-blur-md border border-base-content/5 hover:border-info/50 transition-colors">
            <div className="stat place-items-center p-4">
              <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Others</div>
              <div className="stat-value text-info text-2xl md:text-3xl mt-1">
                {stats.othersAmount.toFixed(2)} ৳
              </div>
              <div className="stat-desc">This filter</div>
            </div>
          </div>
 
          <div className="stats shadow-lg bg-base-100/50 backdrop-blur-md border border-base-content/5 hover:border-secondary/50 transition-colors">
            <div className="stat place-items-center p-4">
              <div className="stat-title text-xs font-bold uppercase tracking-wider opacity-60">Average</div>
              <div className="stat-value text-secondary text-2xl md:text-3xl mt-1">
                {totalItems
                  ? (totalExpenses / totalItems).toFixed(2)
                  : "0.00"}{" "}
                ৳
              </div>
              <div className="stat-desc">Per transaction</div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="card bg-base-100/80 backdrop-blur-md shadow-xl border border-base-content/5 z-10 w-full overflow-visible">
          <div className="card-body p-4 gap-4">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    className="input input-bordered w-full pl-12 bg-base-200/50 focus:bg-base-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {(["all", "food", "others"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`btn btn-sm px-6 capitalize rounded-full transition-all ${
                      typeFilter === type 
                        ? "btn-primary shadow-lg scale-105" 
                        : "btn-ghost bg-base-200/50 hover:bg-base-200"
                    }`}
                  >
                    {type === "all" ? "All" : type === "food" ? "🍔 Food" : "📦 Others"}
                  </button>
                ))}
              </div>

              {/* Sort & Date */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end items-center">
                <select
                  onChange={(e) => setSort(e.target.value)}
                  className="select select-bordered select-sm bg-base-200/50 flex-1 md:flex-none"
                  value={sort}
                >
                  <option value="">Sort by...</option>
                  <option value="date">Date</option>
                  <option value="_id">Added</option>
                </select>

                <div className="join flex-1 md:flex-none justify-center">
                   <input
                    type="date"
                    className="input input-bordered input-sm join-item w-full md:w-32 bg-base-200/50"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <input
                    type="date"
                    className="input input-bordered input-sm join-item w-full md:w-32 bg-base-200/50"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  {(dateFrom || dateTo) && (
                    <button
                      className="btn btn-sm btn-ghost btn-circle text-error"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                    >
                      ✕
                    </button>
                  )}

                   <button
                    className="btn btn-sm btn-circle btn-success text-white shadow-lg"
                    onClick={exportToCSV}
                    disabled={filteredExpenses.length === 0}
                    title="Export CSV"
                  >
                    📥
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/50 backdrop-blur-sm z-50 rounded-box">
              <CreativeLoader />
            </div>
          ) : totalItems === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-base-200/30 rounded-box border border-dashed border-base-content/20">
              <div className="text-6xl mb-4 opacity-50">📂</div>
              <h3 className="text-xl font-bold opacity-75">No expenses found</h3>
              <p className="text-base-content/60">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto bg-base-100/90 backdrop-blur shadow-xl rounded-2xl border border-base-content/5">
                <table className="table table-zebra w-full">
                  <thead className="bg-base-200/50 text-base-content/70">
                    <tr>
                      <th className="py-4 pl-6">Type</th>
                      <th>Details</th>
                      <th>Date</th>
                      <th>Payer(s)</th>
                      <th>Beneficiary</th>
                      <th className="pr-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense._id.toString()} className="hover:bg-base-200/50 transition-colors group">
                        <td className="pl-6">
                          <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {getCategoryIcon(expense.type)}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-lg">{expense.title}</div>
                          <div className="badge badge-sm badge-ghost opacity-70 capitalize mt-1">
                            {expense.type}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium" suppressHydrationWarning>
                            {new Date(expense.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs opacity-50" suppressHydrationWarning>
                             {new Date(expense.date).getFullYear()}
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                              {expense.dise.map((p) => p.amount >= 0.01 && (
                                 <div key={p.id} className="flex items-center gap-2 text-sm bg-base-200/50 p-1 rounded-lg pr-2 w-fit">
                                   <div className="avatar">
                                     <div className="w-6 rounded-full">
                                       <Image src={p.avatar || "/avatar.jpg"} width={24} height={24} alt={p.name} />
                                     </div>
                                   </div>
                                   <span className="font-medium opacity-80">{p.name}</span>
                                   <span className="font-bold text-success">+{p.amount.toFixed(2)} ৳</span>
                                 </div>
                              ))}
                              {expense.dise.reduce((a, p) => a + p.amount, 0) < 0.01 && (
                                 <div className="flex items-center gap-2 text-sm bg-base-200/50 p-1 rounded-lg pr-2 w-fit">
                                   <div className="avatar">
                                     <div className="w-6 rounded-full">
                                       <Image src="/logo.jpg" width={24} height={24} alt="Manager" />
                                     </div>
                                   </div>
                                   <span className="font-medium opacity-80">Manager</span>
                                   <span className="font-bold text-success">+{expense.amount.toFixed(2)} ৳</span>
                                 </div>
                              )}
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                              {expense.dibo.map((p) => p.amount >= 0.01 && (
                                 <div key={p.id} className="flex items-center gap-2 text-sm bg-base-200/50 p-1 rounded-lg pr-2 w-fit">
                                    <div className="avatar">
                                     <div className="w-6 rounded-full">
                                       <Image src={p.avatar || "/avatar.jpg"} width={24} height={24} alt={p.name} />
                                     </div>
                                   </div>
                                   <span className="font-medium opacity-80">{p.name}</span>
                                   <span className="font-bold text-error">-{p.amount.toFixed(2)} ৳</span>
                                 </div>
                              ))}
                          </div>
                        </td>
                        <td className="text-right pr-6">
                          <div className="font-black text-primary text-xl">
                            {expense.amount.toFixed(2)} ৳
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid gap-4">
                {paginatedExpenses.map((expense) => (
                  <div key={expense._id.toString()} className="card bg-base-100 shadow-md border border-base-content/5">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-2xl shadow-inner">
                            {getCategoryIcon(expense.type)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight">{expense.title}</h3>
                            <div className="text-xs text-base-content/60 mt-1 flex items-center gap-1" suppressHydrationWarning>
                               📅 {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="badge badge-lg badge-primary font-bold">
                          {expense.amount.toFixed(2)} ৳
                        </div>
                      </div>
                      
                      <div className="divider my-2"></div>
                      
                      <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                        <div className="bg-base-200/30 p-2 rounded-lg">
                          <div className="opacity-60 mb-2 text-xs uppercase font-bold">Given By</div>
                          <div className="flex flex-wrap gap-2">
                              {expense.dise.map((p) => p.amount >= 0.01 && (
                                 <div key={p.id} className="flex items-center gap-2 bg-base-100 p-1 rounded-md border border-base-content/5">
                                   <div className="avatar">
                                     <div className="w-5 rounded-full">
                                       <Image src={p.avatar || "/avatar.jpg"} width={20} height={20} alt={p.name} />
                                     </div>
                                   </div>
                                   <span className="font-medium text-xs">{p.name}</span>
                                   <span className="font-bold text-success text-xs">+{p.amount.toFixed(2)}</span>
                                 </div>
                              ))}
                              {expense.dise.reduce((a, p) => a + p.amount, 0) < 0.01 && (
                                 <div className="flex items-center gap-2 bg-base-100 p-1 rounded-md border border-base-content/5">
                                   <div className="avatar">
                                     <div className="w-5 rounded-full">
                                       <Image src="/logo.jpg" width={20} height={20} alt="Manager" />
                                     </div>
                                   </div>
                                   <span className="font-medium text-xs">Manager</span>
                                   <span className="font-bold text-success text-xs">+{expense.amount.toFixed(2)}</span>
                                 </div>
                              )}
                          </div>
                        </div>
                        <div className="bg-base-200/30 p-2 rounded-lg">
                          <div className="opacity-60 mb-2 text-xs uppercase font-bold">Using By</div>
                          <div className="flex flex-wrap gap-2">
                              {expense.dibo.map((p) => p.amount >= 0.01 && (
                                 <div key={p.id} className="flex items-center gap-2 bg-base-100 p-1 rounded-md border border-base-content/5">
                                    <div className="avatar">
                                     <div className="w-5 rounded-full">
                                       <Image src={p.avatar || "/avatar.jpg"} width={20} height={20} alt={p.name} />
                                     </div>
                                   </div>
                                   <span className="font-medium text-xs">{p.name}</span>
                                   <span className="font-bold text-error text-xs">-{p.amount.toFixed(2)}</span>
                                 </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {filteredExpenses.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 bg-base-100/80 backdrop-blur p-4 rounded-xl border border-base-content/5 shadow-sm">
              <div className="text-sm text-base-content/70">
                Showing <span className="font-bold text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-bold text-primary">{Math.min(currentPage * itemsPerPage, filteredExpenses.length)}</span> of{" "}
                <span className="font-bold text-primary">{filteredExpenses.length}</span> results
              </div>
              
              <div className="join shadow-sm">
                 <button
                  className="join-item btn btn-sm hover:btn-primary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  « Prev
                </button>
                
                {/* Simplified Pagination for Mobile to prevent overflow */}
                <div className="join-item btn btn-sm bg-base-100 pointer-events-none hidden md:flex">
                   Page {currentPage} of {Math.ceil(filteredExpenses.length / itemsPerPage)}
                </div>

                <button
                  className="join-item btn btn-sm hover:btn-primary"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(
                        Math.ceil(filteredExpenses.length / itemsPerPage),
                        p + 1
                      )
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(filteredExpenses.length / itemsPerPage)
                  }
                >
                  Next »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Expenses;
