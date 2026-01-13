"use client";
import { Polapain } from "@/models/Polapain";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import CreativeLoader from "@/components/CreativeLoader";

const Manager = () => {
  const [polapains, setPolapains] = useState<Polapain[]>();
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewData, setPreviewData] = useState<{
    addTaka: { id: string; amount: number }[];
  } | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<{
    addTaka: { id: string; amount: number }[];
  }>();
  const router = useRouter();

  const watchedAmounts = watch("addTaka");

  useEffect(() => {
    axios
      .get<Polapain[]>("/api/polapain")
      .then((res) => {
        setPolapains(res.data);
      })
      .catch((err) => {
        toast.error(err.response.data.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddSameToAll = () => {
    const amount = prompt("Enter amount to add to all:");
    if (amount && !isNaN(Number(amount))) {
      polapains?.forEach((_, i) => {
        setValue(`addTaka.${i}.amount`, Number(amount));
      });
      toast.success(`Set ${amount} ৳ for everyone`);
    }
  };

  const handleResetAll = () => {
    polapains?.forEach((_, i) => {
      setValue(`addTaka.${i}.amount`, 0);
    });
    toast.success("Reset all amounts");
  };

  const onSubmit = (data: { addTaka: { id: string; amount: number }[] }) => {
    const hasChanges = data.addTaka.some((item) => Number(item.amount) !== 0);
    if (!hasChanges) {
      toast.error("Please enter at least one amount");
      return;
    }
    setPreviewData(data);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    if (!previewData) return;

    toast.loading("Adding balance...");
    setShowConfirm(false);

    axios
      .post("/api/add-taka", previewData.addTaka)
      .then(() => {
        toast.dismiss();
        toast.success("Balance added successfully!");
        router.push("/all-balance");
      })
      .catch((err) => {
        toast.dismiss();
        toast.error(err.response.data.error);
      });
  };

  const getNewBalance = (currentBalance: number, addAmount: number) => {
    return currentBalance + Number(addAmount || 0);
  };

  const getTotalChange = () => {
    if (!watchedAmounts) return 0;
    return watchedAmounts.reduce(
      (acc, curr) => acc + Number(curr?.amount || 0),
      0
    );
  };

  const totalPool = polapains?.reduce((acc, p) => acc + p.balance, 0) || 0;
  const totalAdding = getTotalChange();
  const newPool = totalPool + totalAdding;

  return (
    <section className="w-full min-h-screen px-4 py-6 pb-24 md:pb-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
          👑 Manager Panel
        </h1>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={handleAddSameToAll}
          >
            Same for All
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={handleResetAll}
          >
            Reset
          </button>
        </div>

        {/* Compact Stats Bar */}
        <div className="bg-base-200 rounded-lg p-4 mb-6 shadow">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-base-content/70">Current Pool</div>
              <div className="text-lg font-bold">{totalPool.toFixed(2)} ৳</div>
            </div>
            <div>
              <div className="text-xs text-base-content/70">Adding</div>
              <div className="text-lg font-bold text-success">
                +{totalAdding.toFixed(2)} ৳
              </div>
            </div>
            <div>
              <div className="text-xs text-base-content/70">New Pool</div>
              <div className="text-lg font-bold text-primary">
                {newPool.toFixed(2)} ৳
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title text-2xl">Add Balance</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleAddSameToAll}
                >
                  Same for All
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleResetAll}
                >
                  Reset
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {polapains?.map((polapain, i) => (
                    <div
                      key={i}
                      className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-12">
                              <Image
                                width={48}
                                height={48}
                                src={polapain?.avatar || "/avatar.jpg"}
                                alt={polapain.name}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{polapain.name}</h3>
                            <p className="text-sm text-base-content/70">
                              Current:{" "}
                              <span
                                className={
                                  polapain.balance < 0
                                    ? "text-error font-semibold"
                                    : "text-success font-semibold"
                                }
                              >
                                {polapain.balance.toFixed(2)} ৳
                              </span>
                            </p>
                          </div>
                        </div>

                        <input
                          type="text"
                          className="hidden"
                          value={polapain._id}
                          {...register(`addTaka.${i}.id`)}
                        />

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text text-xs">
                              Add Amount
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="input input-bordered w-full"
                            {...register(`addTaka.${i}.amount`)}
                            defaultValue={0}
                            step={0.01}
                          />
                        </div>

                        {watchedAmounts?.[i]?.amount !== undefined &&
                          Number(watchedAmounts[i].amount) !== 0 && (
                            <div className="alert alert-success mt-2 py-2">
                              <div className="text-sm">
                                <span className="font-semibold">New: </span>
                                {getNewBalance(
                                  polapain.balance,
                                  watchedAmounts[i].amount
                                ).toFixed(2)}{" "}
                                ৳
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CreativeLoader />
              )}

              <div className="card-actions justify-center mt-6">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  💰 Add Balance
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="alert alert-info mt-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            💡 Tip: Use &quot;Same for All&quot; to quickly add the same amount to
            everyone, or enter individual amounts for each person.
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm Balance Addition"
        message={`You are about to add a total of ${getTotalChange().toFixed(
          2
        )} ৳ to the accounts. Continue?`}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
        confirmText="Yes, Add Balance"
        confirmButtonClass="btn-primary"
      />
    </section>
  );
};

export default Manager;
