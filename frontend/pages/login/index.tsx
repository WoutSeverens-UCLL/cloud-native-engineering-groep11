import React from "react";
import UserLoginForm from "@components/users/UserLoginForm";
import Header from "@components/header";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <UserLoginForm />
      </main>
    </div>
  );
};

export default Login;
