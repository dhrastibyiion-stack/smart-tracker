import { useEffect, useState } from "react";


interface Post {
  id: number;
  title: string;
  body: string;
  name: string;
  email: string;
  submittedAt: string;
}

const ReactPlayground = () => {
  const [data, setData] = useState<Post[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem("posts");
        const posts: Post[] = stored ? JSON.parse(stored) : [];
        setData(posts);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <h1 className="text-4xl">Posts</h1>

      {data.length === 0 ? (
        <p style={{ color: "#666" }}>No posts yet. Use the form to create one.</p>
      ) : (
        data.map((item) => (
          <div key={item.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
            <h2 className="text-2xl">{item.title}</h2>
            <p>{item.body}</p>
            <small style={{ color: "#888" }}>
              By {item.name} ({item.email}) – {new Date(item.submittedAt).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

export default ReactPlayground;