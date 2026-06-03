import { useContext } from "react";

import type { MembersContextValue } from "./MembersContext";
import { MembersContext } from "./MembersContext";

export const useMembers = (): MembersContextValue => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be used within MembersProvider");
  return ctx;
};
