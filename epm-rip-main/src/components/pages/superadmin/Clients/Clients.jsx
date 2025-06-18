import React, { useState } from "react";
import { useClient } from "../../../context/ClientContext";
import { Loader2 } from "lucide-react";
import {
  EditButton, SaveButton, CancelButton, YesButton, DeleteButton, ExportButton,
  ImportButton, ClearButton, CloseButton, SubmitButton, IconApproveButton,
  IconRejectButton, IconCancelTaskButton, IconSaveButton, IconDeleteButton,
  IconEditButton, IconViewButton,
} from "../../../AllButtons/AllButtons";


export const Clients = () => {
  const { addClient, isLoading, message } = useClient();
  const [clientName, setClientName] = useState("");
  const [hiringId, sethiringId] = useState("");
  const [contactDetail, setContactDetail] = useState("");
  const [clienttype, setClienttype] = useState("");
  const [companyname, setCompanyname] = useState("");
  const [address, setAddress] = useState("");
  const [communication, setCommunication] = useState("");
  const [projectType, setProjectType] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [formType, setFormType] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const showAlert = ({ variant, title, message }) => {
    alert(`${title}: ${message}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting:", {
      clientName,
      hiringId,
      contactDetail,
      address,
      companyname,
      clienttype,
      communication,
      projectType
    });

    if (clienttype === "Hired on Upwork") {
      if (!clientName.trim() || !hiringId.trim() || !contactDetail.trim() || !communication.trim() || !projectType.trim()) {
        showAlert({ variant: "error", title: "Error", message: "Please fill all required fields for Upwork client." });
        return;
      }
    } else if (clienttype === "Direct") {
      if (!clientName.trim() || !contactDetail.trim() || !address.trim() || !companyname.trim() || !communication.trim() || !projectType.trim()) {
        showAlert({ variant: "error", title: "Error", message: "Please fill all required fields for Direct client." });
        return;
      }
    } else {
      showAlert({ variant: "error", title: "Error", message: "Please select a client type." });
      return;
    }

    await addClient(clienttype, clientName, hiringId, contactDetail, address, companyname, communication, projectType);

    console.log("Client added successfully!");

    setClientName("");
    sethiringId("");
    setAddress("");
    setContactDetail("");
    setCompanyname("");
    setClienttype("");
    setCommunication("");
    setProjectType("");
    setShowMessage(true);
    setFormType(null);
  };



  return (
    <div className="">
      <button onClick={() => setShowPopup(true)} className="add-items-btn">
        Add Client
      </button>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96"> {/* Initial popup remains w-96 */}
            <h3 className="text-lg font-semibold text-center">Select Hiring Method</h3>
            <div className="grid flex-col space-y-4 my-4 mb-6 justify-center">
              <button onClick={() => { setFormType("upwork"); setClienttype("Hired on Upwork"); setShowPopup(false); }} className="flex items-center justify-center w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5">Hired on Upwork</button>
              <button onClick={() => { setFormType("direct"); setClienttype("Direct"); setShowPopup(false); }} className="flex items-center justify-center w-full text-center px-4 py-2 mb-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5">Direct</button>
            </div>
            <CloseButton onClick={() => setShowPopup(false)} />
          </div>
        </div>
      )}

      {showMessage && message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm font-medium text-center ${message.includes("successfully")
            ? "bg-green-50 text-green-800 border border-green-300"
            : "bg-red-50 text-red-800 border border-red-300"
            }`}
        >
          {message}
        </div>
      )}

      {formType === "upwork" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          {/* Increased modal width to w-[48rem] or a custom max-width */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg md:max-w-lg"> {/* Adjust max-w as needed */}
             <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-6">Upwork Hiring Form</h3>
              <button className="font-bold" onClick={() => setFormType(null)}>X</button>
             </div>

            {/* Changed form to use flexbox for half-width inputs */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <label htmlFor="clientName" className="block font-medium text-gray-700 text-sm">
                  Client Name
                </label>
                <input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter Client Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contactDetail" className="block font-medium text-gray-700 text-sm">
                  Contact Details
                </label>
                <input
                  id="contactDetail"
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="Enter Contact Details"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="hiringId" className="block font-medium text-gray-700 text-sm">
                  Hiring Id
                </label>
                <input
                  id="hiringId"
                  value={hiringId}
                  onChange={(e) => sethiringId(e.target.value)}
                  placeholder="Enter Hiring Id"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="projectType" className="block font-medium text-gray-700 text-sm">
                  Project Type
                </label>
                <select
                  id="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Project Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="communication" className="block font-medium text-gray-700 text-sm">
                  Communication
                </label>
                <input
                  id="communication"
                  type="text"
                  value={communication}
                  onChange={(e) => setCommunication(e.target.value)}
                  placeholder="e.g., Email, Upwork Chat, Phone"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Buttons usually go full width or centered */}
              <div className="md:col-span-2 flex justify-end space-x-3 mt-6"> {/* Added mt-6 for spacing from last input */}
                <SubmitButton disabled={isLoading} />
              </div>
            </form>
          </div>
        </div>
      )}

      {formType === "direct" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          {/* Increased modal width to w-[48rem] or a custom max-width */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl md:max-w-xl"> {/* Adjust max-w as needed */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-6">Direct Hiring Form</h3>
              <button className="font-bold" onClick={() => setFormType(null)} >X</button>
            </div>

            {/* Changed form to use flexbox for half-width inputs */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter Client Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Details</label>
                <input
                  value={contactDetail}
                  onChange={(e) => setContactDetail(e.target.value)}
                  placeholder="Enter Contact Details"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  value={companyname}
                  onChange={(e) => setCompanyname(e.target.value)}
                  placeholder="Enter Company Name"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Address"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="directProjectType" className="block font-medium text-gray-700 text-sm">
                  Project Type
                </label>
                <select
                  id="directProjectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Project Type</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div>
                <label htmlFor="directCommunication" className="block font-medium text-gray-700 text-sm">
                  Communication
                </label>
                <input
                  id="directCommunication"
                  type="text"
                  value={communication}
                  onChange={(e) => setCommunication(e.target.value)}
                  placeholder="e.g., Email, Slack, Microsoft Teams"
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              

              {/* Buttons usually go full width or centered */}
              <div className="md:col-span-2 flex justify-end space-x-3 mt-6"> {/* Added mt-6 for spacing from last input */}
                <SubmitButton disabled={isLoading} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};