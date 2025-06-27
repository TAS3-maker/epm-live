import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { usePMContext } from "../../../context/PMContext";
import { Loader2, Calendar, DollarSign, Clock, Users, BriefcaseBusiness, Briefcase, CheckCircle2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from '../../../components/SectionHeader';
import {
    ClearButton,
} from "../../../AllButtons/AllButtons";

export const PMAssignedtable = () => {
    const { assignedProjects, isLoading, fetchAssignedProjects } = usePMContext();
    console.log("these are assigned projects", assignedProjects);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(6); // You can adjust this number

    const handleClearSearch = () => {
        setSearchQuery("");
        setCurrentPage(1); // Reset to first page on clear
    };

    useEffect(() => {
        fetchAssignedProjects();
    }, []);

    // Filter projects based on search query
    const filteredProjects = useMemo(() => {
        if (!assignedProjects) return [];
        return assignedProjects.filter((project) => {
            const matchesProjectName = project.project_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesClientName = project.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesProjectName || matchesClientName;
        });
    }, [assignedProjects, searchQuery]);

    // Pagination Logic
    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    // Passed to PaginationControls
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };


    const ProjectCard = ({ project }) => (
        <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative">
                {/* Decorative gradient header */}
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="p-6">

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                                {project.project_name || "N/A"}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                    {project.client?.name || "N/A"}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-full cursor-pointer hover:bg-green-100 transition-colors duration-200"
                            onClick={() => navigate(`/projectmanager/tasks/${project.id}`)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Tasks</span>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                            <div className="flex items-center mb-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Deadline</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{project.deadline || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                            <div className="flex items-center mb-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Total Hours</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{project.total_hours || "N/A"} Hours</p>
                        </div>

                        {/* Adding the budget back in assuming you want 4 details */}
                        {/* <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                             <div className="flex items-center mb-2">
                                 <DollarSign className="w-5 h-5 text-blue-500" />
                                 <p className="text-sm font-medium text-gray-600 ml-2">Budget</p>
                             </div>
                             <p className="text-lg font-bold text-gray-900">${project.budget || "0.00"}</p>
                        </div> */}
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300 mb-6">
                            <div className="flex items-center mb-2">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                <p className="text-sm font-medium text-gray-600 ml-2">Working Hours</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">{project.total_working_hours || "N/A"} Hours</p>
                        </div>

                    {/* Requirements */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                        <p className="text-sm font-medium text-gray-600 mb-2">Requirements</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{project.requirements || "N/A"}</p>
                    </div>

                    {/* Assignment Date */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Assigned: {project.assigned_by?.updated_at
                                ? new Date(project.assigned_by.updated_at).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Modified PaginationControls Component
    const PaginationControls = ({ totalPages, currentPage, handlePrevPage, handleNextPage }) => {
        if (totalPages <= 1) return null; // Don't show pagination if only one page or less

        // We assume `rolesPerPage` is not relevant here as we removed the "all" option for simplicity.
        // If you still need an 'all' option for projectsPerPage, you'd need to reintroduce a state for it.

        return (
            <div className="flex items-center justify-center mt-8 space-x-4"> {/* Increased space-x for better visual separation */}
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-md transition-colors duration-150 flex items-center shadow-md
                        ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                >
                    <ChevronLeft className="h-5 w-5 mr-2" /> Previous
                </button>

                <span className="text-md font-semibold text-gray-800 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-md transition-colors duration-150 flex items-center shadow-md
                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}
                    `}
                >
                    Next <ChevronRight className="h-5 w-5 ml-2" />
                </button>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SectionHeader icon={BriefcaseBusiness} title="Projects Assigned" subtitle="Manage and track your assigned projects" />
            <div className="max-w-7xl mx-auto p-4">
                {/* Header with Search and Clear Button */}
                <div className="flex gap-4 p-4 sticky top-0 bg-white z-10 shadow-md rounded-lg mb-8">
                  <div className="relative flex items-center w-full md:w-auto flex-grow max-w-md border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 shadow-sm">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                      <input
                          type="text"
                          className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none"
                          placeholder={`Search by project name or client name...`}
                          value={searchQuery}
                          onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setCurrentPage(1); // Reset to first page on new search
                          }}
                      />
                  </div>
                  {searchQuery && (
                          <ClearButton
                              onClick={handleClearSearch}
                              // Adjust position and size for better fit inside the input
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      )}
              </div>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-xl shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="text-lg text-gray-600">Loading projects...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentProjects.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {currentProjects.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                                <PaginationControls
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    handlePrevPage={handlePrevPage}
                                    handleNextPage={handleNextPage}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                                    <p className="text-xl font-semibold text-gray-700 mb-2">
                                        {assignedProjects?.length === 0
                                            ? "No assigned projects found"
                                            : "No matching projects found"}
                                    </p>
                                    <p className="text-gray-500">
                                        {assignedProjects?.length === 0
                                            ? "New projects will appear here when assigned"
                                            : "Try adjusting your search or clearing the filter."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PMAssignedtable;