"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { gql, useMutation } from "@apollo/client";
import Head from "next/head";

const CREATE_USER = gql`
  mutation registerUser($username: String!, $email: String!, $password: String!) {
    createUser(userInput: { username: $username, email: $email, password: $password }) {
      email
      username
    }
  }
`;

const RegisterComponent = () => {
  const emailRef = useRef("");
  const usernameRef = useRef("");
  const passwordRef = useRef("");
  const [confPassword, setConfPassword] = useState("");
  const [errorConfPass, setErrConfPass] = useState("");
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);

  let errorMessages = {};
  const classNameNotError = "block mb-2 text-sm font-medium text-white";
  let classNameError;

  if (error) {
    error.graphQLErrors[0].data.forEach((error) => {
      const { path, message } = error;
      errorMessages[path] = message;
    });
    classNameError = "block mb-2 text-sm font-medium text-red-500";
  }

  if (errorConfPass !== "") {
    classNameError = "block mb-2 text-sm font-medium text-red-500";
  }

  const handleConfPassword = (e) => {
    setConfPassword(e.target.value);
    if (e.target.value !== passwordRef.current.value) {
      setErrConfPass("Password not match");
    } else {
      setErrConfPass("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    // Validasi
    if (confPassword !== password) {
      errorMessages = {
        message: "Password not match",
        path: "password",
      };
      throw errorMessages;
    }

    try {
      const response = await createUser({
        variables: {
          username: username,
          email: email,
          password: password,
        },
      });

      if (response.errors) {
        return;
      }

      emailRef.current.value = "";
      usernameRef.current.value = "";
      passwordRef.current.value = "";
      setConfPassword("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-md p-4 mt-10 bg-white border border-gray-200 rounded-lg shadow-[10px_10px_0px_rgba(0,0,0,1)] sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
      <Head>
        <title>Register</title>
      </Head>
      {error && <p className="text-center text-red-500 italic ">{error.message}</p>}
      {data && <p className="text-center text-green-500 italic">Register Success</p>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h5 className="text-xl font-medium text-gray-900 dark:text-white">
          Register to our platform
        </h5>
        <div>
          <label
            htmlFor="email"
            className={errorMessages.email ? classNameError : classNameNotError}
          >
            {errorMessages.email ? errorMessages.email : "Your Email"}
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
            htmlFor="username"
            className={errorMessages.username ? classNameError : classNameNotError}
          >
            {errorMessages.username ? errorMessages.username : "Username"}
          </label>
          <input
            ref={usernameRef}
            type="text"
            name="username"
            id="username"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            placeholder="example69"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className={errorMessages.password ? classNameError : classNameNotError}
          >
            {errorMessages.password ? errorMessages.password : "Your Password"}
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
        <div>
          <label
            htmlFor="confPassword"
            className={errorConfPass ? classNameError : classNameNotError}
          >
            {errorConfPass ? errorConfPass : "Confirm Password"}
          </label>
          <input
            onChange={handleConfPassword}
            type="password"
            name="confPassword"
            id="confPassword"
            placeholder="••••••••"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {loading ? "Loading...." : "Register your account"}
        </button>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Already register?{" "}
          <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-500">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterComponent;
