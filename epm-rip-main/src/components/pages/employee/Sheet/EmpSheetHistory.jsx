import React, { useState, useEffect } from "react";
import { useUserContext } from "../../../context/UserContext";
import {
  Loader2,
  Calendar,
  User,
  Briefcase,
  Clock,
  FileText,
  Target,
  CheckCircle,
  BarChart,
  Search,
  Save,
  XCircle,
  Pencil,
  Trash2,
  Edit,
} from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { useAlert } from "../../../context/AlertContext";

export const EmpSheetHistory = () => {
  const { userProjects, error, editPerformanceSheet, performanceSheets, loading } = useUserContext();
  console.log("Performance Sheets:", performanceSheets); // Debugging: Check the structure

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const sheets = performanceSheets?.data?.sheets || [];
  const [editingRow, setEditingRow] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [tags, setTags] = useState([]);
  const { showAlert } = useAlert();
  const recordsPerPage = 11;

  // Effect to set initial tags when userProjects are loaded, or when entering edit mode
  useEffect(() => {
    if (editingRow !== null && sheets[editingRow] && userProjects?.data) {
      const currentSheet = sheets[editingRow];
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(currentSheet.project_id)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]); // Clear tags if project not found
      }
    }
  }, [editingRow, sheets, userProjects]);


  const handleEditClick = (index, sheet) => {
    setEditingRow(index);
    // When entering edit mode, set editedData.activity_type to the ID
    // so the <select> element can correctly display the current activity type.
    const currentActivityTag = tags.find(
      (tag) => tag.name === sheet.activity_type
    );
    setEditedData({
      ...sheet,
      activity_type: currentActivityTag ? currentActivityTag.id : sheet.activity_type,
    });

    // Also set tags relevant to the current project being edited
    if (userProjects?.data) {
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(sheet.project_id)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]);
      }
    }
  };


  const handleChange = (e, field) => {
    let value = e.target.value;

    // For time field, clean up any AM/PM if mistakenly entered
    if (field === "time") {
      value = value.replace(/(AM|PM|am|pm)/gi, "").trim();
    }

    console.log(`Updating ${field}:`, value);

    // If the field is "project_id", update the tags state based on the selected project
    if (field === "project_id") {
      const selectedProject = userProjects.data.find(
        (project) => project.id === parseInt(value)
      );
      if (selectedProject) {
        setTags(selectedProject.tags_activitys);
      } else {
        setTags([]); // Clear tags if no project selected or found
      }
    }

    setEditedData((prevData) => ({ ...prevData, [field]: value }));
  };


  const handleSave = async (editId) => {
    if (!editId) {
      console.error("No ID provided for the sheet being edited.");
      return;
    }

    // Find the name of the activity type based on its ID before sending
    const selectedTag = tags.find(
      (tag) => tag.id.toString() === editedData.activity_type.toString()
    );
    const activityTypeName = selectedTag ? selectedTag.name : editedData.activity_type;

    const requestData = {
      id: editId,
      data: {
        project_id: editedData.project_id,
        date: editedData.date,
        time: editedData.time,
        work_type: editedData.work_type,
        activity_type: activityTypeName, // Send the name, not the ID
        narration: editedData.narration,
        project_type: editedData.project_type,
        project_type_status: editedData.project_type_status,
      },
    };

    try {
      const response = await editPerformanceSheet(requestData);
      if (response) {
        setEditingRow(null); // Exit edit mode on success
        // Assuming editPerformanceSheet in context either updates local state
        // or triggers a re-fetch of performance sheets.
        // If not, you might need to manually update the 'sheets' state here
        // or trigger a refetch from the UserContext.
      }
    } catch (error) {
      console.error("Error saving performance sheet:", error);
      // Optionally, show an error message to the user
    }
  };

  const getStatusStyles = (status) => {
    if (!status || typeof status !== "string") {
      return "bg-gray-50 text-gray-700 ring-1 ring-gray-700/20 hover:bg-gray-100";
    }

    const safeStatus = String(status).toLowerCase();
    switch (safeStatus) {
      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      case "pending":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      case "approved":
      case "completed":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-700/20 hover:bg-gray-100 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    }
  };

  const getStatusIcon = (status) => {
    if (!status || typeof status !== "string") {
      return <Clock className="h-4 w-4" />;
    }

    const safeStatus = String(status).toLowerCase();
    switch (safeStatus) {
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };


  const filteredSheets = sheets.filter((sheet) => {
    const sheetDate = new Date(sheet.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (!start || sheetDate >= start) && (!end || sheetDate <= end)
    );
  });

  const totalPages = Math.ceil(filteredSheets.length / recordsPerPage);

  // Get current records for the current page
  const currentRecords = filteredSheets.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Handle pagination click
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <SectionHeader
        icon={BarChart}
        title="Performance History"
        subtitle="Track your professional journey, monitor progress, and review achievements across all your projects and activities."
      />
      <div className="flex items-center justify-end gap-4 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap border p-2 px-3 rounded-lg shadow-md bg-white">
          <div className="flex items-center gap-2">
            <label htmlFor="startDate" className="font-bold text-black">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="endDate" className="font-bold text-black">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="top-tag-bg-color top-tag-size">
              <div className="text-xl font-bold text-white leading-5">
                {sheets.length}
              </div>
              <div className="text-blue-100">Total Records</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px] ">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-bg-heading">
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Client Name", icon: User },
                  { label: "Project Name", icon: Briefcase },
                  { label: "Work Type", icon: Target },
                  { label: "Activity", icon: Clock },
                  { label: "Time", icon: Clock },
                  { label: "Project Type", icon: Clock },
                  { label: "Project Type Status", icon: Clock },
                  { label: "Narration", icon: FileText },
                  { label: "Status", icon: CheckCircle },
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="text-center table-th-tr-row">
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="h-4 w-4 text-white" />
                      <span className="text-gray-900 text-nowrap text-white">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    Loading...
                  </td>
                </tr>
              ) : currentRecords.length > 0 ? (
                currentRecords.map((sheet, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out group"
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium text-nowrap text-center">
                      {sheet.date}
                    </td>
                    <td className="px-6 py-4 text-nowrap text-center">
                      {sheet.client_name}
                    </td>
                    <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <select
                          id="projectId"
                          name="projectId"
                          value={editedData.project_id || ""}
                          onChange={(e) => handleChange(e, "project_id")}
                          className="text-nowrap min-w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="">Select Project</option>
                          {userProjects?.data?.length > 0 ? (
                            userProjects.data.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.project_name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No projects found</option>
                          )}
                        </select>
                      ) : (
                        sheet.project_name
                      )}
                    </td>

                    <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <select
                          id="workType"
                          name="workType"
                          value={editedData.work_type || ""}
                          onChange={(e) => handleChange(e, "work_type")}
                          className="min-w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="">Select Work Type</option>
                          <option value="WFO">Work From Office</option>
                          <option value="WFH">Work From Home</option>
                        </select>
                      ) : (
                        sheet.work_type
                      )}
                    </td>

                    <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <select
                          id="activityType"
                          name="activityType"
                          value={editedData.activity_type || ""}
                          onChange={(e) => handleChange(e, "activity_type")}
                          className="min-w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="">Select Activity</option>
                          {tags.length > 0 ? (
                            tags.map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No activities available</option>
                          )}
                        </select>
                      ) : (
                        sheet.activity_type
                      )}
                    </td>

                    <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <input
                          type="text"
                          value={editedData.time || ""}
                          onChange={(e) => handleChange(e, "time")}
                          className="border rounded px-2 py-1 text-center"
                          placeholder="HH:MM"
                          maxLength={5} // Ensures max input is 5 characters (HH:MM)
                          inputMode="numeric" // Shows numeric keyboard on mobile
                          onKeyDown={(e) => {
                            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
                            const isNumber = /^[0-9]$/.test(e.key);
                            const isColon = e.key === ":";

                            // Allow only numbers, colon, and specified control keys
                            if (!isNumber && !isColon && !allowedKeys.includes(e.key)) {
                              e.preventDefault();
                            }

                            // Auto-add colon after HH if two digits are entered and not Backspace
                            if (e.target.value.length === 2 && isNumber && e.key !== "Backspace" && !e.target.value.includes(':')) {
                              e.target.value += ":";
                            }
                          }}
                          // pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$" // Ensures HH:MM format (24-hour)
                          // Relaxed pattern for immediate input, validation can be stricter on save
                        />
                      ) : (
                        sheet.time
                      )}
                    </td>

                   <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <select
                          id="project_type"
                          name="project_type"
                          value={editedData.project_type || ""}
                          onChange={(e) => handleChange(e, "project_type")}
                          className="min-w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="">Select Project Type</option>
                          <option value="Fixed">Fixed</option>
                          <option value="Hourly">Hourly</option>
                        </select>
                      ) : (
                        sheet.project_type
                      )}
                    </td>

                    <td className="px-6 py-4 text-nowrap text-center">
                      {editingRow === index ? (
                        <select
                          id="project_type_status"
                          name="project_type_status"
                          value={editedData.project_type_status || ""}
                          onChange={(e) => handleChange(e, "project_type_status")}
                          className="min-w-full h-9 p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-xs"
                        >
                          <option value="">Select Status</option>

                          {editedData.project_type === "Fixed" ? (
                            <option value="Offline">Offline</option>
                          ) : (
                            <>
                              <option value="Tracker">Tracker</option>
                              <option value="Offline">Offline</option>
                            </>
                          )}
                        </select>
                      ) : (
                        sheet.project_type_status
                      )}
                    </td>

                    <td className="px-6 py-4 text-nowrap text-center relative">
                      {editingRow === index ? (
                        <textarea
                          value={editedData.narration || ""} // Ensure value is controlled
                          onChange={(e) => handleChange(e, "narration")}
                          className="border rounded px-2 py-1 w-full min-w-[150px] max-w-[300px] min-h-[50px] max-h-[150px] overflow-auto"
                        />
                      ) : (
                        <div className="relative inline-block max-w-[150px] group">
                          <span className="cursor-pointer">
                            {sheet.narration && sheet.narration.length > 7
                              ? sheet.narration.slice(0, 7) + "..."
                              : sheet.narration || "N/A"}{" "}
                            {/* Default fallback */}
                          </span>
                          {sheet.narration && sheet.narration.length > 7 && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-auto max-w-[300px] bg-gray-100 text-black text-sm rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-pre-wrap break-words pointer-events-none invisible group-hover:visible">
                              {sheet.narration}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`${getStatusStyles(sheet.status)}`}>
                          {getStatusIcon(sheet.status)}
                          {sheet.status}
                        </span>

                        {editingRow === index ? (
                          <>
                            <button
                              onClick={() => handleSave(sheet.id)}
                              className="save-btn inline-flex items-center px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingRow(null)} // Use null to exit edit mode
                              className="cancel-btn inline-flex items-center px-3 py-1.5 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-150"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          sheet.status.toLowerCase() === "rejected" && (
                            <button
                              onClick={() => handleEditClick(index, sheet)}
                              className="edit-btn inline-flex items-center px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10" // Increased colspan to match the number of columns
                    className="px-6 py-20 text-center text-nowrap"
                  >
                    No performance sheets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 py-4">
        <button
          className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
            currentPage === 1
              ? "bg-gray-200 disabled:opacity-50 cursor-not-allowed"
              : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
          }`}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
              currentPage === page
                ? "bg-blue-600 text-white font-semibold ring-2 ring-blue-400 shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${
            currentPage === totalPages
              ? "bg-gray-200 disabled:opacity-50 cursor-not-allowed"
              : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
          }`}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmpSheetHistory;