import React, { useEffect, useState } from "react";
import { useTeam } from "../../../context/TeamContext";
import { Loader2, BarChart } from "lucide-react";
import { exportToExcel } from "../../../components/excelUtils";
import { Teams } from "./Teams";
import { ExportButton, CancelButton, YesButton, IconSaveButton, IconDeleteButton, IconEditButton, IconCancelTaskButton } from "../../../AllButtons/AllButtons";
import { SectionHeader } from "../../../components/SectionHeader";

export const Teamtable = () => {
  const { teams, fetchTeams, deleteTeam, updateTeam, isLoading } = useTeam();
  const [editingTeam, setEditingTeam] = useState(null);
  const [newName, setNewName] = useState("");
  const [editError, setEditError] = useState(""); // For inline error
  const [deleteclient, setDeleteclient] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-md max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Team Management" subtitle="Manage teams and update details" />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
        <Teams />
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 border p-2 rounded-lg shadow-md bg-white">
          <ExportButton onClick={() => exportToExcel(teams, "teams.xlsx")} />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-gray-800 bg-blue-600 text-white">
            <tr>
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
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">No teams found</td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700 text-center">{team.created_at || "-"}</td>
                  <td className="px-4 py-3 text-gray-700 text-center">{team.updated_at || "-"}</td>
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
                          <IconSaveButton onClick={() => handleUpdate(team.id)} />
                          <IconCancelTaskButton
                            onClick={() => {
                              setEditingTeam(null);
                              setEditError("");
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <IconEditButton onClick={() => handleEdit(team)} />
                          <IconDeleteButton onClick={() => { setEditingTeam(team.id); setDeleteclient(true); }} />
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

      {deleteclient && (
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
              <CancelButton onClick={() => setDeleteclient(false)} />
              <YesButton onClick={() => {
                deleteTeam(editingTeam);
                setDeleteclient(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
