import { useState } from "react";
import { createPatient } from "../../services/patientService";

function PatientForm({ onPatientCreated }) {
    const [form, setForm] = useState({
        personal_id: "",
        name: "",
        surname: "",
        birth_date: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
        smoker: "",
        ethnic_group: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createPatient(form);
        onPatientCreated();
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
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name</label>
                <input name="personal_id" placeholder="DNI" value={form.personal_id} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="name">Name</label>
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="surname">Surname</label>
                <input name="surname" placeholder="Surname" value={form.surname} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="birth_date">Date</label>
                <input name="birth_date" type="date" placeholder="Date" value={form.birth_date} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="age">Age</label>
                <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="gender">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="M"> Male </option>
                    <option value="F"> Female </option>
                </select>
            </div>
            <div>
                <label htmlFor="height">Height</label>
                <input name="height" type="number" placeholder="Height" value={form.height} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="weight">Weight</label>
                <input name="weight" type="number" placeholder="Weight" value={form.weight} onChange={handleChange} required/>
            </div>
            <div>
                <label htmlFor="smoker">Smoker</label>
                <select name="smoker" value={form.smoker} onChange={handleChange} required>
                    <option value="true"> Yes </option>
                    <option value ="false"> No </option>
                </select>
            </div>
            <div>
                <label htmlFor="ethnic_group">Ethnic group</label>
                <select name="ethnic_group" value={form.ethnic_group} onChange={handleChange} required>
                    <option value={"caucasian"}> Caucasian</option>
                    <option value={"african_american"}> African American</option>
                    <option value={"asian"}> Asian </option>
                    <option value={"hispanic"}> Hispanic </option>
                    <option value={"other"}> Other </option>
                </select>
            </div>
            <button type="submit">Guardar</button>
        </form>
    );
}

export default PatientForm;