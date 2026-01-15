"use client";
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
          <NavRoute name="balances" route="/all-balance" />
          <NavRoute name="expenses" route="/all-expenses" />
          <NavRoute name="add expense" route="/add-expenses" />
          <NavRoute name="meals" route="/meal-manager" />
          <NavRoute name="add image" route="/add-img" />
          <NavRoute name="profile" route="/profile" />
          {polapainAuth?.isManager && <NavRoute name="manager" route="/manager" />}
          <li className="list-none">
            <button onClick={handleLogout}>LOGOUT</button>
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
