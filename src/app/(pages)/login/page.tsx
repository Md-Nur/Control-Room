"use client";
import { useState } from "react";

const Login = () => {
  const [user, setUser] = useState({ name: "", password: "" });
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(user);
  };
  const handleChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="hero bg-base-200 h-[calc(100vh-72px)]">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Ki bondhu amader data dekhte ashco taile to login korte hobe
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                placeholder="Name"
                className="input input-bordered"
                name="name"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                name="password"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-control mt-6">
              <button className="btn btn-primary">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
