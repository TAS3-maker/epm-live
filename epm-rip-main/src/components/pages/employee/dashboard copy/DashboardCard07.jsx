import React from 'react';
import { useUserContext } from "../../../context/UserContext";
import { StatCardHeader } from "../../../components/CardsDashboard";
import { Briefcase } from "lucide-react";

function DashboardCard07() {
    const { performanceSheets, loading } = useUserContext();

    // Sort the data by date and get the latest 7 records
    const sortedSheets = performanceSheets?.data?.sheets
        ? performanceSheets.data.sheets
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 7)
        : [];

    return (
        <div className="col-span-full xl:col-span-6 bg-white ring shadow-xl ring-gray-100 rounded-lg overflow-hidden">
            <StatCardHeader icon={Briefcase} title="Top performance sheet" tooltip="Top performance sheet" />
            <div className="p-4">
                {/* Scrollable Table */}
                <div className="overflow-x-auto min-h-96 overflow-y-auto">
                <div className=" rounded-lg">
                    <table className=" table-auto w-full text-sm text-gray-600">
                    {/* Table header */}
                    <thead className="text-xs uppercase bg-blue-600 text-white sticky top-0 z-10">
                        <tr>
                        <th className="p-3 text-left">
                            <div className="font-semibold">Project Name</div>
                        </th>
                        <th className="p-3 text-center">
                            <div className="font-semibold">Client Name</div>
                        </th>
                        <th className="p-3 text-center">
                            <div className="font-semibold">Time Spent</div>
                        </th>
                        <th className="p-3 text-center">
                            <div className="font-semibold">Work Type</div>
                        </th>
                        <th className="p-3 text-center">
                            <div className="font-semibold">Status</div>
                        </th>
                        </tr>
                    </thead>
                    {/* Table body */}
                    <tbody className="divide-y divide-gray-200">
                        {sortedSheets.map((sheet) => (
                        <tr key={sheet.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="p-3 flex items-center space-x-3">
                            <span className="font-medium">{sheet.project_name}</span>
                            </td>
                            <td className="p-3 text-center">{sheet.client_name}</td>
                            <td className="p-3 text-center">{sheet.time}</td>
                            <td className="p-3 text-center">
                            <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm border ${sheet.work_type === 'WFO' ? 'bg-green-100 text-green-800 border-green-400' : 'bg-blue-100 text-blue-800 border-blue-400'}`}>
                                {sheet.work_type}
                            </span>
                            </td>
                            <td className="p-3 text-center">
                            <span
                                className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm border ${
                                    sheet.status === 'approved'
                                    ? 'bg-green-100 text-green-800 border-green-400'
                                    : sheet.status === 'rejected'
                                    ? 'bg-red-100 text-red-800 border-red-400'
                                    : sheet.status === 'Pending'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-400'
                                    : sheet.status === 'show'
                                    ? 'bg-blue-100 text-blue-800 border-blue-400'
                                    : 'bg-gray-100 text-gray-800 border-gray-400'
                                }`}
                                >
                                {sheet.status}
                            </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </div>

    );
}

export default DashboardCard07;
  