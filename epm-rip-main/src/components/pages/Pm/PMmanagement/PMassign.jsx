import React, { useState, useRef, useEffect } from "react";
import { Loader2, BriefcaseBusiness } from "lucide-react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { usePMContext } from "../../../context/PMContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { SubmitButton } from "../../../AllButtons/AllButtons"; // Assuming SubmitButton is the only one needed here


export const PMassign = () => {
  const { projectManagers, isLoading, assignProject, message } = useBDProjectsAssigned();
  const { assignProjectToTl, isAssigning, assignedProjects, teamleaders, isLoading: isProjectsLoading } = usePMContext();
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState(""); // New state for project search
  const [teamLeaderSearchQuery, setTeamLeaderSearchQuery] = useState(""); // New state for team leader search

  const dropdownRef = useRef(null);
  const projectDropdownRef = useRef(null); // Ref for project dropdown

  const handleSelectionChange = (employeeId) => {
    setSelectedManagers((prevSelected) =>
      prevSelected.includes(employeeId)
        ? prevSelected.filter((id) => id !== employeeId)
        : [...prevSelected, employeeId]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Close project dropdown if clicked outside
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target) && event.target.tagName !== 'SELECT') {
        // We'll manage project dropdown visibility slightly differently for native select,
        // but this ensures consistency if you switch to a custom dropdown for projects later.
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProject || selectedManagers.length === 0) {
      setShowMessage(true);
      return;
    }

    await assignProjectToTl(selectedProject, selectedManagers);
    setSelectedProject("");
    setSelectedManagers([]);
    setShowMessage(true); // Show success message
    setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
    setIsModalOpen(false); // Close modal after submission
  };

  // Filtered projects based on search query
  const filteredProjects = assignedProjects.filter(project =>
    project.project_name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  // Filtered team leaders based on search query
  const filteredTeamLeaders = teamleaders.filter(employee =>
    employee.name.toLowerCase().includes(teamLeaderSearchQuery.toLowerCase())
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
              <div className="relative" ref={projectDropdownRef}>
                <label className="block font-medium text-gray-700 text-sm">Project Name</label>
                <input
                  type="text"
                  placeholder="Search project..."
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                />
                <select
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none max-h-40 overflow-y-auto" // Added max-h and overflow
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  size={Math.min(filteredProjects.length + 1, 8)} // Show more options without scrolling if few
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

              <div className="relative w-full" ref={dropdownRef}>
                <label className="block font-medium text-gray-700 text-sm">Team leader</label>
                <input
                  type="text"
                  placeholder="Search team leader..."
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={teamLeaderSearchQuery}
                  onChange={(e) => setTeamLeaderSearchQuery(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
                />
                <button
                  type="button"
                  className="w-full text-left p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 mt-1"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedManagers.length > 0
                    ? selectedManagers.map(id => teamleaders.find(emp => emp.id === id)?.name).join(", ")
                    : "Select Team Leaders"}
                </button>

                {isDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto z-10">
                    {isLoading ? (
                      <p className="p-2 text-gray-500">Loading...</p>
                    ) : filteredTeamLeaders.length > 0 ? (
                      filteredTeamLeaders.map((employee) => (
                        <div
                          key={employee.id}
                          className={`cursor-pointer p-2 hover:bg-blue-100 flex items-center ${selectedManagers.includes(employee.id) ? "bg-blue-200" : ""
                            }`}
                          onClick={() => handleSelectionChange(employee.id)}
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedManagers.includes(employee.id)}
                            readOnly
                          />
                          {employee.name}
                        </div>
                      ))
                    ) : (
                      <p className="p-2 text-gray-500">No team leaders found</p>
                    )}
                  </div>
                )}
              </div>
              {showMessage && (
                <div className="mt-4 p-3 rounded-md text-sm font-medium text-center bg-green-50 text-green-800 border border-green-300">
                  Project assigned successfully!
                </div>
              )}
              <SubmitButton type="submit" />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};