import { useCallback, useEffect, useMemo, useReducer } from "react";

import { MembersContext } from "./MembersContext";
import { reducer, type Action } from "./reducer";
import { createMemberRequest, deleteMemberRequest, refreshMembers } from "./actions";

import type { MembersContextValue } from "./MembersContext";

type Dispatch = (action: Action) => void;

export type { Member } from "./MembersContext";

export const MembersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchBase] = useReducer(reducer, {
    members: [],
    isLoading: false,
    error: null,
  });

  const dispatch = dispatchBase as Dispatch;

  const refresh = useCallback(async () => {
    await refreshMembers({ dispatch });
  }, [dispatch]);

  const createMember = useCallback(
    async (data: { name: string; email: string; password: string }) => {
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
    }),
    [createMember, deleteMember, refresh, state.error, state.isLoading, state.members]
  );

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
};
