"use client";
import Link from "next/link";
import { usePolapainAuth } from "@/context/polapainAuth";

const Hero = () => {
  const { polapainAuth } = usePolapainAuth();

  return (
    <div
      className="hero h-72 sm:h-96 md:h-[500px]"
      style={{
        backgroundImage:
          "url(https://i.ibb.co.com/HnmfKMd/PXL-20241204-062046799-PORTRAIT.jpg)",
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Control Room</h1>
          <p className="mb-5">
            Your flatmate expense tracker. Manage shared expenses, track balances, and settle up easily.
          </p>
          {polapainAuth && (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/add-expenses" className="btn btn-primary">
                💸 Add Expense
              </Link>
              <Link href="/all-balance" className="btn btn-outline btn-accent">
                💰 View Balances
              </Link>
            </div>
          )}
          {!polapainAuth && (
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
