import {useEffect, useState} from "react";
import {getPatients} from "../../services/patientService.js";

function PatientList({ onPatientClicked }) {

    const [patients, setPatients] = useState([]);

    useEffect(() => {
        getPatients().then(setPatients);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Patient List</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and review all registered patients</p>

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {["Name", "DNI", "Age", "Gender", "IMC", "Smoker", "Sessions", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {patients.map(patient => {
                        console.log(patient);
                        return (
                            <tr onClick={() => onPatientClicked(patient)} key={patient.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.personal_id}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.age}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.gender}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.imc}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.smoker ? "Yes" : "No"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{patient.sessions?.length ?? 0}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        (patient.sessions?.length ?? 0) === 0
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                    }`}>
                                        {(patient.sessions?.length ?? 0) === 0 ? "New" : "Active"}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PatientList;