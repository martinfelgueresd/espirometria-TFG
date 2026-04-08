function PatientDetail({ patient }) {
    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-6">{patient.name}</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="text-sm font-medium text-gray-900">{patient.personal_id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-sm font-medium text-gray-900">{patient.age}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900">{patient.gender}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">IMC</p>
                        <p className="text-sm font-medium text-gray-900">{patient.imc}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Smoker</p>
                        <p className="text-sm font-medium text-gray-900">{patient.smoker ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Ethnic group</p>
                        <p className="text-sm font-medium text-gray-900">{patient.ethnic_group}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientDetail;