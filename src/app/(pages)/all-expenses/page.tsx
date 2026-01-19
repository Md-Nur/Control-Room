"use client";
import { format } from "date-fns";
import { Khoroch } from "@/models/Khoroch";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CreativeLoader from "@/components/CreativeLoader";
import DateInput from "@/components/DateInput";

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
        excludeType: "add-taka",
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
      case "meal":
        return "🍱";
      case "others":
        return "📦";
      case "add-taka":
        return "💰";
      case "grocery":
        return "🛒";
      case "transportation":
        return "🚗";
      case "entertainment":
        return "🎬";
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
          excludeType: "add-taka",
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        });
        const res = await axios.get(`/api/all-expenses?${queryParams}`);
        const allData = res.data.expenses;
        
        const csvData = allData.map((exp: Khoroch) => ({
          Title: exp.title,
          Amount: exp.amount,
          Type: exp.type,
          Date: format(new Date(exp.date), "dd-MM-yyyy"),
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

  const totalExpenses = stats.totalAmount;
  const paginatedExpenses = expenses;
  const filteredExpenses = { length: totalItems };

  const CATEGORIES = [
      "food", "meal", "grocery", "transportation", "house_rent", "utilities", 
      "entertainment", "healthcare", "shopping", "personal_care", "others"
  ];

  return (
    <section className="w-full min-h-screen bg-base-100 py-6 px-3 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black tracking-tight text-primary">Expenses</h1>
                <p className="text-xs font-mono opacity-60">TRACKER v2.0</p>
            </div>

            <div className="flex gap-3">
                 {/* Total Badge */}
                <div className="stats shadow-lg bg-base-200/50 border border-base-content/10 rounded-2xl">
                    <div className="stat py-2 px-4">
                        <div className="stat-title text-xs font-bold opacity-60 uppercase">Total Spent</div>
                        <div className="stat-value text-xl md:text-2xl text-primary">{totalExpenses.toFixed(0)} ৳</div>
                    </div>
                </div>
                 {/* Average Badge (Only visible on larger screens to keep mobile minimal) */}
                <div className="stats shadow-lg bg-base-200/50 border border-base-content/10 hidden sm:inline-grid rounded-2xl">
                    <div className="stat py-2 px-4">
                        <div className="stat-title text-xs font-bold opacity-60 uppercase">Avg/Txn</div>
                        <div className="stat-value text-xl md:text-2xl text-secondary">
                             {totalItems ? (totalExpenses / totalItems).toFixed(0) : "0"} ৳
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 py-2 border-b border-base-content/5 md:static md:bg-transparent md:border-0 md:p-0">
            {/* Search Bar */}
            <div className="w-full relative">
                <input
                    type="text"
                    placeholder="Search expenses..."
                    className="input input-bordered w-full h-10 pl-10 bg-base-200/50 focus:bg-base-100 rounded-full text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base opacity-40">🔍</span>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-2 items-center pb-1">
                
                {/* Type Filter Select */}
                <select 
                    className="select select-bordered select-sm rounded-full bg-base-200/50 max-w-[150px]"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">Filer: All Types</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="capitalize">
                            {cat.replace(/_/g, " ")}
                        </option>
                    ))}
                </select>

                <div className="divider divider-horizontal w-1 m-0 opacity-20 h-8"></div>

                {/* Sort */}
                <select
                  onChange={(e) => setSort(e.target.value)}
                  className="select select-bordered select-sm rounded-full bg-base-200/50 min-w-[110px]"
                  value={sort}
                >
                  <option value="">Sort: Default</option>
                  <option value="date">📅 Date (Newest)</option>
                  <option value="amount_desc">💰 Amount (High)</option>
                  <option value="amount_asc">💰 Amount (Low)</option>
                  <option value="_id">🆕 Added</option>
                </select>

                {/* Date Inputs */}
                <div className="flex items-center gap-2">
                    <DateInput
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="!h-9 !rounded-full !text-xs !w-32 !px-3"
                    />
                    <span className="opacity-30">-</span>
                    <DateInput
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="!h-9 !rounded-full !text-xs !w-32 !px-3"
                    />
                </div>

                <div className="flex-1"></div>
                
                 <button
                    className="btn btn-circle btn-sm btn-ghost text-success"
                    onClick={exportToCSV}
                    disabled={filteredExpenses.length === 0}
                    title="Export CSV"
                 >
                    📥
                 </button>
            </div>
        </div>

        {/* Expenses List */}
        <div className="min-h-[300px]">
          {loading ? (
             <div className="py-20"><CreativeLoader /></div>
          ) : totalItems === 0 ? (
             <div className="text-center py-20 opacity-50 font-mono text-sm">No records found.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-base-content/10 bg-base-100 shadow-xl pb-24">
                <table className="table table-sm">
                  <thead className="bg-base-200/50">
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Paid By</th>
                      <th>Split Among</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((expense) => (
                      <tr key={expense._id.toString()} className="hover:bg-base-200/30 border-b border-base-content/5 last:border-0">
                        <td className="w-32 text-xs opacity-70 font-mono">
                            {format(new Date(expense.date), "dd-MM-yyyy")}
                        </td>
                        <td>
                            <div className="flex items-center gap-2">
                                <span className="text-lg opacity-80">{getCategoryIcon(expense.type)}</span>
                                <span className="font-bold">{expense.title}</span>
                            </div>
                        </td>
                        <td>
                            <div className="flex -space-x-2">
                                {expense.dise.map(p => p.amount > 0 && (
                                    <div key={p.id} className="avatar tooltip tooltip-bottom z-10 hover:z-20" data-tip={`${p.name}: ${p.amount}`} title={`${p.name}: ${p.amount}`}>
                                        <div className="w-6 rounded-full ring ring-base-100 ring-offset-1">
                                            <Image src={p.avatar || "/avatar.jpg"} alt={p.name} width={24} height={24} />
                                        </div>
                                    </div>
                                ))}
                                {expense.dise.every(p => p.amount === 0) && (
                                    <div className="avatar tooltip tooltip-bottom" data-tip={`Manager: ${expense.amount}`} title={`Manager: ${expense.amount}`}>
                                        <div className="w-6 rounded-full ring ring-base-100 ring-offset-1">
                                            <Image src="/logo.jpg" alt="Manager" width={24} height={24} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>
                             <div className="flex -space-x-2">
                                {expense.dibo.map(p => p.amount > 0 && (
                                    <div key={p.id} className="avatar tooltip tooltip-bottom z-10 hover:z-20" data-tip={`${p.name}: ${p.amount}`} title={`${p.name}: ${p.amount}`}>
                                        <div className="w-6 rounded-full ring ring-base-100 ring-offset-1 grayscale opacity-80">
                                            <Image src={p.avatar || "/avatar.jpg"} alt={p.name} width={24} height={24} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="text-right font-black text-primary">
                            {expense.amount.toFixed(2)} ৳
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden grid gap-3">
                {expenses.map((expense) => (
                    <div key={expense._id.toString()} className="card bg-base-100 shadow-lg border border-base-content/10 compact p-0 rounded-2xl">
                        <div className="card-body flex-row justify-between items-center p-3">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl bg-base-200/50 p-2 rounded-lg">
                                    {getCategoryIcon(expense.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold truncate text-sm">{expense.title}</h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                         {/* Paid By Row */}
                                         <div className="flex items-center gap-1 text-xs opacity-70">
                                            <span>Paid by:</span>
                                            {expense.dise.every(p => p.amount === 0) ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="avatar w-4 h-4">
                                                        <div className="rounded-full">
                                                            <Image src="/logo.jpg" alt="Manager" width={16} height={16} />
                                                        </div>
                                                    </div>
                                                    <span className="font-bold">Manager ({expense.amount.toFixed(0)})</span>
                                                </div>
                                            ) : (
                                                <span className="font-bold">
                                                    {expense.dise.find(d => d.amount > 0)?.name.split(' ')[0]}
                                                </span>
                                            )}
                                         </div>
                                         
                                         {/* Date & Split Row */}
                                         {/* Date Row */}
                                         <div className="text-xs opacity-50 font-mono">
                                             {format(new Date(expense.date), "dd-MM-yyyy")}
                                         </div>

                                         {/* Split Among Row */}
                                         <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs opacity-70">Split:</span>
                                            <div className="flex -space-x-2">
                                                {expense.dibo.slice(0, 5).map(p => p.amount > 0 && (
                                                    <div key={p.id} className="avatar w-6 h-6 tooltip tooltip-bottom" data-tip={`${p.name}: ${p.amount}`} title={`${p.name}: ${p.amount}`}>
                                                        <div className="rounded-full grayscale ring ring-base-100 ring-offset-0">
                                                            <Image src={p.avatar || "/avatar.jpg"} alt={p.name} width={24} height={24} />
                                                        </div>
                                                    </div>
                                                ))}
                                                {expense.dibo.filter(p => p.amount > 0).length > 5 && (
                                                    <div className="w-6 h-6 rounded-full bg-base-300 text-[10px] flex items-center justify-center font-bold ring ring-base-100 ring-offset-0 z-10">
                                                        +{expense.dibo.filter(p => p.amount > 0).length - 5}
                                                    </div>
                                                )}
                                            </div>
                                         </div>
                                </div>
                            </div>
                        </div>
                            <div className="text-right whitespace-nowrap">
                                <span className="font-black text-lg text-primary block">{expense.amount.toFixed(0)} ৳</span>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            </>
          )}

          {/* Simple Pagination */}
          {filteredExpenses.length > 0 && (
            <div className="flex justify-center mt-8 join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                <div className="join-item btn btn-sm pointer-events-none bg-base-100">
                    Page {currentPage}
                </div>
                <button
                  className="join-item btn btn-sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(filteredExpenses.length / itemsPerPage), p + 1)
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredExpenses.length / itemsPerPage)}
                >
                  »
                </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Expenses;
