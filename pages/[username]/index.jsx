import router from "next/router";
import AuthCheck from "../../components/AuthCheck";
import PostFeed from "../../components/PostFeed";
import UserProfile from "../../components/UserProfile";
import { getUserWithUserName, postToJSON } from "../../lib/firebase";

const UserProfilePage = ({ user, posts }) => {
  return (
    <main>
      <UserProfile user={user} />
      <AuthCheck fallback={<></>}>
        <button
          onClick={() => router.push("/admin")}
          className="btn-blue push-left"
        >
          Edit Posts
        </button>
      </AuthCheck>

      <PostFeed posts={posts} />
    </main>
  );
};

export default UserProfilePage;

export const getServerSideProps = async ({ query }) => {
  const { username } = query;

  const userDoc = await getUserWithUserName(username);

  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data

  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();

    const postsQuery = userDoc.ref
      .collection("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5);

    posts = (await postsQuery.get()).docs.map(postToJSON);
  }

  return {
    props: { user, posts },
  };
};
