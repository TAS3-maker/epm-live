import React, { useState, useRef, useEffect } from "react";
import { Loader2, BriefcaseBusiness } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { useTLContext } from "../../../context/TLContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { SubmitButton } from "../../../AllButtons/AllButtons";

export const TLassign = () => {
  // Destructuring relevant states and functions from contexts
  const { assignProject, message } = useBDProjectsAssigned(); // No direct usage of projectManagers or isLoading from BDProjectsAssigned context here
  const { assignProjectToEmployees, isAssigning, assignedProjects, employees, isLoading: isProjectsLoading } = useTLContext();

  // State variables for component logic
  const [selectedEmployees, setSelectedEmployees] = useState([]); // Renamed from selectedManagers for clarity
  const [selectedProject, setSelectedProject] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false); // Renamed for clarity
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state variables for search queries
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  // Refs for managing click outside dropdowns
  const employeeDropdownRef = useRef(null); // Renamed for clarity
  const projectSelectRef = useRef(null); // Ref for the native select element for projects

  // Handler for selecting/deselecting employees
  const handleSelectionChange = (employeeId) => {
    setSelectedEmployees((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  // Effect hook to handle clicks outside the employee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || selectedEmployees.length === 0) {
      setShowMessage(true);
      return;
    }

    await assignProjectToEmployees(selectedProject, selectedEmployees);
    setSelectedProject("");
    setSelectedEmployees([]);
    setShowMessage(true); // Show success message
    setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
    setIsModalOpen(false); // Close modal after submission
  };

  // Filtered projects based on search query
  const filteredProjects = assignedProjects.filter(project =>
    project.project_name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Filtered employees based on search query
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  return (
    <div className="overflow-hidden bg-white shadow-sm">
      <SectionHeader icon={BriefcaseBusiness} title="Projects Assigned" subtitle="Manage and track your assigned projects" />

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-4 shadow-md bg-white">
        <button onClick={() => { setIsModalOpen(true); setShowMessage(false); }} className="add-items-btn">
          Assign Project
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Assign Project</h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Project Name Selection with Search and Scroll */}
              <div className="relative">
                <label className="block font-medium text-gray-700 text-sm">Project Name</label>
                <input
                  type="text"
                  placeholder="Search project..."
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                />
                <select
                  ref={projectSelectRef}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none max-h-40 overflow-y-auto"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  size={Math.min(filteredProjects.length + 1, 8)} // Display up to 8 options at once
                >
                  <option value="">Select Project</option>
                  {isProjectsLoading ? (
                    <option disabled>Loading projects...</option>
                  ) : filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <option key={project.id} value={project.id}>{project.project_name}</option>
                    ))
                  ) : (
                    <option disabled>No projects found</option>
                  )}
                </select>
              </div>

              {/* Employee Name Selection with Search and Scroll */}
              <div className="relative w-full" ref={employeeDropdownRef}>
                <label className="block font-medium text-gray-700 text-sm">Employee name</label>
                <input
                  type="text"
                  placeholder="Search employee..."
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={employeeSearchQuery}
                  onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                  onFocus={() => setIsEmployeeDropdownOpen(true)} // Open dropdown on focus
                />
                <button
                  type="button"
                  className="w-full text-left p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 mt-1"
                  onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                >
                  {selectedEmployees.length > 0
                    ? selectedEmployees.map(id => employees.find(emp => emp.id === id)?.name).join(", ")
                    : "Select Employees"}
                </button>

                {isEmployeeDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {isProjectsLoading ? ( // Use isProjectsLoading from TLContext for employees
                      <p className="p-2 text-gray-500">Loading...</p>
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className={`cursor-pointer p-2 hover:bg-blue-100 flex items-center ${selectedEmployees.includes(employee.id) ? "bg-blue-200" : ""
                            }`}
                          onClick={() => handleSelectionChange(employee.id)}
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedEmployees.includes(employee.id)}
                            readOnly
                          />
                          {employee.name}
                        </div>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500">No employees found</p>
                    )}
                  </div>
                )}
              </div>

              {/* {showMessage && (
                <div className="mt-4 p-3 rounded-md text-sm font-medium text-center bg-green-50 text-green-800 border border-green-300">
                  Project assigned successfully!
                </div>
              )} */}
              <SubmitButton type="submit" />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};