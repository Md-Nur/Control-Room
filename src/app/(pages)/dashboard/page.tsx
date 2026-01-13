import Hero from "@/components/Home/Hero";
import QuickStats from "@/components/Dashboard/QuickStats";
import RecentActivity from "@/components/Dashboard/RecentActivity";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickStats />
      <RecentActivity />
      {/* <HomeStats /> */}
    </>
  );
}
