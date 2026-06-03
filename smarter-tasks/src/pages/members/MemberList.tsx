import { useMembers } from "../../context/members";
import MemberListItems from "./MemberListItems";
import type { UserRole } from "../../context/auth";

type Props = {
  role: UserRole;
};

const MemberList = ({ role }: Props) => {
  const { members, isLoading, error, deleteMember } = useMembers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <MemberListItems
          key={member.id}
          member={member}
          onDelete={deleteMember}
          role={role}
        />
      ))}
      {members.length === 0 && (
        <li className="text-gray-500">No members yet.</li>
      )}
    </ul>
  );
};

export default MemberList;
