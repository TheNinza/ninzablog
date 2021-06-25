import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "../lib/context";
import { auth } from "../lib/firebase";

const Navbar = ({}) => {
  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <button className="btn-logo">FEED</button>
          </Link>
        </li>

        {username ? (
          <>
            <li className="push-left">
              <button onClick={() => auth.signOut()}>Sign Out</button>
            </li>
            <li>
              <Link href="/admin">
                <button className="btn-blue">Write Posts</button>
              </Link>
            </li>
            <li>
              <Link href={`/${username}`}>
                <div>
                  <Image
                    height={100}
                    width={100}
                    src={user?.photoURL || "/hacker.png"}
                    alt="profile photo"
                  />
                </div>
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Link href={`enter`}>
              <button className="btn-blue">Log in</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
