import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import Loader from "../components/Loader";
import debounce from "lodash.debounce";

const EnterPage = ({}) => {
  const { user, username } = useContext(UserContext);
  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
};

function SignInButton() {
  const signInWithGoogle = async () => {
    try {
      await auth.signInWithPopup(googleAuthProvider);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <Image
        quality="100"
        layout="fixed"
        width={25}
        height={25}
        src={"/google.png"}
      />
      Sign in with Google
    </button>
  );
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
  const [formValue, setFomrValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const regEx = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFomrValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (regEx.test(val)) {
      setFomrValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = firestore.doc(`usernames/${username}`);
        const { exists } = await ref.get();

        console.log("Firestore read executed");
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userDoc = firestore.doc(`users/${user.uid}`);
      const usernameDoc = firestore.doc(`usernames/${formValue}`);

      const batch = firestore.batch();
      batch.set(userDoc, {
        username: formValue,
        photoURL: user.photoURL,
        displayName: user.displayName,
      });

      batch.set(usernameDoc, { uid: user.uid });
      batch.commit();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section>
      <h3>Choose Username</h3>
      <form onSubmit={onSubmit}>
        <input
          name="username"
          placeholder="username"
          value={formValue}
          onChange={onChange}
        />

        <UsernameMessage
          username={formValue}
          isValid={isValid}
          loading={loading}
        />

        <button type="submit" className="btn-green" disabled={!isValid}>
          Choose
        </button>
      </form>
    </section>
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <Loader show />;
  } else if (isValid) {
    return <p className="text-success">{username} is valid</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">{username} is taken</p>;
  } else {
    return <p></p>;
  }
}

export default EnterPage;
