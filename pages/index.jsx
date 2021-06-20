import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";
import { useState } from "react";
import PostFeed from "../components/PostFeed";
import MetaTags from "../components/Metatag";

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [postsEnd, setPostsEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);

    const last = posts[posts.length - 1];

    const cursor =
      typeof last.createdAt === "number"
        ? fromMillis(last.createdAt)
        : last.createdAt;

    const query = firestore
      .collectionGroup("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    if (newPosts.length) {
      setPosts([...posts, newPosts]);
      setLoading(false);
    } else {
      setPostsEnd(true);
      setLoading(false);
    }

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
      setLoading(false);
    }
  };

  return (
    <main>
      <MetaTags
        title="NinzaBlogs"
        description="A multi-user blog website by Nikhil Gupta"
      />
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load More</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end"}
    </main>
  );
}

// Max post to query
const LIMIT = 10;

export const getServerSideProps = async (context) => {
  const postsQuery = firestore
    .collectionGroup("posts")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  // console.log(posts);

  return {
    props: { posts }, // will be passed to the page component as props
  };
};
