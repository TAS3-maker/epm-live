import React, { useEffect, useState } from "react";
import { useRole } from "../../../context/RoleContext";
import { Loader2, BarChart } from "lucide-react";
import { Role } from './Role';
import { SectionHeader } from '../../../components/SectionHeader';
import {
  CancelButton,
  YesButton,
  IconSaveButton,
  IconDeleteButton,
  IconEditButton,
  IconCancelTaskButton,
} from "../../../AllButtons/AllButtons";

export const Roletable = () => {
  const { roles, fetchRoles, deleteRole, updateRole, isLoading } = useRole();
  const [editRoleId, setEditRoleId] = useState(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteclient, setDeleteclient] = useState(null);
  const [editid, setEditid] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleEditClick = (role) => {
    setEditRoleId(role.id);
    setEditRoleName(role.name);
    setEditError("");
  };

  const handleSaveClick = async () => {
    if (!editRoleName.trim()) {
      setEditError("Role name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    const result = await updateRole(editRoleId, editRoleName);
    setIsUpdating(false);

    if (!result.success) {
      setEditError(result.errorMessage);
    } else {
      setEditError("");
      setEditRoleId(null);
    }
  };

  const handleDeleteClick = (roleId) => {
    if (deleteConfirm === roleId) {
      deleteRole(roleId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(roleId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Role Management" subtitle="View, edit and manage user roles" />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
        <div className="my-2">
          <Role />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full">
            <thead>
              <tr className="table-bg-heading table-th-tr-row">
                <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Role Name</th>
                <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-500">Loading roles...</span>
                    </div>
                  </td>
                </tr>
              ) : roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      <span className="flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                        {formatDate(role.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      {formatDate(role.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800 font-medium text-sm">
                      {editRoleId === role.id ? (
                        <div>
                          <input
                            type="text"
                            value={editRoleName}
                            onChange={(e) => {
                              setEditRoleName(e.target.value);
                              setEditError("");
                            }}
                            className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
                              editError ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                            placeholder="Enter role name"
                            autoFocus
                          />
                          {editError && (
                            <p className="text-red-500 text-sm mt-1">{editError}</p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                          {role.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {editRoleId === role.id ? (
                          <>
                            <IconSaveButton onClick={handleSaveClick} disabled={isUpdating} />
                            <IconCancelTaskButton onClick={() => {
                              setEditRoleId(null);
                              setEditError("");
                            }} />
                          </>
                        ) : (
                          <>
                            <IconEditButton onClick={() => handleEditClick(role)} />
                            <IconDeleteButton onClick={() => {
                              setEditid(role.id);
                              setDeleteclient(true);
                            }} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                      <p className="mt-1 text-sm text-gray-500">No roles have been created yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteclient && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Are you sure you want to delete this role?</h2>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Please confirm if you'd like to proceed.
            </div>
            <div className="flex justify-end gap-2 my-2">
              <CancelButton onClick={() => setDeleteclient(false)} />
              <YesButton onClick={() => {
                deleteRole(editid);
                setDeleteclient(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
