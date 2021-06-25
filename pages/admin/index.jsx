import AuthCheck from "../../components/AuthCheck";

const AdminPostsPage = () => {
  return (
    <AuthCheck>
      <main>
        <h1>Admin</h1>
      </main>
    </AuthCheck>
  );
};

export default AdminPostsPage;
