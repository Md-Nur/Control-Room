"use client";
import NavRoute from "./NavRoute";

const NavLinks = () => {
  return (
    <>
      <NavRoute name="home" route="/" />
      <NavRoute name="login" />
    </>
  );
};

export default NavLinks;
