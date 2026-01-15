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
        <div className="navbar bg-base-100/80 backdrop-blur-md w-full sticky top-0 z-50 border-b border-base-content/10 shadow-sm">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer-3"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <MdMenu className="w-7 h-7" />
            </label>
          </div>
          <div className="mx-2 flex-1 px-2 items-center gap-3">
            <div className="avatar">
               <div className="w-10 h-10 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-1">
                  <Image src={Logo} alt="Logo" />
               </div>
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
      <div className="drawer-side z-[100]">
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
