import Image from "next/image";

const HomeStats = () => {
  return (
    <div className="stats shadow my-10">
      <div className="stat">
        <div className="stat-figure text-primary"></div>
        <div className="stat-title">Total Time</div>
        <div className="stat-value text-primary">3 days</div>
        <div className="stat-desc">In 2024</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">{/* <Fa */}</div>
        <div className="stat-title">Total Expense</div>
        <div className="stat-value text-secondary">2.6M</div>
        <div className="stat-desc">21% more than last month</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <div className="avatar online">
            <div className="w-16 rounded-full">
              <Image
                alt="Manager"
                width={100}
                height={100}
                src="https://i.ibb.co.com/mGpCz3G/rubayet.jpg"
              />
            </div>
          </div>
        </div>
        <div className="stat-value">Manager</div>
        <div className="stat-title">Rubayet</div>
        <div className="stat-desc text-secondary">31 tasks remaining</div>
      </div>
    </div>
  );
};

export default HomeStats;
