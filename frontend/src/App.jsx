import { useState } from "react";
import PatientForm from "./components/patients/PatientForm";
import PatientList from "./components/patients/PatientList";
import Navbar from "./components/layout/Navbar.jsx"
import PatientDetail from "./components/patients/PatientDetail.jsx";
import {uploadSession} from "./services/sessionService.js";
import {deletePatient} from "./services/patientService.js";
import PatientEdit from "./components/patients/PatientEdit.jsx";

function App() {
    const [view, setView] = useState("list");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [refresh, setRefresh] = useState(0);

    const handlePatientCreated = () => {
        setRefresh(r => r + 1); // fuerza recarga de la lista
        setView("list");
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setView("detail")
    };

    const handleUpload = async (id, file) => {
        await uploadSession(id, file);
    };

    const handleDelete = async(id) => {
        await deletePatient(id)
        setRefresh(r => r + 1);
    };

    const handleEdit = (patient) => {
        setSelectedPatient(patient)
        setView("edit")
    }

    const handlePatientEdited = () => {
        setRefresh(r => r + 1); // fuerza recarga de la lista
        setView("list");
    };

    return (
        <div>
            <Navbar view={view} setView={setView} />
            {view === "list" && <PatientList key={refresh} onPatientClicked={handlePatientClick} onUploadClicked={handleUpload} onDeleteClicked={handleDelete} onEditClicked={handleEdit}/>}
            {view === "form" && <PatientForm onPatientCreated={handlePatientCreated} />}
            {view === "detail" && <PatientDetail patient={selectedPatient} />}
            {view === "edit" && <PatientEdit patient={selectedPatient} onPatientEdited={handlePatientEdited}/>}
        </div>
    );
}

export default App;