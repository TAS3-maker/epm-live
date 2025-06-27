import React, { useEffect, useState, useMemo } from "react";
import { Loader2, Calendar, User, Clock, FileText, BarChart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useLeave } from "../../../context/LeaveContext";
import { SectionHeader } from '../../../components/SectionHeader';

// It's generally a good practice to define helper components outside the main component
// unless they strictly depend on the parent's internal state that changes frequently.
// Moving PaginationControls outside can sometimes help with performance/re-renders,
// though React's memoization helps mitigate this.
const PaginationControls = ({ totalPages, currentPage, handlePrevPage, handleNextPage, totalItems, leavesPerPage, setLeavesPerPage }) => {
    const showPaginationButtons = totalItems > 0 && leavesPerPage !== 'all';
    const showLeavesPerPageDropdown = totalItems > 0;

    if (totalItems === 0 && leavesPerPage === 'all') return null;

    return (
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-white sticky bottom-0 z-2">
            {showLeavesPerPageDropdown && (
                <div className="flex items-center text-sm text-gray-700">
                    Leaves per page:
                    <select
                        value={leavesPerPage}
                        onChange={(e) => {
                            setLeavesPerPage(e.target.value);
                            // currentPage reset happens in the parent useEffect
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
            )}

            {showPaginationButtons && (
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
    );
};


export const PMleaves = () => {
    const { pmleaves, pmLeavesfnc, postStatuses, loading, error } = useLeave();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [leavesPerPage, setLeavesPerPage] = useState(10);

    useEffect(() => {
        pmLeavesfnc();
    }, []);

    const filteredAndSortedLeaves = useMemo(() => {
        if (!pmleaves) return [];

        const lowercasedSearchTerm = searchTerm.toLowerCase();

        let filtered = pmleaves.filter(leave => {
            const employeeName = leave.user_name ?? '';
            const startDate = leave.start_date ?? '';
            const leaveType = leave.leave_type ?? '';
            const duration = leave.hours ? `${leave.hours} hours` : (leave.hours === 0 ? "0 hours" : "full day");
            const reason = leave.reason ?? '';
            const status = leave.status ?? '';

            const matchesSearchTerm = (
                employeeName.toLowerCase().includes(lowercasedSearchTerm) ||
                startDate.toLowerCase().includes(lowercasedSearchTerm) ||
                leaveType.toLowerCase().includes(lowercasedSearchTerm) ||
                duration.toLowerCase().includes(lowercasedSearchTerm) ||
                reason.toLowerCase().includes(lowercasedSearchTerm) ||
                status.toLowerCase().includes(lowercasedSearchTerm)
            );

            const matchesStatusFilter =
                statusFilter === "all" ||
                (status.toLowerCase() === statusFilter);

            return matchesSearchTerm && matchesStatusFilter;
        });

        return filtered;
    }, [searchTerm, statusFilter, pmleaves]);

    const totalPages = leavesPerPage === 'all' ? 1 : Math.ceil(filteredAndSortedLeaves.length / (Number(leavesPerPage) || 1));

    const currentLeaves = useMemo(() => {
        if (leavesPerPage === 'all') {
            return filteredAndSortedLeaves;
        }
        const indexOfLastLeave = currentPage * Number(leavesPerPage);
        const indexOfFirstLeave = indexOfLastLeave - Number(leavesPerPage);
        return filteredAndSortedLeaves.slice(indexOfFirstLeave, indexOfLastLeave);
    }, [filteredAndSortedLeaves, currentPage, leavesPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, leavesPerPage, statusFilter]);

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const handleStatusChange = async (id, newStatus) => {
        const updatedStatus = [{ id, status: newStatus }];
        await postStatuses(updatedStatus);
        pmLeavesfnc();
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md shadow-black/25">
            <SectionHeader icon={BarChart} title="Employee Management" subtitle="Track and manage leave requests" />
            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-auto flex-grow max-w-md">
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search all columns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-3 md:mt-0">
                    <button
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            statusFilter === "all"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            statusFilter === "pending"
                                ? "bg-yellow-500 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setStatusFilter("approved")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            statusFilter === "approved"
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter("rejected")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            statusFilter === "rejected"
                                ? "bg-red-600 text-white shadow-md"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="table-bg-heading table-th-tr-row">
                                {[
                                    { label: "Date", icon: Calendar },
                                    { label: "Employee Name", icon: User },
                                    { label: "Leave Type" },
                                    { label: "Duration", icon: Clock },
                                    { label: "Reason", icon: FileText },
                                    { label: "Status" }
                                ].map(({ label, icon: Icon }, index) => (
                                    <th key={index} className="px-4 py-2 text-center font-semibold">
                                        <div className="flex items-center justify-center gap-2">
                                            {Icon && <Icon className="h-4 w-4 text-white" />}
                                            {label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center space-x-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                            <span>Loading leave requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-red-500">
                                        Error loading data: {error.message || "Unknown error"}
                                    </td>
                                </tr>
                            ) : currentLeaves.length > 0 ? (
                                currentLeaves.map((leave) => (
                                    <tr key={leave.id || `${leave.user_name}-${leave.start_date}`}
                                        className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.start_date || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.user_name || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.leave_type || "N/A"}</td>
                                        <td className="px-4 py-4 text-center text-gray-700">
                                            {leave.hours ? `${leave.hours} Hours` : (leave.hours === 0 ? "0 Hours" : "Full Day")}
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-700">{leave.reason || "N/A"}</td>
                                        <td className="px-6 py-4 flex items-center justify-center">
                                            <select
                                                className={`px-3 py-2 border rounded-lg cursor-pointer ${
                                                    (leave.status || '').toLowerCase() === "approved" ? "bg-green-100 text-green-700 border-green-300" :
                                                    (leave.status || '').toLowerCase() === "rejected" ? "bg-red-100 text-red-700 border-red-300" :
                                                    "bg-yellow-100 text-yellow-700 border-yellow-300"
                                                }`}
                                                value={leave.status || 'Pending'}
                                                onChange={(e) => handleStatusChange(leave.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                        {(searchTerm || statusFilter !== 'all') && pmleaves && pmleaves.length > 0 ? (
                                            "No matching leave requests found with current filters."
                                        ) : (
                                            "No leave requests to display."
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pass the handlers as props here */}
            <PaginationControls
                totalPages={totalPages}
                currentPage={currentPage}
                handlePrevPage={handlePrevPage} // Pass as prop
                handleNextPage={handleNextPage} // Pass as prop
                totalItems={filteredAndSortedLeaves.length}
                leavesPerPage={leavesPerPage}
                setLeavesPerPage={setLeavesPerPage}
            />
        </div>
    );
};

export default PMleaves;