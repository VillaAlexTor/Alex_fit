/* Alex_fit/src/pages/Dashboard/Rutina.jsx */
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
import EjercicioForm from "../../components/forms/EjercicioForm.jsx";

export default function Rutina() {
    const { user } = useContext(AuthContext);
    const [rutina, setRutina] = useState([]);

    // Traer la rutina del usuario
    useEffect(() => {
        if (!user) return;

        const fetchRutina = async () => {
            const { data, error } = await supabase
                .from("rutinas")
                .select("*")
                .eq("usuario_id", user.id)
                .order("fecha", { ascending: true });

            if (!error) setRutina(data);
            else console.log("Error al traer rutina:", error.message);
        };

        fetchRutina();
    }, [user]);

    // Marcar ejercicio como completado
    const toggleEjercicio = async (diaId, index) => {
        const nuevaRutina = [...rutina];
        const ejercicio = nuevaRutina.find((r) => r.id === diaId);
        if (!ejercicio) return;

        // Cambiar el estado del ejercicio
        ejercicio.ejercicios[index].estado =
            ejercicio.ejercicios[index].estado === "hecho" ? "pendiente" : "hecho";

        // Guardar en Supabase
        const { error } = await supabase
            .from("rutinas")
            .update({ ejercicios: ejercicio.ejercicios })
            .eq("id", diaId);

        if (!error) setRutina(nuevaRutina);
    };

    if (!user) return <p>Cargando usuario...</p>;
    if (!rutina.length) return <p>No tienes rutinas asignadas aún.</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Rutina Semanal</h1>
            {rutina.map((dia) => (
                <div key={dia.id} className="mb-6 bg-white p-4 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">{dia.dia}</h2>

                    <table className="w-full table-auto border-collapse mb-4">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1">Ejercicio</th>
                                <th className="border px-2 py-1">Reps</th>
                                <th className="border px-2 py-1">Peso</th>
                                <th className="border px-2 py-1">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dia.ejercicios.map((e, index) => (
                                <tr key={index}>
                                    <td className="border px-2 py-1">{e.nombre}</td>
                                    <td className="border px-2 py-1">{e.reps}</td>
                                    <td className="border px-2 py-1">{e.peso}</td>
                                    <td
                                        className={`border px-2 py-1 cursor-pointer ${
                                            e.estado === "hecho"
                                                ? "bg-green-200 text-green-800"
                                                : "bg-red-200 text-red-800"
                                        }`}
                                        onClick={() => toggleEjercicio(dia.id, index)}
                                    >
                                        {e.estado}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Formulario para agregar/editar ejercicios */}
                    <EjercicioForm
                        diaId={dia.id}
                        ejerciciosActuales={dia.ejercicios}
                        onUpdate={(nuevaLista) => {
                            const nuevaRutina = [...rutina];
                            const indexDia = nuevaRutina.findIndex((r) => r.id === dia.id);
                            if (indexDia !== -1) {
                                nuevaRutina[indexDia].ejercicios = nuevaLista;
                                setRutina(nuevaRutina);
                            }
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
