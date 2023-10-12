import LoginComponent from "@/components/auth/login";

export const metadata = {
  title: "Login",
  description: "created for login user donation",
};

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoginComponent />
    </div>
  );
};

export default LoginPage;
