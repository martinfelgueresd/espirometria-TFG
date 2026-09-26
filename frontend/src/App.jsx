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
    const [selectedStudyUUID, setSelectedStudyUUID] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handlePatientCreated = (message) => {
        setSuccessMessage(message);
        setView("list");
    };

    const handlePatientEdited = (message) => {
        setSuccessMessage(message);
        setView("list");
    };

    const handleStudyClick = (study) => {
        setSelectedStudyUUID(study.studyUUID);
        setView("studyDetail");
    };

    //El paciente que llega desde listado no es el paciente completo
    const handlePatientClick = async (patient) => {
        setSelectedPatient(await getPatient(patient.id));
        setView("detail");
    };

    const handleEdit = async (patient) => {
        setSelectedPatient(await getPatient(patient.id));
        setView("edit");
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

    return (
        <div>
            <Navbar view={view} setView={setView} />

            {view === "list" && <PatientList successMessage={successMessage}
                                             onSuccessMessageShown={() => setSuccessMessage(null)}
                                             onNewPatientClicked={() => setView("form")}
                                             onPatientClicked={handlePatientClick} 
                                             onUploadClicked={handleUpload}
                                             onUploadGlobalClicked={handleUploadGlobal} 
                                             onDeleteClicked={handleDelete}
                                             onEditClicked={handleEdit}/>}

            {view === "form" && <PatientForm onPatientCreated={handlePatientCreated} />}
            {view === "detail" && <PatientDetail patient={selectedPatient} onEditClicked={handleEdit} onUploadClicked={handleUploadFromDetail} onDeleteStudyClicked={handleDeleteStudy} onStudyClicked={handleStudyClick} />}
            {view === "edit" && <PatientEdit patient={selectedPatient} onPatientEdited={handlePatientEdited}/>}
            {view === "studyDetail" && <StudyDetail studyUUID={selectedStudyUUID} onBackClicked={() => setView("detail")} />}
        </div>
    );
}

export default App;