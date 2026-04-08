import { useState } from "react";
import PatientForm from "./components/patients/PatientForm";
import PatientList from "./components/patients/PatientList";
import Navbar from "./components/layout/Navbar.jsx"
import PatientDetail from "./components/patients/PatientDetail.jsx";

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

    return (
        <div>
            <Navbar view={view} setView={setView} />
            {view === "list" && <PatientList key={refresh} onPatientClicked={handlePatientClick}/>}
            {view === "form" && <PatientForm onPatientCreated={handlePatientCreated} />}
            {view === "detail" && <PatientDetail patient={selectedPatient} />}
        </div>
    );
}

export default App;