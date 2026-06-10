// src/utils/authUtils.ts

export interface User {
  email: string;
  password: string;
  name: string;
  role: string;
  companyId?: string;
  passwordSet?: boolean;
}

export interface Invitation {
  email: string;
  name: string;
  role: string;
  token: string;
  expiresAt: number;
  companyId: string;
}

export const USERS_STORAGE_KEY = "registeredUsers";
export const INVITATIONS_STORAGE_KEY = "invitations";

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getInvitations = (): Invitation[] => {
  return JSON.parse(localStorage.getItem(INVITATIONS_STORAGE_KEY) || "[]");
};

export const saveInvitations = (invitations: Invitation[]) => {
  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
};

export const registerUser = (newUser: User) => {
  const users = getUsers();
  const userExists = users.some((u) => u.email === newUser.email);

  if (userExists) {
    throw new Error("Email is already registered.");
  }

  users.push(newUser);
  saveUsers(users);

  const membersStr = localStorage.getItem("members");
  const members: { id: number; name: string; email: string; role: string; companyId?: string; createdBy: string }[] = membersStr ? JSON.parse(membersStr) : [];
  members.push({
    id: Date.now(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    companyId: newUser.companyId,
    createdBy: newUser.email,
  });
  localStorage.setItem("members", JSON.stringify(members));

  return { success: true };
};

export const createInvitation = (name: string, email: string, role: string, companyId: string): string => {
  const token = btoa(email + ":" + Date.now());
  const invitations = getInvitations();
  
  invitations.push({
    email,
    name,
    role,
    token,
    companyId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  
  saveInvitations(invitations);
  return token;
};

export const validateInvitation = (token: string): Invitation | null => {
  const invitations = getInvitations();
  const invitation = invitations.find((i) => i.token === token && i.expiresAt > Date.now());
  return invitation || null;
};

export const completeInvitation = (token: string, password: string) => {
  const invitations = getInvitations();
  const invitation = invitations.find((i) => i.token === token);
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation.");
  }

  const users = getUsers();
  const existingUserIndex = users.findIndex((u) => u.email === invitation.email);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = {
      ...users[existingUserIndex],
      password,
      passwordSet: true,
      companyId: invitation.companyId,
    };
  } else {
    users.push({
      email: invitation.email,
      password,
      name: invitation.name,
      role: invitation.role,
      companyId: invitation.companyId,
      passwordSet: true,
    });
  }
  saveUsers(users);

  const updatedInvitations = invitations.filter((i) => i.token !== token);
  saveInvitations(updatedInvitations);

  const membersStr = localStorage.getItem("members");
  const members: { id: number; name: string; email: string; role: string; companyId: string; createdBy: string }[] = membersStr ? JSON.parse(membersStr) : [];
  const memberExists = members.some((m) => m.email === invitation.email);
  if (!memberExists) {
    members.push({
      id: Date.now(),
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      companyId: invitation.companyId,
      createdBy: invitation.email,
    });
    localStorage.setItem("members", JSON.stringify(members));
  }

  return { success: true };
};

export const authenticateUser = (email: string, password: string): User => {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password && u.passwordSet);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  return user;
};


export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
};

export const setDefaultPasswordForUser = (email: string, companyId: string) => {
  const users = getUsers();
  const userExists = users.some((u) => u.email === email);

  if (!userExists) {
    users.push({
      email,
      password: "admin123",
      name: email.split("@")[0],
      role: "dev",
      companyId,
      passwordSet: false,
    });
    saveUsers(users);
  }

  const token = btoa(email + ":" + Date.now());
  const invitations = getInvitations();
  invitations.push({
    email,
    name: email.split("@")[0],
    role: "dev",
    token,
    companyId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  saveInvitations(invitations);

  return `${window.location.origin}/set-password/${token}`;
};

export const getAdminByOrg = (companyId: string): User | undefined => {
  const users = getUsers();
  return users.find((u) => u.companyId === companyId && u.role === "admin");
};

export const registerAdmin = (name: string, email: string, password: string, companyId: string): User => {
  const users = getUsers();
  const exists = users.some((u) => u.email === email);
  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const trimmedCompanyId = companyId.trim();
  const existingAdmin = users.find((u) => u.companyId === trimmedCompanyId && u.role === "admin");
  if (existingAdmin) {
    throw new Error("An administrator is already registered for this organization.");
  }

  const newAdmin: User = {
    email,
    password,
    name,
    role: "admin",
    companyId: trimmedCompanyId,
    passwordSet: true,
  };
  users.push(newAdmin);
  saveUsers(users);

  const membersStr = localStorage.getItem("members");
  const members: { id: number; name: string; email: string; role: string; companyId?: string; createdBy: string }[] = membersStr ? JSON.parse(membersStr) : [];
  members.push({
    id: Date.now(),
    name,
    email,
    role: "admin",
    companyId: trimmedCompanyId,
    createdBy: email,
  });
  localStorage.setItem("members", JSON.stringify(members));

  return newAdmin;
};

export const sendInvitationEmail = (to: string, link: string): void => {
  const subject = encodeURIComponent("You've been invited to Smarter Tasks");
  const body = encodeURIComponent(
    `Hello,\n\nYou have been invited to join Smarter Tasks.\n\n` +
      `Set your password here:\n${link}\n\n` +
      `If you already have a password, you can sign in directly.\n\nThanks!`
  );
  window.open(`mailto:${to}?subject=${subject}&body=${body}`);
};