// Alex_fit/src/pages/Dashboard/Nutricion.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
import ComidaForm from "../../components/forms/ComidaForm.jsx";

export default function Nutricion() {
    const { user } = useContext(AuthContext);
    const [datos, setDatos] = useState(null);
    const [comidas, setComidas] = useState([]);
    const [nuevoDia, setNuevoDia] = useState("");
    const [activeTab, setActiveTab] = useState("progreso");

    // Traer datos del usuario
    useEffect(() => {
        if (!user) return;

        const fetchDatos = async () => {
            const { data, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("auth_id", user.id)
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
                .order("dia", { ascending: false });

            if (!error) setComidas(data);
            else console.log("Error al traer comidas:", error.message);
        };

        fetchComidas();
    }, [user]);

    if (!user || !datos) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Cargando tus datos...</p>
                </div>
            </div>
        );
    }

    // Usar los cálculos que ya vienen de la base de datos
    const {
        calorias_objetivo = 2000,
        proteinas_objetivo = 150,
        carbohidratos_objetivo = 250,
        grasas_objetivo = 70
    } = datos;

    // Calcular totales consumidos
    const totales = comidas.reduce(
        (acc, comida) => {
            acc.calorias += parseFloat(comida.calorias || 0);
            acc.proteina += parseFloat(comida.proteina || 0);
            acc.carbohidratos += parseFloat(comida.carbohidratos || 0);
            acc.grasas += parseFloat(comida.grasas || 0);
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
            setComidas([data, ...comidas]);
            setNuevoDia("");
            setActiveTab("registro");
        } else {
            console.log("Error al crear nueva comida:", error.message);
        }
    };

    // Obtener comidas de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const comidasHoy = comidas.filter(comida => comida.dia === hoy);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900 text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                        Tu Nutrición
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Controla tus macros y alcanza tus objetivos de forma inteligente
                    </p>
                </div>

                {/* Tabs de Navegación */}
                <div className="flex space-x-4 mb-8 justify-center">
                    <button
                        onClick={() => setActiveTab("progreso")}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                            activeTab === "progreso" 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                    >
                        📊 Progreso Diario
                    </button>
                    <button
                        onClick={() => setActiveTab("registro")}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                            activeTab === "registro" 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                    >
                        🍽️ Registrar Comidas
                    </button>
                    <button
                        onClick={() => setActiveTab("objetivos")}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                            activeTab === "objetivos" 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                    >
                        🎯 Mis Objetivos
                    </button>
                </div>

                {/* Panel de Progreso */}
                {activeTab === "progreso" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* Tarjeta de Progreso Principal */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                <h2 className="text-2xl font-bold">Progreso de Hoy</h2>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Calorías */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                                        <span>🔥 Calorías</span>
                                        <span>{Math.round(totales.calorias)} / {calorias_objetivo} kcal</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div 
                                            className="bg-gradient-to-r from-emerald-400 to-green-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-400/25"
                                            style={{ width: `${porcentaje(totales.calorias, calorias_objetivo)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Proteínas */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                                        <span>💪 Proteínas</span>
                                        <span>{Math.round(totales.proteina)} / {proteinas_objetivo} g</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div 
                                            className="bg-gradient-to-r from-blue-400 to-cyan-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-400/25"
                                            style={{ width: `${porcentaje(totales.proteina, proteinas_objetivo)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Carbohidratos */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                                        <span>🍞 Carbohidratos</span>
                                        <span>{Math.round(totales.carbohidratos)} / {carbohidratos_objetivo} g</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div 
                                            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-yellow-400/25"
                                            style={{ width: `${porcentaje(totales.carbohidratos, carbohidratos_objetivo)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Grasas */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                                        <span>🥑 Grasas</span>
                                        <span>{Math.round(totales.grasas)} / {grasas_objetivo} g</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4">
                                        <div 
                                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-purple-400/25"
                                            style={{ width: `${porcentaje(totales.grasas, grasas_objetivo)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Resumen */}
                        <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-center">Resumen del Día</h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-emerald-400">{comidasHoy.length}</div>
                                    <div className="text-gray-400 text-sm">Comidas Hoy</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">{Math.round(totales.calorias)}</div>
                                    <div className="text-gray-400 text-sm">Calorías</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-400">{Math.round(totales.proteina)}g</div>
                                    <div className="text-gray-400 text-sm">Proteína</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-400">{Math.round((totales.calorias/calorias_objetivo)*100)}%</div>
                                    <div className="text-gray-400 text-sm">Completado</div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-white/10 rounded-2xl">
                                <p className="text-sm text-center text-gray-300">
                                    {totales.calorias < calorias_objetivo * 0.8 
                                        ? "💪 ¡Sigue así! Todavía tienes espacio para más nutrientes." 
                                        : totales.calorias < calorias_objetivo
                                        ? "🎯 Perfecto, vas por buen camino."
                                        : "⚠️ Has superado tu objetivo. Considera ajustar las próximas comidas."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Registro de Comidas */}
                {activeTab === "registro" && (
                    <div className="max-w-4xl mx-auto">
                        {/* Agregar Nueva Comida */}
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-2xl">📅</span> Agregar Nuevo Día
                            </h2>
                            <div className="flex space-x-4">
                                <input
                                    type="date"
                                    value={nuevoDia}
                                    onChange={(e) => setNuevoDia(e.target.value)}
                                    className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-2xl flex-grow focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    placeholder="Selecciona una fecha"
                                />
                                <button
                                    onClick={agregarNuevaComida}
                                    className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
                                >
                                    + Agregar Día
                                </button>
                            </div>
                        </div>

                        {/* Lista de Comidas */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-2xl">🍽️</span> Historial de Comidas
                            </h2>
                            
                            {comidas.length === 0 ? (
                                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center">
                                    <div className="text-6xl mb-4">🍽️</div>
                                    <h3 className="text-xl font-semibold mb-2">No hay comidas registradas</h3>
                                    <p className="text-gray-400">Comienza agregando tu primer día de comidas arriba.</p>
                                </div>
                            ) : (
                                comidas.map((comida) => (
                                    <div key={comida.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                                        <h3 className="font-semibold text-lg mb-4 text-emerald-400">
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
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Mis Objetivos */}
                {activeTab === "objetivos" && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="text-2xl">🎯</span> Tus Objetivos Diarios
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold text-emerald-400 mb-2">{calorias_objetivo}</div>
                                    <div className="text-gray-400">Calorías Diarias</div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold text-blue-400 mb-2">{proteinas_objetivo}g</div>
                                    <div className="text-gray-400">Proteínas</div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold text-yellow-400 mb-2">{carbohidratos_objetivo}g</div>
                                    <div className="text-gray-400">Carbohidratos</div>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="text-3xl font-bold text-purple-400 mb-2">{grasas_objetivo}g</div>
                                    <div className="text-gray-400">Grasas</div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <h3 className="font-semibold mb-3 text-emerald-400">💡 Recomendación</h3>
                                <p className="text-gray-300 text-sm">
                                    Estos objetivos están calculados específicamente para tu metabolismo, nivel de actividad y metas. 
                                    Intenta mantenerte dentro de estos rangos para obtener los mejores resultados.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}