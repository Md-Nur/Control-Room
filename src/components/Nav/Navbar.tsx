import React, { ReactNode } from "react";
import { MdMenu } from "react-icons/md";
import NavLinks from "./NavLinks";

const Navbar = ({ children }: { children: ReactNode }) => {
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
              <MdMenu />
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">Control Room</div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              {/* Navbar menu content here */}
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
          {/* Sidebar content here */}
          <NavLinks />
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
