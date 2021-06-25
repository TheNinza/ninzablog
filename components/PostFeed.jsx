import Link from "next/link";

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

  return (
    <div className="card">
      <Link href={`/${post.username}`}>
        <a>
          <strong>By @{post.username}</strong>
        </a>
      </Link>

      <Link href={`/${post.username}/${post.slug}`}>
        <h2>
          <a>{post.title}</a>
        </h2>
      </Link>

      {admin && (
        <Link href={`/admin/${post.slug}`}>
          <button className="btn-blue">Edit</button>
        </Link>
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
