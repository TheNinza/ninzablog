import styles from "../../styles/Post.module.css";
import { firestore, getUserWithUserName, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PostContent from "../../components/PostContent";
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";
import Link from "next/link";

const PostPage = (props) => {
  const postRef = firestore.doc(props.path);
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;
  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post?.heartCount || 0} ❤️</strong>
        </p>
        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>❤️ Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
};

export default PostPage;

export const getStaticProps = async ({ params }) => {
  const { username, slug } = params;

  const userDoc = await getUserWithUserName(username);

  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection("posts").doc(slug);

    const snapShot = await postRef.get();

    if (snapShot.exists) {
      post = postToJSON(snapShot);

      path = postRef.path;
    } else {
      return {
        notFound: true,
      };
    }
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
};

export const getStaticPaths = async () => {
  // Todo: Improve by using Admin SDK to select empty docs
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    /**
     * must be in following format:
     * paths: [
     *  {params: {username, slug}}
     * ]
     */

    paths,
    fallback: "blocking",
  };
};
