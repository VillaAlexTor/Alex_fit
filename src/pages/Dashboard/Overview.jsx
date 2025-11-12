// Alex_fit/src/pages/Dashboard/Overview.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Overview() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [comidas, setComidas] = useState([]);
    const [rutinas, setRutinas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Datos del usuario
                const { data: userData } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("auth_id", user.id)
                    .single();

                // Comidas recientes
                const { data: comidasData } = await supabase
                    .from("comidas")
                    .select("*")
                    .eq("usuario_id", user.id)
                    .order("dia", { ascending: false })
                    .limit(5);

                // Rutinas recientes
                const { data: rutinasData } = await supabase
                    .from("rutinas")
                    .select("*")
                    .eq("usuario_id", user.id)
                    .order("fecha", { ascending: false })
                    .limit(3);

                setDatos(userData);
                setComidas(comidasData || []);
                setRutinas(rutinasData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (!datos) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se pudieron cargar los datos.</p>
            </div>
        );
    }

    // Cálculos para las métricas
    const hoy = new Date().toISOString().split('T')[0];
    const comidasHoy = comidas.filter(comida => comida.dia === hoy);
    const caloriasHoy = comidasHoy.reduce((sum, comida) => sum + (comida.calorias || 0), 0);
    const progresoCalorias = Math.round((caloriasHoy / (datos.calorias_objetivo || 2000)) * 100);

    const rutinasEstaSemana = rutinas.filter(rutina => {
        const fechaRutina = new Date(rutina.fecha);
        const unaSemanaAtras = new Date();
        unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
        return fechaRutina >= unaSemanaAtras;
    });

    return (
        <div className="min-h-full">
            {/* Header de Bienvenida */}
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    ¡Hola, {datos.nombre || user.email.split('@')[0]}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                    Aquí tienes un resumen de tu progreso y actividades recientes.
                </p>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Calorías Hoy */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Calorías Hoy</h3>
                        <span className="text-2xl">🔥</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                        {Math.round(caloriasHoy)} / {datos.calorias_objetivo || 2000}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, progresoCalorias)}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {progresoCalorias}% de tu objetivo
                    </p>
                </div>

                {/* Comidas Registradas */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Comidas Hoy</h3>
                        <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                        {comidasHoy.length}
                    </div>
                    <p className="text-sm text-gray-500">
                        {comidasHoy.length === 0 ? 'Aún no registras comidas hoy' : 'Comidas registradas'}
                    </p>
                </div>

                {/* Rutinas Esta Semana */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Entrenamientos</h3>
                        <span className="text-2xl">💪</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                        {rutinasEstaSemana.length}
                    </div>
                    <p className="text-sm text-gray-500">
                        Esta semana
                    </p>
                </div>

                {/* Objetivo */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">Tu Objetivo</h3>
                        <span className="text-2xl">🎯</span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 mb-2 capitalize">
                        {datos.objetivo || 'mantenimiento'}
                    </div>
                    <p className="text-sm text-gray-500">
                        {datos.meta_peso ? `Meta: ${datos.meta_peso}kg` : 'Sin meta específica'}
                    </p>
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div 
                    onClick={() => navigate("/app/nutricion")}
                    className="bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="text-3xl mb-3">🍎</div>
                    <h3 className="text-xl font-bold mb-2">Registrar Comida</h3>
                    <p className="text-emerald-100">Añade tu próxima comida y lleva el control de tus macros</p>
                </div>

                <div 
                    onClick={() => navigate("/app/rutina")}
                    className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="text-3xl mb-3">💪</div>
                    <h3 className="text-xl font-bold mb-2">Mi Rutina</h3>
                    <p className="text-blue-100">Consulta y modifica tu plan de entrenamiento</p>
                </div>

                <div 
                    onClick={() => navigate("/app/progreso")}
                    className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="text-3xl mb-3">📈</div>
                    <h3 className="text-xl font-bold mb-2">Ver Progreso</h3>
                    <p className="text-purple-100">Revisa tus estadísticas y evolución</p>
                </div>
            </div>

            {/* Contenido Reciente - Grid de 2 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comidas Recientes */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📅</span> Comidas Recientes
                    </h3>
                    
                    {comidas.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">🍽️</div>
                            <p className="text-gray-600 mb-4">Aún no tienes comidas registradas</p>
                            <button 
                                onClick={() => navigate("/app/nutricion")}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                            >
                                Registrar Primera Comida
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comidas.slice(0, 3).map((comida) => (
                                <div key={comida.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(comida.dia).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-600">{comida.calorias || 0} calorías</p>
                                    </div>
                                    <span className="text-lg">{comida.alimentos?.length || 0} alimentos</span>
                                </div>
                            ))}
                            <button 
                                onClick={() => navigate("/app/nutricion")}
                                className="w-full text-center text-emerald-600 font-semibold py-2 hover:text-emerald-700 transition-colors"
                            >
                                Ver todas las comidas →
                            </button>
                        </div>
                    )}
                </div>

                {/* Rutinas Recientes */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🏋️</span> Entrenamientos Recientes
                    </h3>
                    
                    {rutinas.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">💪</div>
                            <p className="text-gray-600 mb-4">Aún no tienes rutinas registradas</p>
                            <button 
                                onClick={() => navigate("/app/rutina")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Crear Primera Rutina
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rutinas.slice(0, 3).map((rutina) => (
                                <div key={rutina.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800 capitalize">{rutina.tipo}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(rutina.fecha).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        rutina.estado === 'completado' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {rutina.estado || 'pendiente'}
                                    </span>
                                </div>
                            ))}
                            <button 
                                onClick={() => navigate("/app/rutina")}
                                className="w-full text-center text-blue-600 font-semibold py-2 hover:text-blue-700 transition-colors"
                            >
                                Ver todas las rutinas →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}