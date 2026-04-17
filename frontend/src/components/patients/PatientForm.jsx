import { createPatient } from "../../services/patientService";
import { useToast } from "../../hooks/useToast.js";
import { usePatientForm } from "../../hooks/usePatientForm.js";
import Toast from "../common/Toast.jsx";
import FormField from "../common/FormField.jsx";
import FieldWrapper from "../common/FieldWrapper.jsx";
import Button from "../common/Button.jsx";
import { GENDER_OPTIONS, ETHNIC_GROUP_OPTIONS, SMOKER_OPTIONS } from "../../constants/patientOptions";

const INITIAL_VALUES = {
    personalId: "",
    name: "",
    surname: "",
    birth_date: "",
    gender: "F",
    height: 170,
    weight: 80,
    smoker: "false",
    ethnic_group: "caucasian"
};

function PatientForm({ onPatientCreated }) {
    const { form, errors, shaking, handleChange, setErrors, resetForm } = usePatientForm(INITIAL_VALUES);
    const { toast, clearToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPatient(form);
            onPatientCreated(`Paciente ${form.name} ${form.surname} creado correctamente.`);
            resetForm();
        } catch (errors) {
            setErrors(errors);
        }
    };

    const inputClass = (field) =>
        `input-base ${errors[field] || shaking[field] ? "input-error" : ""} ${shaking[field] ? "shake" : ""}`;

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="p-6 max-w-3xl mx-auto">

            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-2">Registro Nuevo Paciente</h1>
            <p className="text-center text-sm text-gray-500 mb-8">Rellena la información del paciente debajo</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">

                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Nombre">
                            <FieldWrapper field="name" errors={errors}>
                                <input className={inputClass("name")} name="name" value={form.name} onChange={handleChange} required/>
                            </FieldWrapper>
                        </FormField>
                        <FormField label="Apellidos">
                            <FieldWrapper field="surname" errors={errors}>
                                <input className={inputClass("surname")} name="surname" value={form.surname} onChange={handleChange} required/>
                            </FieldWrapper>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <FormField label="DNI">
                            <FieldWrapper field="personalId" errors={errors}>
                                <input className={inputClass("personalId")} name="personalId" value={form.personalId} onChange={handleChange} required/>
                            </FieldWrapper>
                        </FormField>
                        <FormField label="Fecha Nacimiento">
                            <FieldWrapper field="birthDate" errors={errors}>
                                <input
                                    className={inputClass("birthDate")}
                                    name="birth_date"
                                    type="date"
                                    value={form.birth_date}
                                    onChange={handleChange}
                                    onKeyDown={(e) => e.preventDefault()}
                                    max={today}
                                    required
                                />
                            </FieldWrapper>
                        </FormField>
                        <FormField label="Género">
                            <FieldWrapper field="gender" errors={errors}>
                                <select className={inputClass("gender")} name="gender" value={form.gender} onChange={handleChange} required>
                                    {GENDER_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FieldWrapper>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <FormField label="Altura (cm)">
                            <FieldWrapper field="height" errors={errors}>
                                <input
                                    className={inputClass("height")}
                                    name="height"
                                    type="number"
                                    min="50"
                                    max="250"
                                    value={form.height}
                                    onChange={handleChange}
                                    onKeyDown={(e) => e.preventDefault()}
                                    required
                                />
                            </FieldWrapper>
                        </FormField>
                        <FormField label="Peso (kg)">
                            <FieldWrapper field="weight" errors={errors}>
                                <input
                                    className={inputClass("weight")}
                                    name="weight"
                                    type="number"
                                    min="10"
                                    max="300"
                                    value={form.weight}
                                    onChange={handleChange}
                                    onKeyDown={(e) => e.preventDefault()}
                                    required
                                />
                            </FieldWrapper>
                        </FormField>
                        <FormField label="Fumador">
                            <FieldWrapper field="smoker" errors={errors}>
                                <select className={inputClass("smoker")} name="smoker" value={form.smoker} onChange={handleChange} required>
                                    {SMOKER_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FieldWrapper>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <FormField label="Grupo Étnico">
                            <FieldWrapper field="ethnicGroup" errors={errors}>
                                <select className={inputClass("ethnicGroup")} name="ethnic_group" value={form.ethnic_group} onChange={handleChange} required>
                                    {ETHNIC_GROUP_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </FieldWrapper>
                        </FormField>
                    </div>

                    <Button type="submit" className="w-full">Guardar Paciente</Button>

                </div>
            </form>
        </div>
    );
}

export default PatientForm;