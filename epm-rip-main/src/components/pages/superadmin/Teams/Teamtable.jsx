import React, { useEffect, useState, useMemo } from "react";
import { useTeam } from "../../../context/TeamContext";
import { Loader2, BarChart, Search, ChevronLeft, ChevronRight } from "lucide-react"; // Import Search icon
import { exportToExcel } from "../../../components/excelUtils";
import { Teams } from "./Teams";
import {
    ExportButton,
    CancelButton,
    YesButton,
    IconSaveButton,
    IconDeleteButton,
    IconEditButton,
    IconCancelTaskButton,
    ClearButton,
    ImportButton, // Assuming you have a ClearButton component as well
} from "../../../AllButtons/AllButtons";
import { SectionHeader } from "../../../components/SectionHeader";

export const Teamtable = () => {
    const { teams, fetchTeams, deleteTeam, updateTeam, isLoading } = useTeam();
    const [editingTeam, setEditingTeam] = useState(null);
    const [newName, setNewName] = useState("");
    const [editError, setEditError] = useState(""); // For inline error
    const [deleteClientId, setDeleteClientId] = useState(null); // Renamed for clarity
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [showImportOptions, setShowImportOptions] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    // Initialize rolesPerPage to 10 or 'all' if preferred as default
    const [teamsPerPage, setTeamsPerPage] = useState(10);

    useEffect(() => {
        fetchTeams();
    }, []);

    // Effect to filter teams based on search query
    useEffect(() => {
        setFilteredTeams(
            teams.filter((team) =>
                team.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [teams, searchQuery]);

    const handleEdit = (team) => {
        setEditingTeam(team.id);
        setNewName(team.name);
        setEditError("");
    };

    const handleUpdate = async (teamId) => {
        if (!newName.trim()) {
            setEditError("Team name is required.");
            return;
        }

        const result = await updateTeam(teamId, newName);

        if (result.success) {
            setEditingTeam(null);
            setEditError("");
        } else {
            setEditError(result.errorMessage || "Failed to update team.");
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

    const filteredteams = useMemo(() => {
        return teams.filter((team) =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [teams, searchQuery]);

    // Calculate total pages and current roles for pagination
    // This logic needs to handle 'all'
    const totalPages = teamsPerPage === 'all' ? 1 : Math.ceil(filteredteams.length / teamsPerPage);

    const currentTeams = useMemo(() => {
        if (teamsPerPage === 'all') {
            return filteredteams;
        }
        const indexOfLastRole = currentPage * teamsPerPage;
        const indexOfFirstRole = indexOfLastRole - teamsPerPage;
        return filteredteams.slice(indexOfFirstRole, indexOfLastRole);
    }, [filteredteams, currentPage, teamsPerPage]);


    // Reset current page to 1 when search query or rolesPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, teamsPerPage]);

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
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
            <SectionHeader icon={BarChart} title="Team Management" subtitle="Manage teams and update details" />

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
                <Teams />
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
                    <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                        <input
                            type="text"
                            className="w-full rounded-lg focus:outline-none py-2"
                            placeholder={`Search by Team name`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ClearButton onClick={handleClearSearch} />
                    <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} />
                    <ExportButton onClick={() => exportToExcel(filteredTeams, "teams.xlsx")} />
                </div>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="table-bg-heading table-th-tr-row">
                            <th className="px-4 py-2 text-center">Created Date</th>
                            <th className="px-4 py-2 text-center">Updated Date</th>
                            <th className="px-4 py-2 text-center">Team Name</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                                    <Loader2 className="h-5 w-5 animate-spin inline-block" /> Loading teams...
                                </td>
                            </tr>
                        ) : currentTeams.length === 0 ? ( // Corrected this line
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="rounded-full bg-gray-100 p-3 mb-2">
                                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchQuery ? "No teams match your search criteria." : "No teams have been created yet."}
                                        </p>
                                    </div>
                                </td>
                            </tr>

                        ) : (
                            currentTeams.map((team) => (
                                <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-700 text-center">{formatDate(team.created_at)}</td>
                                    <td className="px-4 py-3 text-gray-700 text-center">{formatDate(team.updated_at)}</td>
                                    <td className="px-4 py-3 text-gray-700 text-center">
                                        {editingTeam === team.id ? (
                                            <div className="flex flex-col items-center">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => {
                                                        setNewName(e.target.value);
                                                        setEditError("");
                                                    }}
                                                    className={`border p-1 rounded-md focus:outline-none focus:ring-2 w-56 ${
                                                        editError ? "border-red-500 ring-red-400" : "border-gray-300 focus:ring-blue-500"
                                                    }`}
                                                    autoFocus
                                                />
                                                {editError && (
                                                    <span className="text-red-500 text-xs mt-1">{editError}</span>
                                                )}
                                            </div>
                                        ) : (
                                            team.name
                                        )}
                                    </td>
                                    <td className="px-4 py-3 flex items-center justify-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {editingTeam === team.id ? (
                                                <>
                                                         <div className="relative group">
                                                            <IconSaveButton onClick={() => handleUpdate(team.id)} />
                                                             <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                    Save
                                                            </span>
                                                        </div>

                                                        <div className="relative group">
                                                             <div className="relative group">
                                                               <IconCancelTaskButton
                                                                    onClick={() => {
                                                                        setEditingTeam(null);
                                                                        setEditError("");
                                                                    }}
                                                                />
                                                             <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded
                                                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                    Cancel
                                                            </span>
                                                        </div>
                                                        </div>
                                                </>
                                            ) : (
                                                <>
                                                        <div className="relative group">
                                                            <IconEditButton onClick={() => handleEdit(team)} />
                                                             <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                                    Edit
                                                            </span>
                                                        </div>

                                                        <div className="relative group">
                                                                <IconDeleteButton onClick={() => { setDeleteClientId(team.id); }} />
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
                        )}
                    </tbody>
                </table>
            </div>

            {deleteClientId && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
                    role="dialog"
                    aria-labelledby="deleteModalLabel"
                    aria-describedby="deleteModalDescription"
                >
                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
                        <h2 id="deleteModalLabel" className="text-lg font-semibold mb-4">
                            Are you sure you want to delete this team?
                        </h2>
                        <p id="deleteModalDescription" className="text-sm text-gray-600 mb-4">
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <CancelButton onClick={() => setDeleteClientId(false)} />
                            <YesButton onClick={() => {
                                deleteTeam(deleteClientId); // Use deleteClientId here
                                setDeleteClientId(false);
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredTeams.length > 0 && ( // Show controls if there are any filtered roles
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                    {/* Items per page dropdown */}
                    <div className="flex items-center text-sm text-gray-700">
                        Teams per page: {/* Changed 'Roles per page' to 'Teams per page' */}
                        <select
                            value={teamsPerPage}
                            onChange={(e) => {
                                setTeamsPerPage(e.target.value); // Keep as string for 'all'
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

                    {teamsPerPage !== 'all' && ( // Only show page numbers and prev/next buttons if not 'all'
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