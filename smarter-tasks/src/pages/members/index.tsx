import { MembersProvider } from "../../context/members";
import MemberList from "./MemberList";
import NewMember from "./NewMember";
import { useAuth, type UserRole } from "../../context/auth";

const Members = () => {
  const { role } = useAuth();
  const canAddMember = role === "admin";

  return (
    <MembersProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Members</h2>
            {canAddMember && <NewMember />}
          </div>

          <div className="mt-4">
            <MemberList role={role as UserRole} />
          </div>
        </div>
      </div>
    </MembersProvider>
  );
};

export default Members;
