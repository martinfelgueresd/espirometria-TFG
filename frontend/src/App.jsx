import { useState } from "react";
import PatientForm from "./components/patients/PatientForm";
import PatientList from "./components/patients/PatientList";
import Navbar from "./components/layout/Navbar.jsx"
import PatientDetail from "./components/patients/PatientDetail.jsx";
import {deleteStudy, uploadGlobalSession, uploadSession} from "./services/studyService.js";
import {deletePatient, getPatient} from "./services/patientService.js";
import PatientEdit from "./components/patients/PatientEdit.jsx";
import StudyDetail from "./components/studies/StudyDetail.jsx";

function App() {
    const [view, setView] = useState("list");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [refresh, setRefresh] = useState(0);
    const [successMessage, setSuccessMessage] = useState(null);

    const handlePatientCreated = (message) => {
        setSuccessMessage(message);
        setRefresh(r => r + 1);
        setView("list");
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setView("detail")
    };

    const handleUpload = async (id, file) => {
        await uploadSession(id, file);
    };

    const handleUploadFromDetail = async (id, file) => {
        await uploadSession(id, file);
        const updatedPatient = await getPatient(id);
        setSelectedPatient(updatedPatient);
    };

    const handleDeleteStudy = async (studyId) => {
        await deleteStudy(studyId);
        const updatedPatient = await getPatient(selectedPatient.id);
        setSelectedPatient(updatedPatient);
    };

    const handleUploadGlobal = async(file) => {
        await uploadGlobalSession(file);
    };

    const handleDelete = async(id) => {
        await deletePatient(id);
    };

    const handleStudyClick = (study) => {
        setSelectedStudy(study);
        setView("studyDetail");
    };

    const handleEdit = (patient) => {
        setSelectedPatient(patient)
        setView("edit")
    }

    const handlePatientEdited = (message) => {
        setSuccessMessage(message);
        setRefresh(r => r + 1); // fuerza recarga de la lista
        setView("list");
    };

    return (
        <div>
            <Navbar view={view} setView={setView} />

            {view === "list" && <PatientList key={refresh} successMessage={successMessage}
                                             onSuccessMessageShown={() => setSuccessMessage(null)}
                                             onNewPatientClicked={() => setView("form")}
                                             onPatientClicked={handlePatientClick} onUploadClicked={handleUpload}
                                             onUploadGlobalClicked={handleUploadGlobal} onDeleteClicked={handleDelete}
                                             onEditClicked={handleEdit}/>}

            {view === "form" && <PatientForm onPatientCreated={handlePatientCreated} />}
            {view === "detail" && <PatientDetail patient={selectedPatient} onEditClicked={handleEdit} onUploadClicked={handleUploadFromDetail} onDeleteStudyClicked={handleDeleteStudy} onStudyClicked={handleStudyClick} />}
            {view === "edit" && <PatientEdit patient={selectedPatient} onPatientEdited={handlePatientEdited}/>}
            {view === "studyDetail" && <StudyDetail study={selectedStudy} onBackClicked={() => setView("detail")} />}
        </div>
    );
}

export default App;