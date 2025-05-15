import Header from "@components/header";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Shopy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your premier destination for online shopping
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
