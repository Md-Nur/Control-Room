interface BalanceIndicatorProps {
  balance: number;
  maxAbsValue?: number;
  showAmount?: boolean;
}

const BalanceIndicator = ({
  balance,
  maxAbsValue = 1000,
  showAmount = true,
}: BalanceIndicatorProps) => {
  const percentage = Math.min(Math.abs(balance) / maxAbsValue, 1) * 100;
  const isNegative = balance < 0;
  const isZero = balance === 0;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <div className="w-full bg-base-300 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              isZero
                ? "bg-gray-400"
                : isNegative
                ? "bg-error"
                : "bg-success"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      {showAmount && (
        <span
          className={`text-sm font-semibold min-w-[80px] text-right ${
            isZero ? "text-gray-500" : isNegative ? "text-error" : "text-success"
          }`}
        >
          {balance.toFixed(2)} ৳
        </span>
      )}
    </div>
  );
};

export default BalanceIndicator;
