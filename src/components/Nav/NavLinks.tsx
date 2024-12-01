"use client";
import { usePolapainAuth } from "@/context/polapainAuth";
import NavRoute from "./NavRoute";

const NavLinks = () => {
  const authContext = usePolapainAuth();
  if (typeof authContext === "string") {
    return null; // or handle the error appropriately
  }
  const { polapainAuth } = authContext;

  return (
    <>
      <NavRoute name="home" route="/" />
      {polapainAuth ? (
        <NavRoute name="dashboard" />
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
