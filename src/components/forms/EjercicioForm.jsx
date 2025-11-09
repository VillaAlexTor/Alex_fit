import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function EjercicioForm({ diaId, ejerciciosActuales, onUpdate }) {
    const [ejercicios, setEjercicios] = useState(ejerciciosActuales || []);
    const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: "", reps: "", peso: "" });

    // Agregar nuevo ejercicio
    const agregarEjercicio = async () => {
        if (!nuevoEjercicio.nombre) return;

        const nuevaLista = [...ejercicios, { ...nuevoEjercicio, estado: "pendiente" }];

        const { error } = await supabase
            .from("rutinas")
            .update({ ejercicios: nuevaLista })
            .eq("id", diaId);

        if (!error) {
            setEjercicios(nuevaLista);
            onUpdate(nuevaLista);
            setNuevoEjercicio({ nombre: "", reps: "", peso: "" });
        }
    };

    // Editar ejercicio
    const editarEjercicio = async (index, campo, valor) => {
        const nuevaLista = [...ejercicios];
        nuevaLista[index][campo] = valor;

        const { error } = await supabase
            .from("rutinas")
            .update({ ejercicios: nuevaLista })
            .eq("id", diaId);

        if (!error) {
            setEjercicios(nuevaLista);
            onUpdate(nuevaLista);
        }
    };

    // Eliminar ejercicio
    const eliminarEjercicio = async (index) => {
        const nuevaLista = ejercicios.filter((_, i) => i !== index);

        const { error } = await supabase
            .from("rutinas")
            .update({ ejercicios: nuevaLista })
            .eq("id", diaId);

        if (!error) {
            setEjercicios(nuevaLista);
            onUpdate(nuevaLista);
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded shadow">
            <h3 className="font-semibold mb-2">Agregar / Editar ejercicios</h3>

            {/* Formulario para agregar */}
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="Nombre"
                    className="border px-2 py-1 rounded flex-1"
                    value={nuevoEjercicio.nombre}
                    onChange={(e) => setNuevoEjercicio({ ...nuevoEjercicio, nombre: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Reps"
                    className="border px-2 py-1 rounded w-20"
                    value={nuevoEjercicio.reps}
                    onChange={(e) => setNuevoEjercicio({ ...nuevoEjercicio, reps: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Peso"
                    className="border px-2 py-1 rounded w-20"
                    value={nuevoEjercicio.peso}
                    onChange={(e) => setNuevoEjercicio({ ...nuevoEjercicio, peso: e.target.value })}
                />
                <button
                    onClick={agregarEjercicio}
                    className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
                >
                    +
                </button>
            </div>

            {/* Lista de ejercicios existentes */}
            {ejercicios.map((e, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                        type="text"
                        value={e.nombre}
                        onChange={(ev) => editarEjercicio(index, "nombre", ev.target.value)}
                        className="border px-2 py-1 rounded flex-1"
                    />
                    <input
                        type="number"
                        value={e.reps}
                        onChange={(ev) => editarEjercicio(index, "reps", ev.target.value)}
                        className="border px-2 py-1 rounded w-20"
                    />
                    <input
                        type="number"
                        value={e.peso}
                        onChange={(ev) => editarEjercicio(index, "peso", ev.target.value)}
                        className="border px-2 py-1 rounded w-20"
                    />
                    <button
                        onClick={() => eliminarEjercicio(index)}
                        className="bg-red-600 text-white px-3 rounded hover:bg-red-700"
                    >
                        🗑️
                    </button>
                </div>
            ))}
        </div>
    );
}
