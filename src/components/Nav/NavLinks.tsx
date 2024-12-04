"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import NavRoute from "./NavRoute";
import axios from "axios";
import toast from "react-hot-toast";

const NavLinks = () => {
  const authContext = usePolapainAuth();
  if (typeof authContext === "string") {
    return null; // or handle the error appropriately
  }
  const { polapainAuth, setPolapainAuth } = authContext;

  const handleLogout = () => {
    axios
      .get("/api/logout")
      .then(() => {
        setPolapainAuth(undefined);
      })
      .catch((e) => {
        toast.error(e.message);
      });
  };

  return (
    <>
      <NavRoute name="home" route="/" />
      {polapainAuth ? (
        <>
          <NavRoute name="dashboard" />
          <NavRoute name="all expenses" route="/all-expenses" />
          <NavRoute name="add expenses" route="/add-expenses" />
          <li className="list-none">
            <button onClick={handleLogout}>LOGOUT</button>
          </li>
        </>
      ) : (
        <>
          <NavRoute name="login" />
          <NavRoute name="signup" />
        </>
      )}
    </>
  );
};

export default NavLinks;
