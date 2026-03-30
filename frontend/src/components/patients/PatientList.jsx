import { useEffect, useState } from "react";
import { getPatients, deletePatient } from "../../services/patientService";

function PatientList({ refresh }) {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        getPatients().then(data => setPatients(data));
    }, [refresh]); // se ejecuta cada vez que "refresh" cambia

    const handleDelete = async (id) => {
        await deletePatient(id);
        setPatients(patients.filter(p => p.id !== id));
    };

    return (
        <div>
            <h2>Pacientes</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Fecha nacimiento</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Altura</th>
                        <th>Peso</th>
                        <th>Fumador</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.birth_date}</td>
                            <td>{p.age}</td>
                            <td>{p.gender}</td>
                            <td>{p.height}</td>
                            <td>{p.weight}</td>
                            <td>{p.smoker ? "Sí" : "No"}</td>
                            <td>
                                <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PatientList;