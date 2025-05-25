import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import UserService from "@services/UserService";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { StatusMessage } from "types";

const UserSignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [roleError, setRoleError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const clearErrors = () => {
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setRoleError(null);
    setStatusMessages([]);
  };

  const validate = (): boolean => {
    let result = true;

    if (!firstName || firstName.trim() === "") {
      setFirstNameError("First name is required");
      result = false;
    }

    if (!lastName || lastName.trim() === "") {
      setLastNameError("Last name is required");
      result = false;
    }

    if (!email || email.trim() === "") {
      setEmailError("Email is required");
      result = false;
    }

    if (!password || password.trim() === "") {
      setPasswordError("Password is required");
      result = false;
    }

    if (!role || role.trim() === "") {
      setRoleError("Role is required");
      result = false;
    }

    return result;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    clearErrors();

    if (!validate()) {
      return;
    }

    const user = { firstName, lastName, email, password, role };
    const response = await UserService.signupUser(user);

    if (response.status === 200) {
      setStatusMessages([
        {
          message: "Signup successful. Redirecting to loginpage...",
          type: "success",
        },
      ]);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setStatusMessages([
        {
          message: "Signup failed. Please try again.",
          type: "error",
        },
      ]);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="shadow-lg border-gray-200 border-t-4 border-t-purple-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign up to Shopy
          </CardTitle>
        </CardHeader>

        {statusMessages.length > 0 && (
          <div className="px-6">
            {statusMessages.map(({ message, type }, index) => (
              <Alert
                key={index}
                variant={type === "error" ? "destructive" : "default"}
                className={
                  type === "success"
                    ? "bg-green-50 border-green-300 text-green-800"
                    : ""
                }
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="firstName">
                First Name
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  className="pl-10 border-gray-200"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              {firstNameError && (
                <p className="text-sm text-red-600">{firstNameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="lastName">
                Last Name
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  className="pl-10 border-gray-200"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              {lastNameError && (
                <p className="text-sm text-red-600">{lastNameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="email">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 border-gray-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="password">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 border-gray-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 cursor-pointer" />
                  ) : (
                    <Eye className="h-5 w-5 cursor-pointer" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="role">
                Role
              </Label>
              <div className="relative">
                <Input
                  id="role"
                  type="text"
                  placeholder="Enter your role"
                  className="pl-10 border-gray-200"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              {roleError && <p className="text-sm text-red-600">{roleError}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white font-bold cursor-pointer"
            >
              Sign Up
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-purple-700 hover:text-purple-800 font-medium"
            >
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserSignupPage;
