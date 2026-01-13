"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BalanceIndicator from "@/components/BalanceIndicator";
import CreativeLoader from "@/components/CreativeLoader";

const Balance = () => {
  const [polapain, setPolapain] = useState<Polapain[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");

  useEffect(() => {
    axios
      .get("/api/polapain")
      .then((res) => {
        setPolapain(res.data);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.error || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalBalance = polapain.reduce((acc, pola) => acc + pola.balance, 0);
  const positiveBalances = polapain.filter((p) => p.balance > 0);
  const negativeBalances = polapain.filter((p) => p.balance < 0);
  const maxAbsBalance = Math.max(
    ...polapain.map((p) => Math.abs(p.balance)),
    1
  );

  const filteredPolapain = polapain.filter((p) => {
    if (filter === "positive") return p.balance > 0;
    if (filter === "negative") return p.balance < 0;
    return true;
  });

  const getSettlementSuggestions = () => {
    // Create deep copies to avoid mutating the original state
    const debtors = polapain
      .filter((p) => p.balance < 0)
      .map(p => ({ ...p, balance: p.balance }))
      .sort((a, b) => a.balance - b.balance);
    const creditors = polapain
      .filter((p) => p.balance > 0)
      .map(p => ({ ...p, balance: p.balance }))
      .sort((a, b) => b.balance - a.balance);

    const suggestions: { from: string; to: string; amount: number }[] = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debt = Math.abs(debtors[i].balance);
      const credit = creditors[j].balance;
      const amount = Math.min(debt, credit);

      if (amount > 0.01) {
        suggestions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: amount,
        });
      }

      debtors[i].balance += amount;
      creditors[j].balance -= amount;

      if (Math.abs(debtors[i].balance) < 0.01) i++;
      if (Math.abs(creditors[j].balance) < 0.01) j++;
    }

    return suggestions;
  };

  const copySettlementInstructions = () => {
    const suggestions = getSettlementSuggestions();
    const text = suggestions
      .map(
        (s, i) =>
          `${i + 1}. ${s.from} should pay ${s.to}: ${s.amount.toFixed(2)} ৳`
      )
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast.success("Settlement instructions copied to clipboard!");
    });
  };

  const totalPool = totalBalance;
  const inCredit = positiveBalances.length;
  const inDebt = negativeBalances.length;

  return (
    <section className="w-full px-4 py-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl text-center mb-6 font-bold">
          💰 Balances
        </h1>

        {/* Compact Summary Bar */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-base-content/70">Pool</div>
              <div className="text-lg font-bold">{totalPool.toFixed(2)} ৳</div>
            </div>
            <div>
              <div className="text-xs text-base-content/70">In Credit</div>
              <div className="text-lg font-bold text-success">{inCredit}</div>
            </div>
            <div>
              <div className="text-xs text-base-content/70">In Debt</div>
              <div className="text-lg font-bold text-error">{inDebt}</div>
            </div>
            <div>
              <div className="text-xs text-base-content/70">Average</div>
              <div className="text-lg font-bold">
                {polapain.length ? (totalPool / polapain.length).toFixed(2) : "0.00"} ৳
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter("all")}
          >
            All ({polapain.length})
          </button>
          <button
            className={`btn btn-sm ${filter === "positive" ? "btn-success" : "btn-outline"}`}
            onClick={() => setFilter("positive")}
          >
            In Credit ({positiveBalances.length})
          </button>
          <button
            className={`btn btn-sm ${filter === "negative" ? "btn-error" : "btn-outline"}`}
            onClick={() => setFilter("negative")}
          >
            In Debt ({negativeBalances.length})
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {!loading ? (
            filteredPolapain.length > 0 ? (
              filteredPolapain.map((pola, i) => (
                <div
                  key={i}
                  className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar">
                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <Image
                            src={pola?.avatar || "/avatar.jpg"}
                            alt={pola.name}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="card-title text-lg">{pola.name}</h3>
                        <p className="text-sm text-base-content/70">
                          {pola.isManager && "👑 Manager"}
                        </p>
                      </div>
                    </div>
                    <BalanceIndicator
                      balance={pola.balance}
                      maxAbsValue={maxAbsBalance}
                      showAmount={true}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-base-content/70">
                  No balances match this filter
                </p>
              </div>
            )
          ) : (
            <div className="col-span-full">
              <CreativeLoader />
            </div>
          )}
        </div>

        {/* Settlement Suggestions */}
        {!loading && negativeBalances.length > 0 && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-2xl">
                  💡 Settlement Suggestions
                </h2>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={copySettlementInstructions}
                >
                  📋 Copy Instructions
                </button>
              </div>
              <p className="text-sm text-base-content/70 mb-4">
                Optimal payment flow to settle all debts:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {getSettlementSuggestions().map((suggestion, i) => (
                  <div
                    key={i}
                    className="alert alert-info flex flex-col sm:flex-row justify-between items-center gap-2 p-3 sm:p-4 text-center sm:text-left"
                  >
                    <span className="text-sm sm:text-base">
                      <strong>{suggestion.from}</strong> should pay{" "}
                      <strong>{suggestion.to}</strong>
                    </span>
                    <span className="badge badge-lg whitespace-nowrap">
                      {suggestion.amount.toFixed(2)} ৳
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manager Total */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl mt-8">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 rounded-full ring ring-primary-content ring-offset-base-100 ring-offset-2">
                    <Image
                      src="/logo.jpg"
                      alt="Manager"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Manager Pool</h3>
                  <p className="text-sm opacity-80">Total system balance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">
                  {totalBalance.toFixed(2)} ৳
                </p>
                <p className="text-sm opacity-80">
                  {totalBalance >= 0 ? "Surplus" : "Deficit"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Balance;
