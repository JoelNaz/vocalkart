import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import {useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate()

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/query/login/", {
        email,
        password,
      });

      // Assuming the token is returned in the 'refresh_token' field
      const token = response.data.token;
      console.log(response.status);
      console.log(token);
      // Store the token in localStorage
      localStorage.setItem("token", token);
      // Handle successful login, maybe redirect to another page
      navigate('/')
      toast.success("Login successfully!");
      // console.log("Login successful!");
    } catch (error) {
      console.error("Error during login:", error.message);
      toast.error("An error occurred during sign-in. Please try again.");
      // Handle login error
    }
  };

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
              Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-black transition-all duration-200 hover:underline"
              >
                Register here
              </Link>
              .
            </p>
            <form className="mt-8">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor=""
                    className="text-base font-medium text-gray-900"
                  >
                    {" "}
                    Email:{" "}
                  </label>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    ></input>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor=""
                      className="text-base font-medium text-gray-900"
                    >
                      {" "}
                      Password{" "}
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    ></input>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="h-screen ">
          <img
            className="mx-auto h-full w-full rounded-md object-cover"
            src="https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=150https://images.unsplash.com/photo-1601598851547-4302969d0614?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
        </div>
      </div>
    </section>
  );
};

export default Login;
