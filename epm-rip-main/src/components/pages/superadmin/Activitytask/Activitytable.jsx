import React, { useEffect, useState } from "react";
import { useActivity } from "../../../context/ActivityContext";
import { Edit, Save, Trash2, Loader2, BarChart } from "lucide-react";
import {
  EditButton, SaveButton, CancelButton, YesButton, DeleteButton, ExportButton,
  ImportButton, ClearButton, CloseButton, SubmitButton, IconApproveButton,
  IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton,
  IconEditButton, IconViewButton
} from "../../../AllButtons/AllButtons";
import { SectionHeader } from '../../../components/SectionHeader';
import { Activity } from "./Activity"; // Assuming this is for adding new tags
import { useAlert } from "../../../context/AlertContext";


export const Activitytable = () => {
  const [isUpdating, setIsUpdating] = useState(false); // Local loading state for updates
  const [deleteclient, setDeleteclient] = useState(false); // Modal visibility for delete
  const [editid, setEditid] = useState(null); // ID of the tag currently being edited
  const [deleteid, setDeleteid] = useState(null); // ID of the tag to be deleted
  const [newTagName, setNewTagName] = useState(""); // State for the edited tag name
  
  const { showAlert } = useAlert();
  
  // Destructure validationErrors and setValidationErrors from ActivityContext
  const { 
    getActivityTags, 
    activityTags, 
    loading, 
    message,
    updateActivityTag, 
    deleteTagActivity,
    validationErrors,     // <-- This holds backend field-specific errors
    setValidationErrors   // <-- This allows you to clear field-specific errors
  } = useActivity();

  useEffect(() => {
    getActivityTags();
  }, []); 
                         // though it's stable from context.

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
      // Call the update function from context.
      // The context's `updateActivityTag` is responsible for API call,
      // handling 422 errors by setting `validationErrors`, and showing general alerts.
      await updateActivityTag(id, newTagName);
      
      // After `updateActivityTag` completes, check if there are any validation errors for 'name'.
      // If there are none, it implies the update was successful.
      // This is a common pattern when context functions don't explicitly return success/failure flags.
      // The `validationErrors` state is your direct indicator.
      if (!validationErrors.name) {
        setNewTagName(""); // Reset input field after successful update
        setEditid(null); // Exit edit mode after successful update
        setValidationErrors({}); // Clear validation errors upon successful completion
      }
    } catch (error) {
      // Errors should mostly be handled and alerted by the context,
      // but log any unexpected ones here.
      console.error("Error during tag update in component:", error);
    } finally {
      setIsUpdating(false); // Always reset loading state
      // `getActivityTags()` is already called within `updateActivityTag` in context's finally block.
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
      const tagToDelete = activityTags.find((tag) => tag.id === deleteid);
 
      if (tagToDelete) {
        await deleteTagActivity(tagToDelete.id); // Call delete API (context handles alert)
        // No need to call getActivityTags() here, it's called in deleteTagActivity's finally block
        setDeleteclient(false); // Close modal
        setDeleteid(null); // Reset the delete id
      } else {
        showAlert({ variant: "error", title: "Error", message:"No tag selected for deletion." });
      }
    } catch (error) {
      console.error("Failed to delete tag activity", error);
      // Alert is already shown by deleteTagActivity in context
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg max-h-screen overflow-y-auto">
      <SectionHeader icon={BarChart} title="Activity Tags Management" subtitle="Manage employees and update details" />
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sticky top-0 bg-white z-10 shadow-md">
        <Activity /> {/* Component for adding new tags */}
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
              {loading && !activityTags.length ? ( // Show loader only if initial load or no tags yet
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-500">Loading tags...</span>
                    </div>
                  </td>
                </tr>
              ) : activityTags.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-gray-100 p-3">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No Tags found</h3>
                      <p className="mt-1 text-sm text-gray-500">No Tags have been created yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activityTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      <span className="flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                        {new Date(tag.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">
                      {new Date(tag.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-800 font-medium text-sm">
                      {editid === tag.id ? (
                        <div>
                          <input
                            type="text"
                            // Use validationErrors.name for conditional styling
                            className={`border rounded-md px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
                              validationErrors.name ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                            value={newTagName}
                            onChange={(e) => {
                              setNewTagName(e.target.value);
                              // Clear the specific 'name' error from context when user types
                              setValidationErrors(prev => {
                                const newErrs = { ...prev };
                                delete newErrs.name; // Remove the 'name' error if it exists
                                return newErrs;
                              });
                            }}
                            autoFocus
                          />
                          {/* Display backend validation error message for the 'name' field */}
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
                            <IconSaveButton
                              onClick={() => handleUpdateTag(tag.id)}
                              disabled={isUpdating}
                            />
                            <IconCancelTaskButton onClick={handleCancelEdit} />
                          </>
                        ) : (
                          <>
                            <IconEditButton onClick={() => handleEditClick(tag)} />
                            <IconDeleteButton onClick={() => {
                                setDeleteclient(true);
                                setDeleteid(tag.id);
                              }}
                            />
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
    </div>
  );
};

// IMPORTANT: REMOVE THE DUPLICATE `updateActivityTag` FUNCTION FROM HERE.
// It MUST only be defined in `ActivityContext.js`.
// Having it here causes confusion and incorrect state management.