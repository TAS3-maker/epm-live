import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../utils/ApiConfig";
import Alert from "../components/Alerts";
import { useAlert } from "./AlertContext";

const EmployeeContext = createContext(undefined);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // This is more for general context-level errors, not specific validation ones
  const { showAlert } = useAlert();

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Unauthorized: No token found.");
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employees"); // Throw specific message if available
      }
      const data = await response.json();
      console.log("all employess,", data);
      setEmployees(data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message); // Set general error for the context
      showAlert({ variant: "error", title: "Error", message: err.message }); // Show an alert for fetch errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (employeeData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("name", employeeData.name);
      formData.append("email", employeeData.email);
      formData.append("password", employeeData.password);
      formData.append("team_id", employeeData.team_id ? employeeData.team_id : "");
      formData.append("address", employeeData.address);
      formData.append("phone_num", employeeData.phone_num);
      formData.append("emergency_phone_num", employeeData.emergency_phone_num);
      formData.append("role_id", employeeData.role_id ? employeeData.role_id : "");
      formData.append("pm_id", employeeData.pm_id ? employeeData.pm_id : "");

      // Append profile_pic only if it's a File object
      if (employeeData.profile_pic instanceof File) {
        formData.append("profile_pic", employeeData.profile_pic);
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        // --- IMPORTANT CHANGE HERE ---
        // Throw the entire errorResponse object, stringified, so the component can parse it
        throw new Error(JSON.stringify(errorResponse));
      }

      const newEmployee = await response.json();
      setEmployees((prev) => [...prev, newEmployee.data]);
      showAlert({ variant: "success", title: "Success", message: "Employee added successfully" });
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Error adding employee:", err);
      // The error message might already be stringified JSON if it came from the throw above
      // Otherwise, it's a network error or similar.
      setError(err.message); // Set the error state in context
      // The component will now handle parsing this error message and showing field-specific alerts
      throw err; // Re-throw the error so the component's catch block can handle it
    }
  };

  const updateEmployee = async (id, updatedData) => {
    try {
      const token = localStorage.getItem("userToken");
      const formData = new FormData();

      // Append all fields, even if empty, as the backend validation expects them
      formData.append("name", updatedData.name);
      formData.append("email", updatedData.email);
      formData.append("phone_num", updatedData.phone_num || "");
      formData.append("emergency_phone_num", updatedData.emergency_phone_num || "");
      formData.append("address", updatedData.address || "");
      formData.append("team_id", updatedData.team_id || ""); // Ensure empty string for null/undefined
      formData.append("role_id", updatedData.role_id || ""); // Ensure empty string for null/undefined
      formData.append("pm_id", updatedData.pm_id || ""); // Ensure empty string for null/undefined

      // This is crucial for Laravel to interpret the request as a PUT/PATCH with FormData
      formData.append('_method', 'PUT');

      if (updatedData.profile_pic instanceof File) {
        formData.append("profile_pic", updatedData.profile_pic);
      } else if (updatedData.profile_pic === null) {
        // If profile_pic is explicitly set to null (e.g., user cleared it), send a specific signal
        formData.append("profile_pic", ""); // Or 'null', depends on backend's handling of empty file upload
      }
      // If profile_pic is a URL string and not changed, don't append it to formData
      // The backend should retain the existing one if no new file is provided.

      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "POST", // Method remains POST because of _method=PUT workaround for FormData
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type" is automatically set to multipart/form-data when using FormData, DO NOT SET IT MANUALLY
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        // --- IMPORTANT CHANGE HERE ---
        // Throw the entire errorResponse object, stringified, so the component can parse it
        throw new Error(JSON.stringify(errorResponse));
      }

      fetchEmployees(); // Re-fetch all employees to ensure UI is up-to-date
      showAlert({ variant: "success", title: "Success", message: "Employee updated successfully" });
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.message); // Set the error state in context
      // Re-throw the error so the component's catch block can handle it
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee");
      }
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      showAlert({ variant: "success", title: "Success", message: "Deleted Successfully" });
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.message);
      showAlert({ variant: "error", title: "Error", message: err.message });
    }
  };

  return (
    <EmployeeContext.Provider value={{ employees, loading, error, fetchEmployees, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
};