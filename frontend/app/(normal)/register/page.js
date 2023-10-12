import RegisterComponent from "@/components/auth/signup";

export const metadata = {
  title: "Register",
  description: "Created for register user donation",
};

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <RegisterComponent />
    </div>
  );
};

export default LoginPage;
