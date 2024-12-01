"use client";
import { usePolapainAuth } from "@/context/polapainAuth";

const Dashboard = () => {
  const { polapainAuth } = usePolapainAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome chutiya {polapainAuth?.name}</p>
    </div>
  );
};

export default Dashboard;
