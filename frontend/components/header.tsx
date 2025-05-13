import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "types";

const Header: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

    useEffect(() => {
        const loggedInUserString = sessionStorage.getItem('loggedInUser');
        if (loggedInUserString !== null) {
          setLoggedInUser(JSON.parse(loggedInUserString));
        }
      }, []);
    
      const handleClick = () => {
        sessionStorage.removeItem('loggedInUser');
        setLoggedInUser(null);
      };
    
    return (
        <header>
            <a>
                {" "}
                Shoppy
            </a>
            <nav>
                <Link href="/">
                    Home
                </Link>
                <Link href="/users">
                    Users
                </Link>
                {!loggedInUser && (
                    <Link
                        href="/login">
                        Login
                    </Link>
                )}
                {loggedInUser && (
                    <Link
                        href="/login"
                        onClick={handleClick}>
                        Logout
                    </Link>
                )}  
            </nav>  
        </header>
    );
};

export default Header;
