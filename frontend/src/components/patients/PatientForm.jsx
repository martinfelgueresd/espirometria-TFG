import { useState } from "react";
import { createPatient } from "../../services/patientService";
import {useToast} from "../../hooks/useToast.js";
import Toast from "../common/Toast.jsx";

function PatientForm({ onPatientCreated }) {
    const [form, setForm] = useState({
        personalId: "",
        name: "",
        surname: "",
        birth_date: "",
        gender: "F",
        height: "",
        weight: "",
        smoker: "false",
        ethnic_group: "caucasian"
    });
    const { toast, showToast, clearToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await createPatient(form);
            setForm({
                personalId: "",
                name: "",
                surname: "",
                birth_date: "",
                gender: "",
                height: "",
                weight: "",
                smoker: "",
                ethnic_group: "" });
            onPatientCreated(`Paciente ${form.name} ${form.surname} creado correctamente.`);
        }catch (error){
            showToast(error.message, "error");
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">

            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-2">Registro Nuevo Paciente</h1>
            <p className="text-center text-sm text-gray-500 mb-8">Rellena la información del paciente debajo</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">

                    {/* Fila 1: Nombre y Apellidos */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nombre</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="name" value={form.name} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Apellidos</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="surname" value={form.surname} onChange={handleChange} required/>
                        </div>
                    </div>

                    {/* Fila 2: DNI, Fecha Nacimiento y Género */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">DNI</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="personalId" value={form.personalId} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Fecha Nacimiento</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Género</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="gender" value={form.gender} onChange={handleChange} required>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 3: Altura, Peso y Fumador */}
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

                    {/* Fila 4: Grupo Étnico */}
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
                        Guardar Paciente
                    </button>

                </div>
            </form>
        </div>
    );
}

export default PatientForm;