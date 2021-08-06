import Link from "next/link";
import { useContext } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../lib/context";
import { firestore } from "../lib/firebase";

const PostFeed = ({ posts, admin }) =>
  posts
    ? posts.map((post) => (
        <PostItem post={post} key={post.slug} admin={admin} />
      ))
    : null;

export default PostFeed;

function PostItem({ post, admin = false }) {
  const wordCount = post?.content.trim().split(/\s+/g).length;

  const minutesToRead = (wordCount / 100 + 1).toFixed(0);

  const { user } = useContext(UserContext);

  const deletePost = async () => {
    if (confirm("Are you sure? Can't Undo Delete!")) {
      try {
        const query = firestore
          .collection("users")
          .doc(user.uid)
          .collection("posts")
          .doc(post.slug);

        await query.delete();

        toast.success("Deleted👍! Hope you write a new one soon!!");
      } catch (error) {
        console.log(error);
        toast.error("Some error occured");
      }
    }
  };

  return (
    <div className="card">
      <Link href={`/${post.username}`}>
        <a>
          <strong>By @{post.username}</strong>
        </a>
      </Link>

      <Link href={`/${post.username}/${post.slug}`}>
        <a>
          <h2>{post.title}</h2>
        </a>
      </Link>

      {admin && (
        <div style={{ display: "flex" }}>
          <Link href={`/admin/${post.slug}`}>
            <button className="btn-blue">Edit</button>
          </Link>
          <button onClick={deletePost} className="btn-red">
            Delete
          </button>
        </div>
      )}

      <footer>
        <span>
          {wordCount} words. {minutesToRead} min read
        </span>
        <span>♥️ {post.heartCount} Hearts</span>
      </footer>
    </div>
  );
}
