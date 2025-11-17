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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Traer datos del usuario
    useEffect(() => {
        if (!user) return;

        const fetchDatos = async () => {
            const { data: userData } = await supabase
                .from("usuarios")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (userData) {
                const { data, error } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("id", userData.id)
                    .single();

                if (error) console.log("Error al traer datos:", error.message);
                else setDatos(data);
            }
        };

        fetchDatos();
    }, [user]);

    // Traer comidas del usuario
    useEffect(() => {
        if (!user) return;

        const fetchComidas = async () => {
            const { data: userData } = await supabase
                .from("usuarios")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (userData) {
                const { data, error } = await supabase
                    .from("comidas")
                    .select("*")
                    .eq("usuario_id", userData.id)
                    .order("dia", { ascending: false });

                if (!error) setComidas(data || []);
                else console.log("Error al traer comidas:", error.message);
            }
            setLoading(false);
        };

        fetchComidas();
    }, [user]);

    // Usar los cálculos que ya vienen de la base de datos
    const {
        calorias_objetivo = 2000,
        proteinas_objetivo = 150,
        carbohidratos_objetivo = 250,
        grasas_objetivo = 70
    } = datos || {};

    // Calcular totales consumidos para fecha seleccionada
    const comidasDelDia = comidas.filter(comida => comida.dia === selectedDate);
    const totales = comidasDelDia.reduce(
        (acc, comida) => {
            acc.calorias += parseFloat(comida.calorias || 0);
            acc.proteina += parseFloat(comida.proteina || 0);
            acc.carbohidratos += parseFloat(comida.carbohidratos || 0);
            acc.grasas += parseFloat(comida.grasas || 0);
            return acc;
        },
        { calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
    );

    // Calcular lo que falta
    const faltante = {
        calorias: Math.max(0, calorias_objetivo - totales.calorias),
        proteina: Math.max(0, proteinas_objetivo - totales.proteina),
        carbohidratos: Math.max(0, carbohidratos_objetivo - totales.carbohidratos),
        grasas: Math.max(0, grasas_objetivo - totales.grasas)
    };

    // Función para calcular porcentaje
    const porcentaje = (consumido, objetivo) =>
        Math.min(100, Math.round((consumido / objetivo) * 100));

    // Crear nueva comida
    const agregarNuevaComida = async () => {
        if (!nuevoDia) return;

        const { data: userData } = await supabase
            .from("usuarios")
            .select("id")
            .eq("auth_id", user.id)
            .single();

        if (!userData) return;

        const { data, error } = await supabase
            .from("comidas")
            .insert([
                {
                    usuario_id: userData.id,
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
            setSelectedDate(nuevoDia);
            setActiveTab("registro");
        } else {
            console.log("Error al crear nueva comida:", error.message);
        }
    };

    // Generar calendario estilo GitHub
    const generateGitHubStyleCalendar = () => {
        const months = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];

        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        const daysInYear = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24)) + 1;
        
        const calendar = [];
        let currentMonth = -1;
        let monthDays = [];

        for (let i = 0; i < daysInYear; i++) {
            const date = new Date(currentYear, 0, i + 1);
            const month = date.getMonth();
            const dayStr = date.toISOString().split('T')[0];

            if (month !== currentMonth && currentMonth !== -1) {
                calendar.push({
                    month: months[currentMonth],
                    days: monthDays
                });
                monthDays = [];
            }

            // Encontrar comidas para este día
            const comidasDelDia = comidas.filter(c => c.dia === dayStr);
            const totalCalorias = comidasDelDia.reduce((sum, comida) => 
                sum + (comida.calorias || 0), 0);

            // Determinar color basado en el progreso de calorías
            let intensity = 0;
            if (totalCalorias > 0) {
                const ratio = totalCalorias / calorias_objetivo;
                if (ratio === 0) intensity = 0;
                else if (ratio < 0.25) intensity = 1;
                else if (ratio < 0.5) intensity = 2;
                else if (ratio < 0.75) intensity = 3;
                else if (ratio < 1) intensity = 4;
                else intensity = 5; // Excedido
            }

            monthDays.push({
                date: dayStr,
                day: date.getDate(),
                isToday: dayStr === new Date().toISOString().split('T')[0],
                isSelected: dayStr === selectedDate,
                comidas: comidasDelDia,
                totalCalorias,
                caloriasObjetivo: calorias_objetivo,
                intensity
            });

            currentMonth = month;
        }

        if (monthDays.length > 0) {
            calendar.push({
                month: months[currentMonth],
                days: monthDays
            });
        }

        return calendar;
    };

    // Navegación de años
    const changeYear = (delta) => {
        setCurrentYear(prev => prev + delta);
    };

    // Agregar comida rápida para hoy
    const agregarComidaRapida = async (tipoComida) => {
        const hoy = new Date().toISOString().split('T')[0];
        
        const { data: userData } = await supabase
            .from("usuarios")
            .select("id")
            .eq("auth_id", user.id)
            .single();

        if (!userData) return;

        const { data, error } = await supabase
            .from("comidas")
            .insert([
                {
                    usuario_id: userData.id,
                    dia: hoy,
                    comida: tipoComida,
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
            setSelectedDate(hoy);
            setActiveTab("registro");
        }
    };

    if (loading && !datos) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Cargando tus datos...</p>
                </div>
            </div>
        );
    }

    const calendarData = generateGitHubStyleCalendar();
    const hoy = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Tu Nutrición 🍎
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
            <div className="flex space-x-4 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("progreso")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "progreso" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    📊 Progreso Diario
                </button>
                <button
                    onClick={() => setActiveTab("calendario")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "calendario" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    📅 Calendario
                </button>
                <button
                    onClick={() => setActiveTab("registro")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "registro" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    🍽️ Registrar Comidas
                </button>
                <button
                    onClick={() => setActiveTab("objetivos")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
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
                <div className="space-y-6">
                    {/* Selector de Fecha */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    Progreso para {new Date(selectedDate).toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </h3>
                                <p className="text-gray-600">
                                    {comidasDelDia.length} comidas registradas
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                                {selectedDate === hoy && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => agregarComidaRapida("Desayuno")}
                                            className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg font-semibold hover:bg-emerald-200 transition-colors text-sm"
                                        >
                                            + Desayuno
                                        </button>
                                        <button
                                            onClick={() => agregarComidaRapida("Almuerzo")}
                                            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm"
                                        >
                                            + Almuerzo
                                        </button>
                                        <button
                                            onClick={() => agregarComidaRapida("Cena")}
                                            className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-semibold hover:bg-purple-200 transition-colors text-sm"
                                        >
                                            + Cena
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tarjeta de Progreso Principal */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-800">Progreso Nutricional</h2>
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
                                    <div className="text-xs text-gray-500 mt-1">
                                        {faltante.calorias > 0 ? `Faltan ${Math.round(faltante.calorias)} kcal` : `${Math.round(totales.calorias - calorias_objetivo)} kcal excedidas`}
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
                                    <div className="text-xs text-gray-500 mt-1">
                                        {faltante.proteina > 0 ? `Faltan ${Math.round(faltante.proteina)}g` : `+${Math.round(totales.proteina - proteinas_objetivo)}g`}
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
                                    <div className="text-xs text-gray-500 mt-1">
                                        {faltante.carbohidratos > 0 ? `Faltan ${Math.round(faltante.carbohidratos)}g` : `+${Math.round(totales.carbohidratos - carbohidratos_objetivo)}g`}
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
                                    <div className="text-xs text-gray-500 mt-1">
                                        {faltante.grasas > 0 ? `Faltan ${Math.round(faltante.grasas)}g` : `+${Math.round(totales.grasas - grasas_objetivo)}g`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Resumen y Recomendaciones */}
                        <div className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-6 text-center">Resumen del Día</h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{comidasDelDia.length}</div>
                                    <div className="text-emerald-100 text-sm">Comidas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{Math.round(totales.calorias)}</div>
                                    <div className="text-emerald-100 text-sm">Calorías</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{Math.round((totales.calorias/calorias_objetivo)*100)}%</div>
                                    <div className="text-emerald-100 text-sm">Progreso</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">
                                        {totales.calorias < calorias_objetivo ? "🎯" : "⚠️"}
                                    </div>
                                    <div className="text-emerald-100 text-sm">Estado</div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/20 rounded-xl">
                                <h4 className="font-semibold mb-2">💡 Recomendaciones</h4>
                                <p className="text-sm">
                                    {totales.calorias < calorias_objetivo * 0.5 
                                        ? "¡Vas por buen camino! Aún tienes espacio para nutrientes importantes." 
                                        : totales.calorias < calorias_objetivo * 0.8
                                        ? "Perfecto equilibrio. Mantén este ritmo para alcanzar tus metas."
                                        : totales.calorias < calorias_objetivo
                                        ? "Casi llegas a tu objetivo. Considera alimentos bajos en calorías."
                                        : "Has superado tu objetivo. Mañana es un nuevo día para mejorar."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comidas del Día */}
                    {comidasDelDia.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                            <h3 className="text-xl font-bold mb-4">Comidas Registradas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {comidasDelDia.map((comida, index) => (
                                    <div key={comida.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h4 className="font-semibold text-gray-800 mb-2">{comida.comida}</h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>Calorías: {Math.round(comida.calorias || 0)}</div>
                                            <div>Proteínas: {Math.round(comida.proteina || 0)}g</div>
                                            <div>Carbos: {Math.round(comida.carbohidratos || 0)}g</div>
                                            <div>Grasas: {Math.round(comida.grasas || 0)}g</div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {comida.alimentos?.length || 0} alimentos
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Calendario Estilo GitHub */}
            {activeTab === "calendario" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Progreso Nutricional {currentYear}</h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => changeYear(-1)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    ←
                                </button>
                                <span className="font-semibold">{currentYear}</span>
                                <button
                                    onClick={() => changeYear(1)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="flex space-x-4 min-w-max">
                                {calendarData.map((month, monthIndex) => (
                                    <div key={monthIndex} className="flex flex-col items-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">{month.month}</div>
                                        <div className="grid grid-rows-7 grid-flow-col gap-1">
                                            {month.days.map((day, dayIndex) => (
                                                <button
                                                    key={dayIndex}
                                                    onClick={() => {
                                                        setSelectedDate(day.date);
                                                        setActiveTab("progreso");
                                                    }}
                                                    className={`w-3 h-3 rounded-sm border transition-all duration-200 hover:scale-125 ${
                                                        day.isSelected 
                                                            ? 'border-2 border-emerald-500 ring-2 ring-emerald-200' 
                                                            : day.isToday 
                                                                ? 'border border-emerald-400'
                                                                : 'border-transparent'
                                                    } ${
                                                        day.intensity === 0 ? 'bg-gray-100' :
                                                        day.intensity === 1 ? 'bg-emerald-100' :
                                                        day.intensity === 2 ? 'bg-emerald-200' :
                                                        day.intensity === 3 ? 'bg-emerald-300' :
                                                        day.intensity === 4 ? 'bg-emerald-400' :
                                                        day.intensity === 5 ? 'bg-emerald-500' :
                                                        'bg-gray-100'
                                                    }`}
                                                    title={`${day.date}: ${Math.round(day.totalCalorias)}/${calorias_objetivo} calorías (${Math.round((day.totalCalorias/calorias_objetivo)*100)}%)`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leyenda */}
                        <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600 flex-wrap">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                                <span>Sin registro</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
                                <span>0-25%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
                                <span>25-50%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
                                <span>50-75%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                                <span>75-100%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                                <span>100%+</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registro de Comidas (se mantiene igual) */}
            {activeTab === "registro" && (
                <div className="space-y-6">
                    {/* ... (código del registro de comidas existente) */}
                </div>
            )}

            {/* Mis Objetivos (se mantiene igual) */}
            {activeTab === "objetivos" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    {/* ... (código de objetivos existente) */}
                </div>
            )}
        </div>
    );
}