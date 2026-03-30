import { useState } from "react";
import PatientForm from "./components/patients/PatientForm";
import PatientList from "./components/patients/PatientList";

function App() {
    const [refresh, setRefresh] = useState(0);

    const handlePatientCreated = () => {
        setRefresh(r => r + 1); // fuerza recarga de la lista
    };

    return (
        <div>
            <h1>Crea un nuevo paciente</h1>
            <PatientForm onPatientCreated={handlePatientCreated} />
        </div>
    );
}

export default App;