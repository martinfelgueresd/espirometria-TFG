import { useState } from "react";
import { editPatient } from "../../services/patientService";

function PatientEdit({ patient, onPatientEdited }) {
    const [form, setForm] = useState({
        personalId: patient.personalId,
        name: patient.name,
        surname: patient.surname,
        birth_date: patient.birth_date,
        gender: patient.gender,
        height: patient.height,
        weight: patient.weight,
        smoker: patient.smoker,
        ethnic_group: patient.ethnic_group
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await editPatient(form, patient.id);
        onPatientEdited("Paciente editado correctamente.");
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-2">Editar Paciente</h1>
            <p className="text-center text-sm text-gray-500 mb-8">Rellena la información del paciente debajo</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nombre</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-100 text-sm text-gray-400 cursor-not-allowed" name="name" value={form.name} disabled/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Apellidos</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-100 text-sm text-gray-400 cursor-not-allowed" name="surname" value={form.surname} disabled/>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">DNI</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-100 text-sm text-gray-400 cursor-not-allowed" name="personalId" value={form.personalId} disabled/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Fecha Nacimiento</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-100 text-sm text-gray-400 cursor-not-allowed" name="birth_date" type="date" value={form.birth_date} disabled/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Género</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-100 text-sm text-gray-400 cursor-not-allowed" name="gender" value={form.gender} disabled>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Altura (cm)</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="height" type="number" value={form.height} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Peso (kg)</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="weight" type="number" value={form.weight} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Fumador</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="smoker" value={form.smoker} onChange={handleChange} required>
                                <option value="true">Sí</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Grupo Étnico</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="ethnic_group" value={form.ethnic_group} onChange={handleChange} required>
                                <option value="caucasian">Caucásico</option>
                                <option value="african_american">Afroamericano</option>
                                <option value="asian">Asiático</option>
                                <option value="hispanic">Hispano</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                        Actualizar Paciente
                    </button>

                </div>
            </form>
        </div>
    );
}

export default PatientEdit;