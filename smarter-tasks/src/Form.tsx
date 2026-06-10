import React, { useState } from "react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type StoredPost = {
  id: number;
  title: string;
  body: string;
  name: string;
  email: string;
  submittedAt: string;
};

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPost, setSubmittedPost] = useState<StoredPost | null>(null);
  const [allPosts, setAllPosts] = useState<StoredPost[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmittedPost(null);
    setLoading(true);

    try {
      const newPost: StoredPost = {
        id: Date.now(),
        title: formData.message || "Untitled",
        body: formData.message || "",
        name: formData.name,
        email: formData.email,
        submittedAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem("posts");
      const posts: StoredPost[] = stored ? JSON.parse(stored) : [];
      posts.unshift(newPost);
      localStorage.setItem("posts", JSON.stringify(posts));

      setSubmittedPost(newPost);
      setAllPosts(posts);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadPosts();
  }, [submittedPost]);

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)" }}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)" }}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)" }}
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            border: "1px solid var(--accent-border)",
            background: "var(--accent-bg)",
            color: "var(--accent)",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "transform 0.05s ease, filter 0.2s ease",
          }}
          onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.99)" )}
          onMouseUp={(e) => !loading && (e.currentTarget.style.transform = "scale(1)" )}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Name: {formData.name}</li>
          <li>Email: {formData.email}</li>
          <li>Message: {formData.message}</li>
        </ul>
      </form>

      {error ? (
        <div style={{ marginTop: 12, color: "#b00020", fontWeight: 700 }}>
          {error}
        </div>
      ) : null}

      {submittedPost ? (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "0 0 8px" }}>Saved Post</h3>
          <pre
            style={{
              background: "rgba(0,0,0,0.04)",
              padding: 12,
              borderRadius: 12,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(submittedPost, null, 2)}
          </pre>
        </div>
      ) : null}

      {allPosts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: "0 0 8px" }}>All Saved Posts</h3>
          {allPosts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "rgba(0,0,0,0.03)",
                padding: 10,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <strong>{post.title}</strong>
              <div style={{ fontSize: 12, color: "#555" }}>
                By {post.name} ({post.email}) – {new Date(post.submittedAt).toLocaleString()}
              </div>
              <div>{post.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Form;

