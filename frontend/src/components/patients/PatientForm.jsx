import { useState } from "react";
import { createPatient } from "../../services/patientService";

function PatientForm({ onPatientCreated }) {
    const [form, setForm] = useState({
        personal_id: "",
        name: "",
        surname: "",
        birth_date: "",
        age: "",
        gender: "F",
        height: "",
        weight: "",
        smoker: "false",
        ethnic_group: "caucasian"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createPatient(form);
        setForm({
            personal_id: "",
            name: "",
            surname: "",
            birth_date: "",
            age: "",
            gender: "",
            height: "",
            weight: "",
            smoker: "",
            ethnic_group: "" });
        onPatientCreated();
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">

            <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-2">Registro Nuevo Paciente</h1>
            <p className="text-center text-sm text-gray-500 mb-8">Rellena la información del paciente debajo</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">

                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="name">Nombre</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="name" value={form.name} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="surname">Apellidos</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="surname" value={form.surname} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="personal_id">DNI</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="personal_id" value={form.personal_id} onChange={handleChange} required/>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="birth_date">Fecha Nacimiento</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="age">Edad</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="age" type="number" value={form.age} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="gender">Género</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="gender" value={form.gender} onChange={handleChange} required>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="height">Altura</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="height" type="number" value={form.height} onChange={handleChange} required/>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="weight">Peso</label>
                            <input className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="weight" type="number" value={form.weight} onChange={handleChange} required/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="smoker">Fumador</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="smoker" value={form.smoker} onChange={handleChange} required>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700" htmlFor="ethnic_group">Grupo Étnico</label>
                            <select className="border border-gray-200 rounded-lg px-3 h-9 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" name="ethnic_group" value={form.ethnic_group} onChange={handleChange} required>
                                <option value="caucasian">Caucasian</option>
                                <option value="african_american">African American</option>
                                <option value="asian">Asian</option>
                                <option value="hispanic">Hispanic</option>
                                <option value="other">Other</option>
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