"use client";
import { useEffect } from "react";
import { usePolapainAuth } from "@/context/polapainAuth";
import NavRoute from "./NavRoute";
import axios from "axios";
import toast from "react-hot-toast";

const NavLinks = () => {
  const authContext = usePolapainAuth();
  if (typeof authContext === "string") {
    return null;
  }
  const { polapainAuth, setPolapainAuth, setLoading, loading } = authContext;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const details = document.querySelectorAll("details[open]");
      details.forEach((detail) => {
        if (!detail.contains(e.target as Node)) {
          detail.removeAttribute("open");
        }
      });
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = () => {
    setLoading(true);
    axios
      .get("/api/logout")
      .then(() => {
        setPolapainAuth(undefined);
      })
      .catch((e) => {
        toast.error(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <NavRoute name="home" route="/" />
      {!loading && polapainAuth ? (
        <>
          <NavRoute name="dashboard" route="/dashboard" />
          
          {/* Finance Dropdown */}
          <li className="list-none">
             <details>
               <summary className="uppercase">Finance</summary>
               <ul className="p-2 bg-base-100/90 backdrop-blur-md z-50 rounded-t-none">
                 <NavRoute name="add expense" route="/add-expenses" />
                 <NavRoute name="expenses" route="/all-expenses" />
                 <NavRoute name="balances" route="/all-balance" />
               </ul>
             </details>
          </li>

          <NavRoute name="meals" route="/meal-manager" />
          
          {/* Account Dropdown */}
          <li className="list-none">
             <details>
               <summary className="uppercase">Account</summary>
               <ul className="p-2 bg-base-100/90 backdrop-blur-md z-50 rounded-t-none">
                 <NavRoute name="profile" route="/profile" />
                 {polapainAuth?.isManager && <NavRoute name="manager" route="/manager" />}
                 <li className="list-none">
                   <button onClick={handleLogout}>LOGOUT</button>
                 </li>
               </ul>
             </details>
          </li>
        </>
      ) : (
        <>
          <NavRoute name="login" />
        </>
      )}
    </>
  );
};

export default NavLinks;
