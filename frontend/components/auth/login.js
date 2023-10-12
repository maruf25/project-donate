"use client";
import AuthContext from "@/provider/AuthContext";
import Link from "next/link";
import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const router = useRouter();

  const ctx = useContext(AuthContext);

  useEffect(() => {
    if (ctx.isLoggedIn) {
      router.push("/");
    }
  }, [router, ctx.isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    ctx.onLogin(emailRef.current.value, passwordRef.current.value);
    if (ctx.data) {
      router.push("/");
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg  sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 shadow-[10px_10px_0px_rgba(0,0,0,1)]">
      {ctx.error && <p className="text-center text-red-500">Email or password not valid</p>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h5 className="text-xl font-medium text-gray-900 dark:text-white">
          Sign in to our platform
        </h5>
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your email
          </label>
          <input
            ref={emailRef}
            type="email"
            name="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="name@company.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your password
          </label>
          <input
            ref={passwordRef}
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
        <div className="flex items-start">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="remember"
                type="checkbox"
                value=""
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
              />
            </div>
            <label
              htmlFor="remember"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          <a href="#" className="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500">
            Lost Password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {ctx.loading ? "Loading..." : "Login to your account"}
        </button>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Not registered?{" "}
          <Link href="/register" className="text-blue-700 hover:underline dark:text-blue-500">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginComponent;
