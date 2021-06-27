import styles from "../../styles/Admin.module.css";
import AuthCheck from "../../components/AuthCheck";
import { auth, firestore, serverTimestamp } from "../../lib/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import PostFeed from "../../components/PostFeed";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { UserContext } from "../../lib/context";
import kebabCase from "lodash.kebabcase";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const AdminPostsPage = () => {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
};

export default AdminPostsPage;

// PostList Component

const PostList = () => {
  const ref = firestore
    .collection("users")
    .doc(auth?.currentUser?.uid)
    .collection("posts");
  const query = ref.orderBy("createdAt");
  const [querySnapshot, loading] = useCollection(query);

  if (loading) {
    return <Loader show={true} />;
  }

  const posts = querySnapshot.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
};

const CreateNewPost = () => {
  const router = useRouter();
  const { username } = useContext(UserContext);

  // local state
  const [title, setTitle] = useState("");

  // ensure Slug is URI safe
  const slug = encodeURI(kebabCase(title));

  // validate length
  const isValid = title.length > 3 && title.length < 100;

  // custom functions

  const createPost = async (e) => {
    e.preventDefault();

    const uid = auth.currentUser.uid;

    try {
      const ref = firestore
        .collection("users")
        .doc(uid)
        .collection("posts")
        .doc(slug);

      // Tip: give all fields a default value here
      const data = {
        title,
        slug,
        uid,
        username,
        published: false,
        content: "# hello world!",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        heartCount: 0,
      };

      await ref.set(data);

      toast.success("Post created!!!!!");

      router.push(`/admin/${slug}`);
    } catch (error) {
      console.log(error);
      toast.error("Error creating post");
    }
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Name This Awesome Article"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
};
