"use client";
import React, { ReactNode } from "react";
import { MdMenu } from "react-icons/md";
import NavLinks from "./NavLinks";
import Logo from "../../../public/logo.jpg";
import Image from "next/image";
import NotificationBell from "./NotificationBell";
import { usePathname } from "next/navigation";

const Navbar = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  const getTitle = (path: string) => {
      if (path === "/") return "Control Room";
      if (path === "/dashboard") return "Dashboard";
      
      const parts = path.substring(1).split("/");
      if (parts.length > 0) {
           const title = parts[0].replace(/-/g, " ");
           return title.charAt(0).toUpperCase() + title.slice(1);
      }
      return "Control Room";
  };

  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 w-full">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <MdMenu className="w-7 h-7" />
            </label>
          </div>
          <div className="mx-2 flex-1 px-2 items-center gap-4">
            <Image src={Logo} alt="Logo" className="w-12 h-12 rounded" />
            <h1 className="text-xl font-bold hidden sm:block">
                {getTitle(pathname)}
            </h1>
          </div>
          
          {/* Notification Bell */}
          <div className="flex-none">
             <NotificationBell />
          </div>

          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              <NavLinks />
            </ul>
          </div>
        </div>
        {/* Page content here */}
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 min-h-full w-80 p-4">
          <NavLinks />
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
