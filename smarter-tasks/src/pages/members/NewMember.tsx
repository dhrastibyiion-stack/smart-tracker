import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMembers } from "../../context/members";
import { useAuth } from "../../context/auth";
import { UserRole, normalizeRole } from "../../config/constants";

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

const NewMember = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role: currentUserRole } = useAuth();
  const { createMember, isLoading, error, members } = useMembers();
  const { user: currentUser } = useAuth();
  const currentUserCompany =
    currentUser?.companyId ??
    members.find((m) => m.email === currentUser?.username)?.companyId ??
    members.at(0)?.companyId ??
    "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({ defaultValues: { role: UserRole.DEV } });

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await createMember({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: normalizeRole(data.role),
        companyId: currentUserCompany,
        password: data.password,
        createdBy: currentUser?.email ?? currentUser?.username ?? "",
      });
      setIsOpen(false);
      reset();
    } catch {
      // Errors are handled by context and displayed in the list
    }
  };

  return (
    <>
      <button
        id="new-member-btn"
        type="button"
        onClick={openModal}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        New Member
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create new member
                  </Dialog.Title>

                  <div className="mt-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter full name..."
                          autoFocus
                          id="name"
                          disabled={isLoading}
                          {...register("name", { required: true })}
                          className={`w-full border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline-blue ${
                            errors.name ? "border-red-500" : ""
                          }`}
                        />
                        {errors.name && (
                          <span className="text-sm text-red-600">This field is required</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="Enter email..."
                          id="email"
                          disabled={isLoading}
                          {...register("email", { required: true })}
                          className={`w-full border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline-blue ${
                            errors.email ? "border-red-500" : ""
                          }`}
                        />
                        {errors.email && (
                          <span className="text-sm text-red-600">This field is required</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">
                          Role
                        </label>
                        <select
                          id="role"
                          disabled={isLoading}
                          {...register("role", { required: true })}
                          className="w-full border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline-blue"
                        >
                          <option value={UserRole.ADMIN}>Admin</option>
                          <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                          <option value={UserRole.DEV}>Developer</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter password..."
                          id="password"
                          disabled={isLoading}
                          {...register("password", { required: true, minLength: 6 })}
                          className={`w-full border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline-blue ${
                            errors.password ? "border-red-500" : ""
                          }`}
                        />
                        {errors.password && (
                          <span className="text-sm text-red-600">At least 6 characters</span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm password..."
                          id="confirmPassword"
                          disabled={isLoading}
                          {...register("confirmPassword", { required: true, minLength: 6 })}
                          className={`w-full border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline-blue ${
                            errors.confirmPassword ? "border-red-500" : ""
                          }`}
                        />
                        {errors.confirmPassword && (
                          <span className="text-sm text-red-600">Passwords do not match or are too short</span>
                        )}
                      </div>

                      {error && <div className="text-sm text-red-600">{error}</div>}

                      <div className="mt-4 flex gap-2">
                        <button
                          type="submit"
                          id="create-member-btn"
                          disabled={isLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                          Submit
                        </button>

                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={isLoading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default NewMember;
