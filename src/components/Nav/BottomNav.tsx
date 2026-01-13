"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdHome,
  MdAccountBalanceWallet,
  MdReceipt,
  MdPerson,
  MdAdd,
} from "react-icons/md";

const BottomNav = () => {
  const pathname = usePathname();
  const { polapainAuth } = usePolapainAuth();

  // Don't show bottom nav if not authenticated
  if (!polapainAuth) return null;

  const navItems = [
    { href: "/dashboard", icon: MdHome, label: "Home" },
    { href: "/all-balance", icon: MdAccountBalanceWallet, label: "Balance" },
    { href: "/add-expenses", icon: MdAdd, label: "Add", primary: true },
    { href: "/all-expenses", icon: MdReceipt, label: "Expenses" },
    {
      href: polapainAuth?.isManager ? "/manager" : "/dashboard",
      icon: MdPerson,
      label: polapainAuth?.isManager ? "Manager" : "Profile",
    },
  ];

  return (
    <div className="btm-nav md:hidden z-50 bg-base-200 border-t border-base-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${isActive ? "active" : ""} ${
              item.primary ? "text-primary" : ""
            }`}
          >
            <Icon className={`w-6 h-6 ${item.primary ? "text-2xl" : ""}`} />
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
