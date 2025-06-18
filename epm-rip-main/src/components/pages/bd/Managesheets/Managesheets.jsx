import React, { useEffect, useState } from "react";
import { useBDProjectsAssigned } from "../../../context/BDProjectsassigned";
import { Loader2, Calendar, User, Briefcase, Clock, FileText, Target, BarChart, Search, CheckCircle, XCircle, Pencil, Ban } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { SectionHeader } from '../../../components/SectionHeader';
import { EditButton, SaveButton, CancelButton, DeleteButton, ExportButton, ImportButton, ClearButton, IconApproveButton, IconRejectButton, YesterdayButton, TodayButton, WeeklyButton, CustomButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton, IconEditButton, IconViewButton } from "../../../AllButtons/AllButtons";


export const Managesheets = () => {
  const { performanceData, fetchPerformanceDetails, isLoading, approvePerformanceSheet, rejectPerformanceSheet } = useBDProjectsAssigned();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // const [startDate, setStartDate] = useState(() => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   return yesterday.toISOString().split("T")[0];
  // });

  // const [endDate, setEndDate] = useState(() => {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   return yesterday.toISOString().split("T")[0];
  // });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // console.log("performance data", performanceData);

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"
  };

  const [startDate, setStartDate] = useState(getYesterday);
  const [endDate, setEndDate] = useState(getYesterday);

  useEffect(() => {
    const yesterday = getYesterday();
    setStartDate(yesterday);
    setEndDate(yesterday);
  }, []);





  useEffect(() => {
    fetchPerformanceDetails();
  }, []);


  const toggleEditMode = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!Array.isArray(performanceData) || performanceData.length === 0) {
      console.warn("⚠️ Performance data is empty or invalid:", performanceData);
      setFilteredData([]);
      return;
    }

    let filtered = performanceData.flatMap(user =>
      user.sheets.map(sheet => ({
        ...sheet,
        user_name: user.user_name,
      }))
    );

    // **Apply Date Filter**
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Convert dates to string format "YYYY-MM-DD"
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];

      filtered = filtered.filter(sheet => {
        if (!sheet.date) return false;

        const sheetDateStr = sheet.date.split("T")[0]; // Ensure date-only format
        return sheetDateStr >= startStr && sheetDateStr <= endStr;
      });
    }


    // **Apply Search Filter**
    if (searchTerm) {
      filtered = filtered.filter(sheet =>
        sheet.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log("Filtered Data:", filtered); // Debugging

    setFilteredData(filtered);
  }, [searchTerm, startDate, endDate, performanceData]);



  useEffect(() => {
    if (!startDate && !endDate && searchTerm) {
      const filtered = performanceData.flatMap((user) =>
        user.sheets.map(sheet => ({
          ...sheet,
          user_name: user.user_name,
        }))
          .filter(sheet =>
            sheet.project_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, startDate, endDate, performanceData]);


  const handleStatusChange = async (sheet, newStatus) => {
    try {
      if (newStatus === "approved") {
        await approvePerformanceSheet(sheet.id);
      } else if (newStatus === "rejected") {
        await rejectPerformanceSheet(sheet.id);
      }
      fetchPerformanceDetails();
    } catch (error) {
      console.error("Error Updating Sheet Status:", error);
    }
  };

  const handleSelectAll = () => {
    const allSheets = searchTerm ? filteredData : performanceData.flatMap(user => user.sheets);

    if (selectedRows.length === allSheets.length) {
      setSelectedRows([]); // Deselect all
    } else {
      const allSelectedIds = allSheets.map(sheet => sheet.id);
      setSelectedRows(allSelectedIds);
    }
  };


  const handleRowSelect = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };
  const allSheets = searchTerm ? filteredData : performanceData.flatMap(user => user.sheets);
  const isDateFiltered = filteredData.length > 0;

  const paginatedData = () => {
    const isFilterApplied = searchTerm || startDate || endDate;

    const dataToDisplay = isFilterApplied
      ? filteredData // Show filtered even if it's empty
      : performanceData.flatMap((user) =>
        user.sheets.map((sheet) => ({
          ...sheet,
          user_name: user.user_name,
        }))
      );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dataToDisplay.slice(startIndex, endIndex);
  };

  const isFilterApplied = searchTerm || startDate || endDate;

  const totalPages = Math.ceil(
    (isFilterApplied
      ? filteredData.length
      : performanceData.reduce((acc, user) => acc + user.sheets.length, 0)) / itemsPerPage
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Manage Performance Sheet" subtitle="Track and manage performance sheets over time" />
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-white z-10 shadow-md p-4 rounded-md">

        <div className="flex items-center w-full md:w-auto flex-1 border border-gray-300 px-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full rounded-lg focus:outline-none py-2"
            placeholder="Search by Project Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isCustomMode ? (
            <>
              <TodayButton onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setStartDate(today);
                setEndDate(today);
              }} />
              <YesterdayButton onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const formatted = yesterday.toISOString().split("T")[0];
                setStartDate(formatted);
                setEndDate(formatted);
              }} />

              <WeeklyButton onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 6);
                  const formattedStart = start.toISOString().split("T")[0];
                  const formattedEnd = end.toISOString().split("T")[0];
                  setStartDate(formattedStart);
                  setEndDate(formattedEnd);
                }}/>
              <CustomButton onClick={() => setIsCustomMode(true)}/>
            </>
          ) : (
            <>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <ClearButton
                onClick={() => {
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                }}
              />

            <CancelButton onClick={() => {
                  setIsCustomMode(false);
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                }}/>
            </>
          )}

          <ExportButton onClick={() => exportToExcel(filteredData, "sheet.xlsx")} />
          <ImportButton onClick={() => alert("Handle import logic here")} />
        </div>
      </div>


      {selectedRows.length > 0 && (
        <select
          className="px-3 py-2 border rounded-lg cursor-pointer bg-gray-100 text-gray-700"
          onChange={(e) => {
            const newStatus = e.target.value;
            allSheets.forEach(sheet => {
              if (selectedRows.includes(sheet.id)) {
                handleStatusChange(sheet, newStatus);
              }
            });
          }}
        >
          <option value="">Change Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      )}


      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="table-bg-heading table-th-tr-row">
                <th className="px-4 py-2 text-center">

                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  />
                </th>
                {[
                  { label: "Date", icon: Calendar },
                  { label: "Employee Name", icon: User },
                  { label: "Client Name", icon: User },
                  { label: "Project Name", icon: Briefcase },
                  { label: "Work Type", icon: Target },
                  { label: "Activity", icon: Clock },
                  { label: "Time", icon: Clock },
                  { label: "Narration", icon: FileText },
                  { label: "Status" }
                ].map(({ label, icon: Icon }, index) => (
                  <th key={index} className="px-4 py-2 text-center font-semibold whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-white" />}
                      {label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                        <Loader2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-gray-600 text-lg font-medium">Loading your performance data...</span>
                      <p className="text-gray-400">Please wait while we fetch your records</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData().map((sheet, index) => (

                  <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200 ease-in-out">
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(sheet.id)}
                        onChange={() => handleRowSelect(sheet.id)}
                      />
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.date}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.user_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.client_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.project_name}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.work_type}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.activity_type}</td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">{sheet.time}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700 whitespace-nowrap">
                      {sheet.narration
                        ? sheet.narration
                          .replace(/[,.\n]/g, " ")
                          .split(/\s+/)
                          .slice(0, 1)
                          .join(" ") + "..."
                        : ""}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center">
                      {editMode[sheet.id] ? (
                        <div className="flex items-center gap-4">
                          <IconApproveButton
                            onClick={() => {
                              handleStatusChange(sheet, "approved");
                              toggleEditMode(sheet.id);
                            }}
                          />
                          <IconRejectButton
                            onClick={() => {
                              handleStatusChange(sheet, "rejected");
                              toggleEditMode(sheet.id);
                            }}
                          />
                          <IconCancelTaskButton
                            onClick={() => {
                              setEditMode((prev) => ({ ...prev, [sheet.id]: false }));
                            }}
                          />
                        </div>
                      ) : sheet.status?.toLowerCase() === "approved" ? (
                        <div className="flex items-center gap-3">
                          <IconApproveButton />
                          <button
                            onClick={() => toggleEditMode(sheet.id)}
                            className="hover:scale-110 transition"
                          >
                            <Pencil className="text-blue-600 h-6 w-6 hover:text-blue-700" />
                          </button>
                        </div>
                      ) : sheet.status?.toLowerCase() === "rejected" ? (
                        <div className="flex items-center gap-3">
                          <IconRejectButton />
                          <button
                            onClick={() => toggleEditMode(sheet.id)}
                            className="hover:scale-110 transition"
                          >
                            <Pencil className="text-blue-600 h-6 w-6 hover:text-blue-700" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <IconApproveButton
                            onClick={() => handleStatusChange(sheet, "approved")}
                          />
                          <IconRejectButton
                            onClick={() => handleStatusChange(sheet, "rejected")}
                          />
                          <button
                            onClick={() => toggleEditMode(sheet.id)}
                            className="hover:scale-110 transition"
                          >
                            <Pencil className="text-blue-600 h-6 w-6 hover:text-blue-700" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>




          </table>
          {totalPages > 1 && (
            // <div className="flex justify-center items-center gap-4 py-4">
            //   <button
            //     className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            //     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            //     disabled={currentPage === 1}
            //   >
            //     Previous
            //   </button>

            //   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            //     <button
            //       key={page}
            //       className={`px-3 py-1 rounded ${currentPage === page
            //         ? "bg-blue-500 text-white"
            //         : "bg-gray-200 hover:bg-gray-300"
            //         }`}
            //       onClick={() => setCurrentPage(page)}
            //     >
            //       {page}
            //     </button>
            //   ))}

            //   <button
            //     className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            //     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            //     disabled={currentPage === totalPages}
            //   >
            //     Next
            //   </button>
            // </div>
            <div className="flex justify-center items-center gap-4 py-4">
              <button
                className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === 1
                  ? "bg-gray-200 disabled:opacity-50"
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
                  className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === page
                    ? "bg-blue-600 text-white font-semibold ring-2 ring-blue-400 shadow-md"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${currentPage === totalPages
                  ? "bg-gray-200 disabled:opacity-50"
                  : "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 shadow-md font-semibold"
                  }`}
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

