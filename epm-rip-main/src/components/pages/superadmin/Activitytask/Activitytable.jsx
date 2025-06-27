import React, { useEffect, useState, useMemo } from "react";
import { useActivity } from "../../../context/ActivityContext";
import { Edit, Save, Trash2, Loader2, BarChart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
    ExportButton,
    CancelButton,
    YesButton,
    IconSaveButton,
    IconDeleteButton,
    IconEditButton,
    IconCancelTaskButton,
    ClearButton,
    ImportButton,
} from "../../../AllButtons/AllButtons";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { Activity } from "./Activity"; // Assuming this is for adding new tags
import { useAlert } from "../../../context/AlertContext";


export const Activitytable = () => {
    const [isUpdating, setIsUpdating] = useState(false); // Local loading state for updates
    const [deleteclient, setDeleteclient] = useState(false); // Modal visibility for delete
    const [editid, setEditid] = useState(null); // ID of the tag currently being edited
    const [deleteid, setDeleteid] = useState(null); // ID of the tag to be deleted
    const [newTagName, setNewTagName] = useState(""); // State for the edited tag name
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [showImportOptions, setShowImportOptions] = useState(false); // For import button (logic not implemented)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Renamed from teamsPerPage for generality

    const { showAlert } = useAlert();

    const {
        getActivityTags,
        activityTags,
        loading,
        updateActivityTag,
        deleteTagActivity,
        validationErrors,
        setValidationErrors
    } = useActivity();

    useEffect(() => {
        getActivityTags();
    }, []);

    // Memoized filtered and paginated activity tags
    const filteredActivityTags = useMemo(() => {
        return activityTags.filter((tag) =>
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activityTags, searchQuery]);

    const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredActivityTags.length / itemsPerPage);

    const currentActivityTags = useMemo(() => {
        if (itemsPerPage === 'all') {
            return filteredActivityTags;
        }
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredActivityTags.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredActivityTags, currentPage, itemsPerPage]);

    // Reset current page to 1 when search query or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);


    // Function to handle entering edit mode
    const handleEditClick = (tag) => {
        setEditid(tag.id); // Set the ID of the tag being edited
        setNewTagName(tag.name); // Populate the input with the current tag name
        setValidationErrors({}); // **Crucial:** Clear any previous validation errors when starting a new edit
    };

    const handleUpdateTag = async (id) => {
        // Client-side validation: if the input is empty, set a validation error for 'name'.
        if (!newTagName.trim()) {
            setValidationErrors(prev => ({ ...prev, name: ["Activity tag name cannot be empty."] }));
            return; // Stop the update process
        }

        setIsUpdating(true); // Set local loading state for this specific update operation

        try {
            await updateActivityTag(id, newTagName);

            // After `updateActivityTag` completes, check if there are any validation errors for 'name'.
            // If there are none, it implies the update was successful.
            if (!validationErrors.name) { // This check might be slightly delayed if `updateActivityTag` is async and `validationErrors` isn't immediately updated. A better approach would be for `updateActivityTag` to return a success boolean.
                setNewTagName(""); // Reset input field after successful update
                setEditid(null); // Exit edit mode after successful update
                setValidationErrors({}); // Clear validation errors upon successful completion
            }
        } catch (error) {
            console.error("Error during tag update in component:", error);
        } finally {
            setIsUpdating(false); // Always reset loading state
        }
    };

    const handleCancelEdit = () => {
        setEditid(null); // Exit edit mode
        setNewTagName(""); // Clear the input field
        setValidationErrors({}); // Clear any validation errors for the edited field
    };

    const handleConfirmDelete = async () => {
        setIsUpdating(true); // Use isUpdating for delete operation as well
        try {
            if (deleteid) {
                await deleteTagActivity(deleteid); // Call delete API (context handles alert)
                setDeleteclient(false); // Close modal
                setDeleteid(null); // Reset the delete id
            } else {
                showAlert({ variant: "error", title: "Error", message: "No tag selected for deletion." });
            }
        } catch (error) {
            console.error("Failed to delete tag activity", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
            <SectionHeader icon={BarChart} title="Activity Tags Management" subtitle="Manage activity tags and update details" />
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
                <Activity /> {/* Assuming this is for adding new tags */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
                    <div className="flex items-center w-full border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                        <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                        <input
                            type="text"
                            className="w-full rounded-lg focus:outline-none py-2"
                            placeholder="Search by Tag name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ClearButton onClick={handleClearSearch} />
                    <ImportButton onClick={() => setShowImportOptions(!showImportOptions)} />
                    <ExportButton onClick={() => exportToExcel(filteredActivityTags, "ActivityTags.xlsx")} />
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[1102px]">
                    <table className="w-full">
                        <thead>
                            <tr className="table-bg-heading table-th-tr-row">
                                <th className="px-4 py-2 font-medium text-center text-sm">Created Date</th>
                                <th className="px-4 py-2 font-medium text-center text-sm">Updated Date</th>
                                <th className="px-4 py-2 font-medium text-center text-sm">Tag Name</th>
                                <th className="px-4 py-2 font-medium text-center text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && !activityTags.length ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                            <span className="text-gray-500">Loading tags...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentActivityTags.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-gray-100 p-3">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Tags found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchQuery ? "No tags match your search criteria." : "No tags have been created yet."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentActivityTags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 text-center text-gray-600 text-sm">
                                            <span className="flex items-center justify-center">
                                                {/* <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span> */}
                                                {formatDate(tag.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600 text-sm">
                                            {formatDate(tag.updated_at)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-800 font-medium text-sm">
                                            {editid === tag.id ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
                                                            validationErrors.name ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                                        }`}
                                                        value={newTagName}
                                                        onChange={(e) => {
                                                            setNewTagName(e.target.value);
                                                            setValidationErrors(prev => {
                                                                const newErrs = { ...prev };
                                                                delete newErrs.name;
                                                                return newErrs;
                                                            });
                                                        }}
                                                        autoFocus
                                                    />
                                                    {validationErrors.name && (
                                                        <p className="text-red-500 text-xs mt-1">{validationErrors.name[0]}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                                                    {tag.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {editid === tag.id ? (
                                                    <>
                                                    <div className="relative group">
                                                        <IconSaveButton onClick={() => handleUpdateTag(tag.id)} disabled={isUpdating}/>
                                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                        Save
                                                        </span>
                                                    </div>
                                                        
                                                            <div className="relative group">
                                                                <IconCancelTaskButton onClick={handleCancelEdit} />
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
                                                        <IconEditButton onClick={() => handleEditClick(tag)} />
                                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                                                                        whitespace-nowrap bg-white text-black text-sm px-2 py-1 rounded 
                                                                        opacity-0 group-hover:opacity-100 transition pointer-events-none shadow">
                                                        Edit
                                                        </span>
                                                    </div>
                                                        
                                                    <div className="relative group">
                                                        <IconDeleteButton onClick={() => {setDeleteclient(true); setDeleteid(tag.id);}}/>
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
            </div>

            {deleteclient && (
                <div
                    className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
                    role="dialog"
                    aria-labelledby="deleteModalLabel"
                    aria-describedby="deleteModalDescription"
                >
                    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full m-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 id="deleteModalLabel" className="text-lg font-semibold">
                                Are you sure you want to delete this Activity?
                            </h2>
                        </div>
                        <div id="deleteModalDescription" className="text-sm text-gray-600 mb-4">
                            This action cannot be undone. Please confirm if you'd like to proceed.
                        </div>
                        <div className="flex justify-end gap-2 my-2">
                            <CancelButton onClick={() => { setDeleteclient(false); setDeleteid(null); }} />
                            <YesButton onClick={handleConfirmDelete} />
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {filteredActivityTags.length > 0 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
                    <div className="flex items-center text-sm text-gray-700">
                        Items per page:
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="ml-2 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value="all">All</option>
                        </select>
                    </div>

                    {itemsPerPage !== 'all' && (
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