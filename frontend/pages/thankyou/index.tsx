import { useEffect } from "react";
import { useRouter } from "next/router";

const ThankYouPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="text-lg text-gray-700">
        You will be redirected to the homepage now.
      </p>
    </div>
  );
};

export default ThankYouPage;
