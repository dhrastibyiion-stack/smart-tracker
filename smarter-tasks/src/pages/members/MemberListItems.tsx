import type { Member } from "../../context/members";

type MemberListItemsProps = {
  member: Member;
  onDelete: (id: number) => void;
  role: string; // UserRole
};

const MemberListItems = ({ member, onDelete, role }: MemberListItemsProps) => {
  const canDelete = role === "admin";

  return (
    <li className="member rounded-md border border-gray-200 px-3 py-2 text-gray-800 flex justify-between items-center">
      <div>
        <p className="font-semibold">{member.name}</p>
        <p className="text-sm text-gray-600">{member.email}</p>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(member.id)}
          className="text-red-600 hover:text-red-700"
          aria-label={`Delete ${member.name}`}
        >
          &times;
        </button>
      )}
    </li>
  );
};

export default MemberListItems;
