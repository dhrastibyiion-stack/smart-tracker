export const getCurrentUser = () => {
  try {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const role = localStorage.getItem("userRole");

    if (!user || !role) return null;

    return {
      name: user.name ?? "",
      username: user.username ?? "",
      role,
    };
  } catch {
    return null;
  }
};
