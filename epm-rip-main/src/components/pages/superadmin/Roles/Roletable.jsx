import React, { useEffect, useState, useMemo } from "react";
import { useRole } from "../../../context/RoleContext";
import { Loader2, BarChart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Role } from './Role';
import { SectionHeader } from '../../../components/SectionHeader';
import { exportToExcel } from "../../../components/excelUtils";
import {
    CancelButton,
    YesButton,
    IconSaveButton,
    IconDeleteButton,
    IconEditButton,
    IconCancelTaskButton,
    ExportButton,
    ImportButton,
    ClearButton,
} from "../../../AllButtons/AllButtons";

export const Roletable = () => {
    const { roles, fetchRoles, deleteRole, updateRole, isLoading } = useRole();
    const [editRoleId, setEditRoleId] = useState(null);
    const [editRoleName, setEditRoleName] = useState("");
    const [editError, setEditError] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    // Initialize rolesPerPage to 10 or 'all' if preferred as default
    const [rolesPerPage, setRolesPerPage] = useState(10);

    useEffect(() => {
        fetchRoles();
    }, []);

    // Filter roles based on search query
    const filteredRoles = useMemo(() => {
        return roles.filter((role) =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [roles, searchQuery]);

    // Calculate total pages and current roles for pagination
    // This logic needs to handle 'all'
    const totalPages = rolesPerPage === 'all' ? 1 : Math.ceil(filteredRoles.length / rolesPerPage);

    const currentRoles = useMemo(() => {
        if (rolesPerPage === 'all') {
            return filteredRoles;
        }
        const indexOfLastRole = currentPage * rolesPerPage;
        const indexOfFirstRole = indexOfLastRole - rolesPerPage;
        return filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
    }, [filteredRoles, currentPage, rolesPerPage]);


    // Reset current page to 1 when search query or rolesPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, rolesPerPage]);


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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
            <SectionHeader icon={BarChart} title="Role Management" subtitle="View, edit and manage user roles" />

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
                <Role />
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
                    <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                        <input
                            type="text"
                            className="w-full rounded-lg focus:outline-none py-2"
                            placeholder={`Search by Role name`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ClearButton onClick={handleClearSearch} />
                    <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} />
                    <ExportButton onClick={() => { exportToExcel(filteredRoles, "roles.xlsx"); }}
                    />
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
                            ) : currentRoles.length > 0 ? (
                                currentRoles.map((role) => (
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
                                                        <div className="relative group">
                                                            <IconSaveButton onClick={handleSaveClick} disabled={isUpdating} />
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                    whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                    opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                        Save
                                                                </span>
                                                        </div>
                                                       <div className="relative group">
                                                         <IconCancelTaskButton onClick={() => {
                                                            setEditRoleId(null);
                                                            setEditError("");
                                                        }} />
                                                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                    whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                    opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                        Cancel
                                                                </span>
                                                       </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="relative group">
                                                            <IconEditButton onClick={() => handleEditClick(role)} />
                                                                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                    whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                    opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                        Edit
                                                                </span>
                                                        </div>
                                                        <div className="relative group">
                                                         <IconDeleteButton onClick={() => {
                                                            setDeleteId(role.id);
                                                            setIsDeleted(true);
                                                        }} />
                                                         <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                    whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                    opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                        Delete
                                                        </span>
                                                        </div>
                                                        
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
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchQuery ? "No roles match your search." : "No roles have been created yet."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isDeleted && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Are you sure you want to delete this role?</h2>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                            This action cannot be undone. Please confirm if you'd like to proceed.
                        </div>
                        <div className="flex justify-end gap-2 my-2">
                            <CancelButton onClick={() => setIsDeleted(false)} />
                            <YesButton onClick={() => {
                                deleteRole(deleteId);
                                setIsDeleted(false);
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredRoles.length > 0 && ( // Show controls if there are any filtered roles
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                    {/* Items per page dropdown */}
                    <div className="flex items-center text-sm text-gray-700">
                        Roles per page:
                        <select
                            value={rolesPerPage}
                            onChange={(e) => {
                                setRolesPerPage(e.target.value); // Keep as string for 'all'
                                setCurrentPage(1); // Reset to first page on roles per page change
                            }}
                            className="ml-2 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value="all">All</option> {/* Added "All" option */}
                        </select>
                    </div>

                    {rolesPerPage !== 'all' && ( // Only show page numbers and prev/next buttons if not 'all'
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors duration-150 flex items-center`}
                            >
                                Next <ChevronRight className="h-5 w-5 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};