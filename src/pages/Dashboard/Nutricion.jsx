/* Alex_fit/src/pages/Dashboard/Nutricion.jsx */
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
import ComidaForm from "../../components/forms/ComidaForm.jsx";

export default function Nutricion() {
    const { user } = useContext(AuthContext);
    const [datos, setDatos] = useState(null);
    const [comidas, setComidas] = useState([]);
    const [nuevoDia, setNuevoDia] = useState("");

    // Traer datos del usuario (peso, altura, grasa, objetivo)
    useEffect(() => {
        if (!user) return;

        const fetchDatos = async () => {
            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) console.log("Error al traer datos:", error.message);
            else setDatos(data);
        };

        fetchDatos();
    }, [user]);

    // Traer comidas del usuario
    useEffect(() => {
        if (!user) return;

        const fetchComidas = async () => {
            const { data, error } = await supabase
                .from("comidas")
                .select("*")
                .eq("usuario_id", user.id)
                .order("dia", { ascending: true });

            if (!error) setComidas(data);
            else console.log("Error al traer comidas:", error.message);
        };

        fetchComidas();
    }, [user]);

    if (!user || !datos) return <p>Cargando datos...</p>;

    // Cálculos de calorías y macros personalizadas
    const { peso, altura, grasa, objetivo } = datos;
    const tmb = 10 * peso + 6.25 * altura - 5 * 20 + 5; // Hombre 20 años de ejemplo
    let caloriasObjetivo = tmb * 1.55; // factor actividad moderada

    if (objetivo === "musculo") caloriasObjetivo += 250; // superávit
    if (objetivo === "definicion") caloriasObjetivo -= 250; // déficit

    const proteinaObjetivo = peso * 2;
    const grasasObjetivo = (caloriasObjetivo * 0.25) / 9;
    const carbsObjetivo = (caloriasObjetivo - proteinaObjetivo * 4 - grasasObjetivo * 9) / 4;

    // Calcular totales consumidos
    const totales = comidas.reduce(
        (acc, comida) => {
            comida.alimentos?.forEach((item) => {
                acc.calorias += parseFloat(item.calorias || 0);
                acc.proteina += parseFloat(item.proteina || 0);
                acc.carbohidratos += parseFloat(item.carbohidratos || 0);
                acc.grasas += parseFloat(item.grasas || 0);
            });
            return acc;
        },
        { calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
    );

    // Función para calcular porcentaje
    const porcentaje = (consumido, objetivo) =>
        Math.min(100, Math.round((consumido / objetivo) * 100));

    // Crear nueva comida
    const agregarNuevaComida = async () => {
        if (!nuevoDia) return;

        const { data, error } = await supabase
            .from("comidas")
            .insert([
                {
                    usuario_id: user.id,
                    dia: nuevoDia,
                    comida: "Desayuno",
                    alimentos: [],
                    calorias: 0,
                    proteina: 0,
                    carbohidratos: 0,
                    grasas: 0,
                },
            ])
            .select()
            .single();

        if (!error) {
            setComidas([...comidas, data]);
            setNuevoDia("");
        } else {
            console.log("Error al crear nueva comida:", error.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Nutrición Personalizada</h1>

            {/* Objetivos diarios */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Objetivos Diarios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p>Calorías: {Math.round(caloriasObjetivo)} kcal</p>
                    <p>Proteínas: {Math.round(proteinaObjetivo)} g</p>
                    <p>Carbohidratos: {Math.round(carbsObjetivo)} g</p>
                    <p>Grasas: {Math.round(grasasObjetivo)} g</p>
                </div>
            </div>

            {/* Progreso diario */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Progreso Diario</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Calorías</span>
                            <span>{Math.round(totales.calorias)} / {Math.round(caloriasObjetivo)} kcal</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${porcentaje(totales.calorias, caloriasObjetivo)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Proteínas</span>
                            <span>{Math.round(totales.proteina)} / {Math.round(proteinaObjetivo)} g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${porcentaje(totales.proteina, proteinaObjetivo)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Carbohidratos</span>
                            <span>{Math.round(totales.carbohidratos)} / {Math.round(carbsObjetivo)} g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${porcentaje(totales.carbohidratos, carbsObjetivo)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Grasas</span>
                            <span>{Math.round(totales.grasas)} / {Math.round(grasasObjetivo)} g</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${porcentaje(totales.grasas, grasasObjetivo)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agregar nueva comida */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Agregar Nueva Comida</h2>
                <div className="flex space-x-2">
                    <input
                        type="date"
                        value={nuevoDia}
                        onChange={(e) => setNuevoDia(e.target.value)}
                        className="border p-2 rounded-lg flex-grow"
                    />
                    <button
                        onClick={agregarNuevaComida}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Agregar
                    </button>
                </div>
            </div>

            {/* Lista de comidas */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold">Registro de Comidas</h2>
                {comidas.length === 0 && (
                    <p className="text-gray-500">No tienes comidas registradas aún.</p>
                )}
                {comidas.map((comida) => (
                    <div key={comida.id} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-4">
                            {new Date(comida.dia).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h3>
                        <ComidaForm
                            diaId={comida.id}
                            alimentosActuales={comida.alimentos}
                            onUpdate={(nuevaLista) => {
                                const nuevasComidas = [...comidas];
                                const index = nuevasComidas.findIndex((c) => c.id === comida.id);
                                if (index !== -1) {
                                    nuevasComidas[index].alimentos = nuevaLista;
                                    setComidas(nuevasComidas);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
