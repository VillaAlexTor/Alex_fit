// Alex_fit/src/pages/Dashboard/Nutricion.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
import ComidaForm from "../../components/forms/ComidaForm.jsx";
import { useNavigate } from "react-router-dom";

export default function Nutricion() {
    const { user } = useContext(AuthContext);
    const [datos, setDatos] = useState(null);
    const [comidas, setComidas] = useState([]);
    const [nuevoDia, setNuevoDia] = useState("");
    const [activeTab, setActiveTab] = useState("progreso");
    const navigate = useNavigate();

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
        <div className="min-h-full">
            {/* Header unificado con el botón de volver */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Tu Nutrición
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Controla tus macros y alcanza tus objetivos de forma inteligente
                    </p>
                </div>
                
                <button
                    onClick={() => navigate("/")}
                    className="self-start sm:self-center bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                    <span>←</span>
                    Volver al Inicio
                </button>
            </div>

            {/* Tabs de Navegación */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab("progreso")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === "progreso" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    📊 Progreso Diario
                </button>
                <button
                    onClick={() => setActiveTab("registro")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === "registro" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    🍽️ Registrar Comidas
                </button>
                <button
                    onClick={() => setActiveTab("objetivos")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        activeTab === "objetivos" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    🎯 Mis Objetivos
                </button>
            </div>

            {/* Panel de Progreso */}
            {activeTab === "progreso" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tarjeta de Progreso Principal */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-800">Progreso de Hoy</h2>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Calorías */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>🔥 Calorías</span>
                                    <span>{Math.round(totales.calorias)} / {calorias_objetivo} kcal</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${porcentaje(totales.calorias, calorias_objetivo)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Proteínas */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>💪 Proteínas</span>
                                    <span>{Math.round(totales.proteina)} / {proteinas_objetivo} g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${porcentaje(totales.proteina, proteinas_objetivo)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Carbohidratos */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>🍞 Carbohidratos</span>
                                    <span>{Math.round(totales.carbohidratos)} / {carbohidratos_objetivo} g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${porcentaje(totales.carbohidratos, carbohidratos_objetivo)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Grasas */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                    <span>🥑 Grasas</span>
                                    <span>{Math.round(totales.grasas)} / {grasas_objetivo} g</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${porcentaje(totales.grasas, grasas_objetivo)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Resumen */}
                    <div className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold mb-6 text-center">Resumen del Día</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{comidasHoy.length}</div>
                                <div className="text-emerald-100 text-sm">Comidas Hoy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Math.round(totales.calorias)}</div>
                                <div className="text-emerald-100 text-sm">Calorías</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Math.round(totales.proteina)}g</div>
                                <div className="text-emerald-100 text-sm">Proteína</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{Math.round((totales.calorias/calorias_objetivo)*100)}%</div>
                                <div className="text-emerald-100 text-sm">Completado</div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-white/20 rounded-xl">
                            <p className="text-sm text-center">
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
                <div className="space-y-6">
                    {/* Agregar Nueva Comida */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                            <span className="text-xl">📅</span> Agregar Nuevo Día
                        </h2>
                        <div className="flex space-x-4">
                            <input
                                type="date"
                                value={nuevoDia}
                                onChange={(e) => setNuevoDia(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="Selecciona una fecha"
                            />
                            <button
                                onClick={agregarNuevaComida}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                            >
                                + Agregar Día
                            </button>
                        </div>
                    </div>

                    {/* Lista de Comidas */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="text-xl">🍽️</span> Historial de Comidas
                        </h2>
                        
                        {comidas.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                                <div className="text-4xl mb-3">🍽️</div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-800">No hay comidas registradas</h3>
                                <p className="text-gray-600">Comienza agregando tu primer día de comidas arriba.</p>
                            </div>
                        ) : (
                            comidas.map((comida) => (
                                <div key={comida.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                                    <h3 className="font-semibold text-lg mb-4 text-emerald-600">
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
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="text-xl">🎯</span> Tus Objetivos Diarios
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">{calorias_objetivo}</div>
                            <div className="text-gray-600 text-sm">Calorías</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600 mb-1">{proteinas_objetivo}g</div>
                            <div className="text-gray-600 text-sm">Proteínas</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-600 mb-1">{carbohidratos_objetivo}g</div>
                            <div className="text-gray-600 text-sm">Carbohidratos</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600 mb-1">{grasas_objetivo}g</div>
                            <div className="text-gray-600 text-sm">Grasas</div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="font-semibold mb-2 text-blue-800">💡 Recomendación</h3>
                        <p className="text-gray-700 text-sm">
                            Estos objetivos están calculados específicamente para tu metabolismo, nivel de actividad y metas. 
                            Intenta mantenerte dentro de estos rangos para obtener los mejores resultados.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}