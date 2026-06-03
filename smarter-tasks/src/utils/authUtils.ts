// src/utils/authUtils.ts

export interface User {
  email: string;
  password: string;
  name: string;
  role: string;
}

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem("registeredUsers") || "[]");
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem("registeredUsers", JSON.stringify(users));
};

export const registerUser = (newUser: User) => {
  const users = getUsers();
  const userExists = users.some((u) => u.email === newUser.email);

  if (userExists) {
    throw new Error("Email is already registered.");
  }

  users.push(newUser);
  saveUsers(users);
  return { success: true };
};

export const authenticateUser = (email: string, password: string): User => {
  // Check hardcoded admin credentials
  if (email === "admin@gmail.com" && password === "admin123") {
    const adminUser: User = {
      email: "admin@gmail.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    };
    localStorage.setItem("currentUser", JSON.stringify(adminUser));
    return adminUser;
  }

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};