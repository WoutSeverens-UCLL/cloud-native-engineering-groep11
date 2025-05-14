import Header from "@components/header";
import UserSignupPage from "@components/users/UserSignupPage";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <UserSignupPage />
      </main>
    </div>
  );
};

export default SignUp;
