export const UserRole = {
  ADMIN: "admin",
  PROJECT_MANAGER: "projectManager",
  DEV: "dev",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TaskStatus = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const RequestStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DENIED: "Denied",
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const normalizeRole = (role: string): UserRole => {
  switch (role) {
    case "admin":
    case "projectManager":
    case "dev":
      return role;
    case "project-manager":
      return UserRole.PROJECT_MANAGER;
    case "developer":
      return UserRole.DEV;
    default:
      return UserRole.DEV;
  }
};
export const STORAGE_KEYS = {
  TASKS: "tasks",
  LEAVE_REQUESTS: "leaveRequests",
  PROJECTS: "projects",
  MEMBERS: "members",
} as const;
