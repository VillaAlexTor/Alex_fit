import React, { useState, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "../context/AuthContext.jsx";

    export default function RegistroDatos() {
        const { user } = useContext(AuthContext);

        const [nombre, setNombre] = useState("");
        const [peso, setPeso] = useState("");
        const [altura, setAltura] = useState("");
        const [grasa, setGrasa] = useState("");
        const [objetivo, setObjetivo] = useState("");
        const [mensaje, setMensaje] = useState("");

        const handleSubmit = async (e) => {
            e.preventDefault();

            if (!user) return setMensaje("Debes iniciar sesión primero.");

            const { data, error } = await supabase
            .from("usuarios")
            .upsert({
                id: user.id, // Usamos el id de Supabase para relacionar el usuario
                nombre,
                email: user.email,
                peso: parseFloat(peso),
                altura: parseFloat(altura),
                grasa: parseFloat(grasa),
                objetivo
            }, { onConflict: ["id"] }); // Si ya existe, actualiza

            if (error) {
            setMensaje(`Error: ${error.message}`);
            } else {
            setMensaje("Datos guardados correctamente ✅");
            }
        };

        return (
            <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Registro de Datos Físicos</h2>
            {mensaje && <p className="mb-4 text-green-600">{mensaje}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-2 border rounded"
                />
                <input
                type="number"
                placeholder="Peso (kg)"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full p-2 border rounded"
                />
                <input
                type="number"
                placeholder="Altura (cm)"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="w-full p-2 border rounded"
                />
                <input
                type="number"
                placeholder="% Grasa corporal"
                value={grasa}
                onChange={(e) => setGrasa(e.target.value)}
                className="w-full p-2 border rounded"
                />
                <select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="w-full p-2 border rounded"
                >
                <option value="">Selecciona tu objetivo</option>
                <option value="musculo">Ganar músculo</option>
                <option value="definicion">Definición / pérdida de grasa</option>
                <option value="recomposicion">Recomposición corporal</option>
                </select>
                <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                Guardar Datos
                </button>
            </form>
            </div>
        );
    }
