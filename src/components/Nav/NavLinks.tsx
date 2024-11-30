"use client";
import NavRoute from "./NavRoute";

const NavLinks = () => {
  return (
    <>
      <NavRoute name="home" route="/" />
      <NavRoute name="dashboard" />
      <NavRoute name="login" />
      <NavRoute name="signup" />
    </>
  );
};

export default NavLinks;
