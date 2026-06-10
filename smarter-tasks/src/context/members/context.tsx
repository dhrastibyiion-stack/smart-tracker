import { useCallback, useEffect, useMemo, useReducer } from "react";

import { MembersContext } from "./MembersContext";
import { reducer, type Action } from "./reducer";
import { createMemberRequest, deleteMemberRequest, updateMemberRequest, refreshMembers } from "./actions";

import type { MembersContextValue } from "./MembersContext";
import type { UserRole } from "../../config/constants";

type Dispatch = (action: Action) => void;

export type { Member } from "./MembersContext";

export const MembersProvider = ({
  children,
  createdBy,
}: {
  children: React.ReactNode;
  createdBy?: string;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    members: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshMembers({ dispatch, createdBy });
  }, [dispatch, createdBy]);

  const createMember = useCallback(
    async (data: { name: string; email: string; role: UserRole; companyId: string; password: string; createdBy: string }) => {
      await createMemberRequest({
        ...data,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

const deleteMember = useCallback(
    async (id: number) => {
      await deleteMemberRequest({
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  const updateMember = useCallback(
    async (id: number, data: { name: string; email: string; role: UserRole }) => {
      await updateMemberRequest({
        ...data,
        id,
        dispatch,
        refresh,
      });
    },
    [dispatch, refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<MembersContextValue>(
    () => ({
      members: state.members,
      isLoading: state.isLoading,
      error: state.error,
      refreshMembers: refresh,
      createMember,
      deleteMember,
      updateMember,
    }),
    [createMember, deleteMember, refresh, state.error, state.isLoading, state.members]
  );

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
};
