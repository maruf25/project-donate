"use client";
import { gql, useMutation } from "@apollo/client";
import { useState, useEffect, createContext } from "react";

const AuthContext = createContext({
  isLoggedIn: true,
  onLogout: () => {},
  onLogin: () => {},
  data: {},
  error: {},
  loading: {},
});

const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      userId
    }
  }
`;

export const AuthContextProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [LoginUser, { data, loading, error }] = useMutation(LOGIN_USER);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    setIsLoggedIn(false);
  };

  const loginHandler = async (email, password) => {
    try {
      const response = await LoginUser({
        variables: {
          email,
          password,
        },
      });
      if (response.errors) {
        return;
      }
      setIsLoggedIn(true);
      localStorage.setItem("token", response.data.loginUser.token);
      localStorage.setItem("userId", response.data.loginUser.userId);
      const remainingMilliSecond = 60 * 60 * 1000;
      const expiryDate = new Date(new Date().getTime() + remainingMilliSecond);
      localStorage.setItem("expiryDate", expiryDate);
      setAutoLogout(remainingMilliSecond);
    } catch (error) {
      console.log(error);
    }
  };

  const setAutoLogout = (milisecond) => {
    setTimeout(() => {
      logoutHandler();
    }, milisecond);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, onLogout: logoutHandler, onLogin: loginHandler, data, error, loading }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
