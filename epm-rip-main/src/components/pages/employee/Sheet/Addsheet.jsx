import React, { useState, useEffect } from 'react';
import { Clock, Briefcase, ClipboardList, Home, FileText, Save, Trash2, Edit,Calendar } from 'lucide-react';
import { useUserContext } from "../../../context/UserContext";
import { SectionHeader } from '../../../components/SectionHeader';
import { useAlert } from "../../../context/AlertContext";
const Addsheet = () => {

  const { submitEntriesForApproval } = useUserContext();
  const [submitting, setSubmitting] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  // const [view, setView] = useState('dashboard');
  // const [rows, setRows] = useState([]);
  // const [projects, setProjects] = useState([]);
  // const [standups, setStandups] = useState([]);
  // const [users, setUsers] = useState([]);
  // const [profileName, setProfileName] = useState('');
  const { userProjects, loading, error } = useUserContext();
  // const [selectedProject, setSelectedProject] = useState("");
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();

  // console.log("projects mounted", userProjects);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    // date: "",
    projectId: "",
    hoursSpent: "",
    billingStatus: "",
    status: "WFO",
    notes: "",
    project_type: "",
    project_type_status: "",
  });

  const [savedEntries, setSavedEntries] = useState([]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "hoursSpent") {
      value = formatTime(value);
    }

    if (name === "projectId") {
      const selectedProject = userProjects.data.find(project => project.id === parseInt(value));

      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      }
    }

    if (name === "billingStatus") {
      const selectedTag = tags.find(tag => tag.id.toString() === value);
      if (selectedTag) {
        value = selectedTag.id;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleEdit = (index, field, value) => {
    const updatedEntries = [...savedEntries];

    if (field === "projectId") {
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(value)
      );
      if (selectedProject) {
        // Set the tags for the selected project
        updatedEntries[index] = {
          ...updatedEntries[index],
          [field]: value,
          tags_activitys: selectedProject.tags_activitys,
        };
      }
    } else {
      // If field is "billingStatus", convert tag ID to tag name
      if (field === "billingStatus") {
        const selectedTag = tags.find(tag => tag.id.toString() === value);
        if (selectedTag) {
          value = selectedTag.id;
        }
      }

      updatedEntries[index] = {
        ...updatedEntries[index],
        [field]: field === "hoursSpent" ? formatTime(value) : value,
      };
    }

    setSavedEntries(updatedEntries);
    console.log("Updated savedEntries:", updatedEntries);
  };






  const handleDelete = (index) => {
    const updatedEntries = savedEntries.filter((_, i) => i !== index);
    setSavedEntries(updatedEntries);
    console.log("these are saved entries", savedEntries);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    console.log("these are saved entries", savedEntries);
  };

  const handleSaveClick = () => {
    // Convert the billingStatus ID to name in savedEntries
    const updatedEntries = savedEntries.map((entry) => {
      const selectedTag = tags.find(tag => tag.id === entry.billingStatus);
      return {
        ...entry,
        billingStatus: selectedTag ? selectedTag.name : entry.billingStatus, // If tag is found, use the name, else leave the ID
      };
    });

    // Now set the updated entries with the tag name for billingStatus
    setSavedEntries(updatedEntries);

    setEditIndex(null);
    console.log("These are saved entries with tag names:", updatedEntries);
  };


  const handleSave = () => {
    if (!formData.date || !formData.projectId || !formData.hoursSpent) {
      // alert("Please fill all required fields before saving.");
      showAlert({ variant: "warning", title: "Warning", message: "Please fill all required fields before saving." });
      return;
    }
    console.log("Billing Status ID:", formData.billingStatus);

    console.log("Before saving - hoursSpent:", formData.hoursSpent);
    console.log("Tags array:", tags);

    const selectedTag = tags.find(tag => tag.id.toString() === formData.billingStatus.toString());

    // Log the result of the tag lookup
    console.log("Selected Tag:", selectedTag);
    const tagName = selectedTag ? selectedTag.name : "";
    const newEntry = {
      ...formData,
      billingStatus: tagName,
      hoursSpent: formData.hoursSpent,
    };

    setSavedEntries((prevEntries) => [...prevEntries, newEntry]);
    console.log("After saving - savedEntries:", [...savedEntries, newEntry]);

    setFormData({
      // date: new Date().toISOString().split("T")[0],
      date: "",
      projectId: "",
      hoursSpent: "",
      billingStatus: "",
      status: "",
      notes: "",
    });
  };


  const formatTime = (time) => {
    if (!time || typeof time !== "string") return "00:00";
    time = time.replace(/[^0-9:]/g, "");
    const parts = time.split(":");

    if (parts.length === 2) {
      const [hh, mm] = parts;
      const hours = hh.padStart(2, "0").slice(0, 2);
      const minutes = mm.padStart(2, "0").slice(0, 2);
      return `${hours}:${minutes}`;
    }
    const numeric = time.replace(/:/g, "");
    if (numeric.length === 4) {
      const hours = numeric.slice(0, 2);
      const minutes = numeric.slice(2);
      return `${hours}:${minutes}`;
    }
    return time;
  };



  const handleSubmit = async () => {
    if (!savedEntries.length) return;

    const formattedEntries = {
      data: savedEntries.map((entry) => ({
        project_id: entry.projectId,
        date: entry.date,
        time: entry.hoursSpent, // Ensure correct value is stored
        work_type: entry.status,
        activity_type: entry.billingStatus,
        narration: entry.notes,
        project_type: entry.project_type,
        project_type_status: entry.project_type_status,
      })),
    };

    console.log("Final data before submission:", formattedEntries); // Check if it's correct

    setSubmitting(true);
    try {
      await submitEntriesForApproval(formattedEntries);
      // alert("Entries submitted for approval successfully!");
      showAlert({ variant: "success", title: "Success", message: "Entries submitted for approval successfully!" });
    } catch (error) {
      alert("Failed to submit entries for approval.");
      showAlert({ variant: "error", title: "Error", message: "Failed to submit entries for approval." });
    } finally {
      setSubmitting(false);
    }
  };

  console.log("Saved entries before submission:", savedEntries);

  return (
    <>
      <div className=" min-h-screen min-w-full overflow-hidden">
        {/* Date Section */}
        <SectionHeader icon={ClipboardList} title="Daily Timesheet" subtitle="Employee Daily Timesheet" />
        {/* <div className="flex items-start justify-between">
          <div><h2 className="text-4xl font-bold text-gray-800">Daily Timesheet</h2></div>
          
        </div> */}
        {/* Timesheet Form */}
        <div className="p-3 ml-0 border min-w-full sm:min-w-[600px] rounded-lg shadow-xl mb-5 lg:mb-0">
          <div className="flex items-center justify-center mb-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Daily Timesheet</h2>
          </div>

          <form className="space-y-6">
            {/* Project and Time Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} // Corrected line
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
                  // readOnly
                />
              </div>
              <div className="relative">
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  Project Name
                </label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">Select Project</option>
                  {loading && <option disabled>Loading...</option>}
                  {error && <option disabled>Error loading projects</option>}
                  {Array.isArray(userProjects?.data) && userProjects.data.length > 0 ? (
                    userProjects.data.map((project) => (
                      <option key={project.id} value={project.id}>{project.project_name}</option>
                    ))
                  ) : (
                    !loading && !error && <option disabled>No projects found</option>
                  )}
                </select>
              </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="hoursSpent" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  Time Spent
                </label>
                <input
                  type="text"
                  id="hoursSpent"
                  name="hoursSpent"
                  value={formData.hoursSpent}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9:]/g, "");

                    if (value.length === 2 && !value.includes(":")) {
                      value = value + ":";
                    }

                    if (value.length > 5) {
                      return;
                    }

                    setFormData((prev) => ({ ...prev, hoursSpent: value }));
                  }}
                  className="w-full !text-left px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-center"
                  placeholder="HH:MM"
                  maxLength={5}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
                    const isNumber = /^[0-9]$/.test(e.key);
                    const isColon = e.key === ":";

                    if (!isNumber && !isColon && !allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }

                    if (e.target.value.length === 2 && e.key !== "Backspace" && !e.target.value.includes(":")) {
                      e.target.value += ":";
                    }
                  }}
                />
              </div>
              <div className="relative">
                <label htmlFor="billingStatus" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Action
                </label>
                <select
                  id="billingStatus"
                  name="billingStatus"
                  value={formData.billingStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >

                  <option value="">--Select--</option>
                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <option key={index} value={tag.id}>{tag.name}</option> // Display tag name from the tags_activitys array
                    ))
                  ) : (
                    <option disabled>No tags available</option>
                  )}
                </select>
              </div>
             </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Work Type
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="WFO">Work From Office</option>
                  <option value="WFH">Work from Home</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ClipboardList className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative col-span-2">
                <label htmlFor="project_type_status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Home className="w-4 h-4 mr-2 text-gray-400" />
                  Project Type Status
                </label>
                <select
                  id="project_type_status"
                  name="project_type_status"
                  value={formData.project_type_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out appearance-none bg-white"
                >
                  <option value="">--Select--</option>
                  <option value="Offline">Offline</option>
                  {formData.project_type === "Hourly" && <option value="Tracker">Tracker</option>}
                </select>

              </div>
            </div>

            <div className="relative">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                Narration
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                placeholder="Enter your notes here"
              ></textarea>
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="submit-btn"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Timesheet
              </button>
            </div>
          </form>
        </div>
        {/* Timesheet Table */}
        <div className="min-w-screen ml-0 lg:mb-32 rounded">
          <div className="overflow-x-auto">
            {/* Display Saved Entries */}
            {savedEntries.length > 0 && (
              <div className="mt-4 bg-white rounded-xl shadow-lg animate-fadeIn border border-[#d3d3d3]">
                <h3 className="text-lg font-semibold p-4 text-gray-800 mb-4 border-b pb-2">Time Entries</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="table-bg-heading table-th-tr-row">
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Date</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Time Spent</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Action</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Work Type</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Narration</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project Type</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Project Type Status</th>
                        <th className="px-4 py-3 text-center text-xs font-medium tracking-wider">Modify</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {savedEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {editIndex === index ? (
                              <select
                                value={entry.projectId}
                                onChange={(e) => handleEdit(index, "projectId", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              >
                                <option value="">Select Project</option>
                                {loading && <option disabled>Loading...</option>}
                                {error && <option disabled>Error loading projects</option>}
                                {Array.isArray(userProjects?.data) && userProjects.data.length > 0 ? (
                                  userProjects.data.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.project_name}
                                    </option>
                                  ))
                                ) : (
                                  !loading && !error && <option disabled>No projects found</option>
                                )}
                              </select>
                            ) : (
                               userProjects?.data?.find((p) => p.id === parseInt(entry.projectId))?.project_name || "Unknown Project"
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border">
                            {editIndex === index ? (
                              <input
                                type="text"
                                value={entry.hoursSpent ?? ""}
                                inputMode="numeric"
                                placeholder="HH:MM"
                                maxLength={5}
                                onChange={(e) => {
                                  let input = e.target.value;

                                  const digits = input.replace(/\D/g, "");

                                  let formatted = digits;
                                  if (digits.length >= 3) {
                                    formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
                                  } else if (digits.length >= 1) {
                                    formatted = digits;
                                  }

                                  handleEdit(index, "hoursSpent", formatted);
                                }}
                                onKeyDown={(e) => {
                                  const allowedKeys = [
                                    "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab",
                                  ];
                                  const isNumber = /^[0-9]$/.test(e.key);
                                  const isColon = e.key === ":";

                                  if (!isNumber && !isColon && !allowedKeys.includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                              />

                            ) : (
                              <span>
                                {entry.hoursSpent}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {editIndex === index ? (
                              <select
                                id="billingStatus"
                                name="billingStatus"
                                value={entry.billingStatus}
                                onChange={(e) => handleEdit(index, "billingStatus", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              >
                                {tags.length > 0 ? (
                                  tags.map((tag, index) => (
                                    <option key={index} value={tag.id}>{tag.name}</option> // Display tag name from the tags_activitys array
                                  ))
                                ) : (
                                  <option disabled>No tags available</option>
                                )}
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.billingStatus === 'Billable' ? 'bg-green-100 text-green-800' :
                                entry.billingStatus === 'Non Billable' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {entry.billingStatus}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {editIndex === index ? (
                              <select
                                id="status"
                                name="status"
                                value={entry.status}
                                onChange={(e) => handleEdit(index, "status", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              >
                                <option value="">--Select--</option>
                                <option value="WFO">Work From Office</option>
                                <option value="WFH">Work from Home</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.status === 'WFO' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                {entry.status}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {editIndex === index ? (
                              <input
                                type="text"
                                value={entry.notes}
                                onChange={(e) => handleEdit(index, "notes", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              entry.notes
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {editIndex === index ? (
                                <select
                                  id="project_type"
                                  name="project_type"
                                  value={entry.project_type}
                                  onChange={(e) => handleEdit(index, "project_type", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                  <option value="">--Select--</option>
                                  <option value="Fixed">Fixed</option>
                                  <option value="Hourly">Hourly</option>
                                </select>
                              ) : (
                                entry.project_type
                              )}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {editIndex === index ? (
                                <select
                                  id="project_type_status"
                                  name="project_type_status"
                                  value={entry.project_type_status}
                                  onChange={(e) => handleEdit(index, "project_type_status", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                  <option value="">--Select--</option>
                                  {entry.project_type === "Fixed" ? (
                                    <option value="Offline">Offline</option>
                                  ) : (
                                    <>
                                      <option value="Tracker">Tracker</option>
                                      <option value="Offline">Offline</option>
                                    </>
                                  )}
                                </select>
                              ) : (
                                entry.project_type_status
                              )}
                            </td>

                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex space-x-2">
                              {editIndex === index ? (
                                <button
                                  onClick={handleSaveClick}
                                  className="save-btn"
                                ><Save className="h-4 w-4 mr-1" />
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(index)}
                                  className="edit-btn"
                                ><Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(index)}
                                className="delete-btn"
                              ><Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {savedEntries.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Addsheet;