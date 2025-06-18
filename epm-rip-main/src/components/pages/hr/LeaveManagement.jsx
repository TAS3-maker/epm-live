import React, { useEffect, useState, useCallback } from "react"; // Add useCallback
import { Loader2, Calendar, User, Clock, FileText, BarChart, Search, CheckCircle, XCircle, Pencil } from "lucide-react";
import { useLeave } from "../../context/LeaveContext";
import { SectionHeader } from '../../components/SectionHeader';
import { IconApproveButton, IconRejectButton, IconEditButton } from "../../../components/AllButtons/AllButtons";


export const LeaveManagement = () => {
    // Destructure properties from your LeaveContext
    const { hrLeaveDetails, hrLeave, postStatuses, loading, error } = useLeave();
    
    // State for search input
    const [searchTerm, setSearchTerm] = useState("");
    
    // State for filtering by status: "All", "Pending", "Approved", "Rejected"
    const [filterStatus, setFilterStatus] = useState("All"); 
    
    // State to hold the data after applying search and status filters
    const [filteredData, setFilteredData] = useState([]);
    
    // State to manage edit mode for each leave request
    const [editMode, setEditMode] = useState({});

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(11);

    // Fetch leave details on component mount
    useEffect(() => {
        hrLeaveDetails();
    }, []);

    // Memoize the filter function to prevent unnecessary re-renders
    const applyFilters = useCallback(() => {
        let currentFilteredData = hrLeave;

        // Apply search term filter
        if (searchTerm) {
            currentFilteredData = currentFilteredData.filter(leave =>
                leave.user_name && leave.user_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filterStatus !== "All") {
            currentFilteredData = currentFilteredData.filter(leave =>
                leave.status === filterStatus
            );
        }
        
        setFilteredData(currentFilteredData);
        setCurrentPage(1); // Reset to first page whenever filters change
    }, [searchTerm, filterStatus, hrLeave]); // Dependencies for useCallback

    // Run filter function whenever searchTerm, filterStatus, or hrLeave changes
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);


    const handleStatusChange = async (id, newStatus) => {
        // Ensure that only the relevant status update is sent
        const updatedStatus = [{ id, status: newStatus }];
        await postStatuses(updatedStatus); // Call context function to update status
        setEditMode((prev) => ({ ...prev, [id]: false })); // Exit edit mode for this specific row
    };

    const toggleEditMode = (id) => {
        setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Data to display based on current filters and pagination
    const dataToDisplay = filteredData; // filteredData already contains all necessary filters
    const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = dataToDisplay.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
            <SectionHeader icon={BarChart} title="Leave Management" subtitle="View and manage employee leave requests" />
            
            {/* Search and Filter Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
                {/* Search Input */}
                <div className="flex items-center w-full max-w-md border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                    <Search className="h-5 w-5 text-gray-400 mr-[5px]" />
                    <input
                        type="text"
                        className="w-full rounded-lg focus:outline-none py-2"
                        placeholder="Search by Employee Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "All" ? "border-black bg-black text-white" : "border-black text-black hover:bg-black hover:text-white"
                        }`}
                        onClick={() => setFilterStatus("All")}
                    >
                        All
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Pending" ? "border-yellow-500 bg-yellow-500 text-white" : "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                        }`}
                        onClick={() => setFilterStatus("Pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Approved" ? "border-green-500 bg-green-500 text-white" : "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        }`}
                        onClick={() => setFilterStatus("Approved")}
                    >
                        Approved
                    </button>
                    <button
                        className={`p-2 border rounded-lg ${
                            filterStatus === "Rejected" ? "border-red-500 bg-red-500 text-white" : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        }`}
                        onClick={() => setFilterStatus("Rejected")}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="table-th-tr-row table-bg-heading">
                                {["Date", "Employee Name", "Leave Type", "Duration", "Reason", "Status"].map((label, index) => (
                                    <th key={index} className="px-4 py-2 text-center font-semibold">{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                            <span className="text-gray-500">Loading leave requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? ( // Display error message from context
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-red-500">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : currentData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="rounded-full bg-gray-100 p-3">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {searchTerm || filterStatus !== "All"
                                                    ? "No matching leave requests found for your search/filter."
                                                    : "No leave requests have been submitted yet."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentData.map((leave, index) => (
                                    <tr key={leave.id} className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                                        <td className="px-6 py-4 text-center text-gray-700">{leave.start_date}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{leave.user_name}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{leave.leave_type}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{leave.hours ? `${leave.hours} Hours` : "Full Day"}</td>
                                        <td className="px-6 py-4 text-center text-gray-700">{leave.reason}</td>
                                        <td className="px-6 py-4 flex items-center justify-center text-center">
                                            {editMode[leave.id] ? (
                                                <div className="flex items-center gap-4">
                                                    <IconApproveButton onClick={() => handleStatusChange(leave.id, "Approved")} />
                                                    <IconRejectButton onClick={() => handleStatusChange(leave.id, "Rejected")} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    {/* Display status icon based on the current status */}
                                                    {leave.status === "Approved" && <CheckCircle className="text-green-500 h-7 w-7" />}
                                                    {leave.status === "Rejected" && <XCircle className="text-red-500 h-7 w-7" />}
                                                    {leave.status === "Pending" && <Clock className="text-yellow-500 h-7 w-7" />}
                                                    
                                                    {/* Edit button to toggle edit mode */}
                                                    <IconEditButton onClick={() => toggleEditMode(leave.id)} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 py-4">
                            <button
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`px-3 py-1 rounded ${currentPage === page
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};