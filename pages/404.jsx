import Link from "next/dist/client/link";

const Custom404 = () => {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <h1>404 - Oooops!! The page got lost in the internet</h1>
      <iframe
        src="https://giphy.com/embed/l2JehQ2GitHGdVG9Y"
        frameBorder="0"
        width="480"
        height="362"
        allowFullScreen
      ></iframe>
      <Link href="/">
        <button className="btn-blue">Go Home</button>
      </Link>
    </main>
  );
};

export default Custom404;
