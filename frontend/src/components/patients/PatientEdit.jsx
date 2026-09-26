import { editPatient } from "../../services/patientService";
import { usePatientForm } from "../../hooks/usePatientForm.js";
import { useToast } from "../../hooks/useToast.js";
import Toast from "../common/Toast.jsx";
import FormField from "../common/FormField.jsx";
import FieldWrapper from "../common/FieldWrapper.jsx";
import Button from "../common/Button.jsx";
import { GENDER_OPTIONS, ETHNIC_GROUP_OPTIONS, SMOKER_OPTIONS } from "../../constants/patientOptions";

function PatientEdit({ patient, onPatientEdited }) {
    const { form, errors, shaking, handleChange, setErrors } = usePatientForm({
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
    const { toast, showToast, clearToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { height, weight, smoker, ethnic_group } = form;
            await editPatient({ height, weight, smoker, ethnic_group }, patient.id);
            onPatientEdited("Paciente editado correctamente.");
        } catch (error) {
            // Se marcan los campos con error (si los hay) y siempre se muestra el mensaje del error.
            setErrors(error.fieldErrors ?? {});
            showToast(error.message, "error");
        }
    };

    const inputClass = (field) =>
        `input-base ${errors[field] || shaking[field] ? "input-error" : ""} ${shaking[field] ? "shake" : ""}`;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <Toast message={toast?.message} type={toast?.type} onClose={clearToast} />

            <h1 className="text-3xl font-bold text-gray-800 text-center mt-8 mb-2">Editar Paciente</h1>
            <p className="text-center text-sm text-gray-500 mb-8">Rellena la información del paciente debajo</p>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">

                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Nombre">
                            <input className="input-base input-disabled" name="name" value={form.name} disabled/>
                        </FormField>
                        <FormField label="Apellidos">
                            <input className="input-base input-disabled" name="surname" value={form.surname} disabled/>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <FormField label="DNI">
                            <input className="input-base input-disabled" name="personalId" value={form.personalId} disabled/>
                        </FormField>
                        <FormField label="Fecha Nacimiento">
                            <input className="input-base input-disabled" name="birth_date" type="date" value={form.birth_date} disabled/>
                        </FormField>
                        <FormField label="Género">
                            <select className="input-base input-disabled" name="gender" value={form.gender} disabled>
                                {GENDER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
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

                    <Button type="submit" className="w-full">Actualizar Paciente</Button>

                </div>
            </form>
        </div>
    );
}

export default PatientEdit;