"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavRoute = ({ name, route }: { name: string; route?: string }) => {
  const pathname = usePathname();
  const to = route || `/${name}`;
  const closeNav = () => {
    const inputNav = document.getElementById("my-drawer-3");
    // remove input checkbox
    if (inputNav) {
      (inputNav as HTMLInputElement).checked = false;
    }
    const details = document.querySelectorAll("details[open]");
    details.forEach((detail) => {
      detail.removeAttribute("open");
    });
  };

  return (
    <li className="list-none" onClick={closeNav}>
      <Link
        className={`${pathname === to ? "font-bold underline" : ""}`}
        href={to}
      >
        {name.toUpperCase()}
      </Link>
    </li>
  );
};

export default NavRoute;
