"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavRoute = ({ name, route }: { name: string; route?: string }) => {
  const pathname = usePathname();
  const to = route || `/${name}`;
  // console.log(pathname, to);
  return (
    <li>
      <Link className={pathname === to ? "font-bold underline" : ""} href={to}>
        {name.toUpperCase()}
      </Link>
    </li>
  );
};

export default NavRoute;
