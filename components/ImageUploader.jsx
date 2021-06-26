import { useState } from "react";
import toast from "react-hot-toast";
import { auth, STATE_CHANGED, storage } from "../lib/firebase";
import Loader from "./Loader";

const ImageUploader = () => {
  // local states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadFile = async (e) => {
    // get the file
    const file = Array.from(e.target.files)[0];
    const extension = file?.type.split("/")[1];

    try {
      // Make ref to the storage bucket
      const ref = storage.ref(
        `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
      );
      setUploading(true);

      // Starts the upload
      const task = ref.put(file);

      // Listen to updates to upload task
      task.on(STATE_CHANGED, (snapshot) => {
        const pct = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);
        setProgress(pct);

        // Get downloadURL AFTER task resolves (Note: this is not a native Promise)
        task
          .then((d) => ref.getDownloadURL())
          .then((url) => {
            setDownloadURL(url);
            setUploading(false);
            toast.success("File Uploaded!!");
          });
      });
    } catch (error) {
      console.log(error);
      toast.error("File Upload Failed");
    }
  };

  return (
    <div className="box">
      <Loader show={uploading} />

      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className="btn">
            📸 Upload Img
            <input
              type="file"
              onChange={uploadFile}
              accept="image/x-png,image/gif,image/jpeg"
            />
          </label>
        </>
      )}

      {downloadURL && (
        <code className="upload-snippet">
          {!uploading ? `![alt](${downloadURL})` : `Uploading File`}
        </code>
      )}
    </div>
  );
};

export default ImageUploader;
