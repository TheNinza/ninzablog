import styles from "../../styles/Admin.module.css";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import MetaTags from "../../components/Metatag";
import { auth, firestore, serverTimestamp } from "../../lib/firebase";
import Loader from "../../components/Loader";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploader from "../../components/ImageUploader";

const AdminPostEdit = ({}) => {
  return (
    <>
      <MetaTags title="Modify Post" />

      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </>
  );
};

export default AdminPostEdit;

const PostManager = () => {
  // local states
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore
    .collection("users")
    .doc(auth.currentUser.uid)
    .collection("posts")
    .doc(slug);

  useEffect(async () => {
    const snapshot = await postRef.get();

    if (!snapshot.exists) {
      router.push("/404");
    }
  }, []);

  const [post, loading] = useDocumentDataOnce(postRef);

  return (
    <main className={styles.container}>
      {loading ? (
        <Loader show={true} />
      ) : (
        post && (
          <>
            <section>
              <h1>{post.title}</h1>
              <p>ID: {post.slug}</p>

              <PostForm
                postRef={postRef}
                defaultValues={post}
                preview={preview}
              />
            </section>

            <aside>
              <h3>Tools</h3>
              <button onClick={() => setPreview(!preview)}>
                {preview ? "Edit" : "Preview"}
              </button>

              <Link href={`/${post.username}/${post.slug}`}>
                <button className="btn-blue">Live View</button>
              </Link>
            </aside>
          </>
        )
      )}
    </main>
  );
};

const PostForm = ({ defaultValues, postRef, preview }) => {
  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { isValid, isDirty, errors } = formState;

  const updatePost = async ({ content, published }) => {
    try {
      await postRef.update({
        content,
        published,
        updatedAt: serverTimestamp(),
      });

      reset({ content, published });

      toast.success("Post updated successfully!!!");
    } catch (error) {
      toast.error("Error updating the post!!!");
    }
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            required: "Required",
            maxLength: { value: 20000, message: "Content too long" },
            minLength: { value: 10, message: "Content too short" },
          })}
        />

        {errors?.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published")}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
