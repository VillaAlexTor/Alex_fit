// Alex_fit/src/pages/Dashboard/Progreso.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Progreso() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [registrosPeso, setRegistrosPeso] = useState([]);
    const [registrosMedidas, setRegistrosMedidas] = useState([]);
    const [activeTab, setActiveTab] = useState("peso");
    const [loading, setLoading] = useState(true);
    const [nuevoRegistro, setNuevoRegistro] = useState({
        tipo: "peso",
        valor: "",
        fecha: new Date().toISOString().split('T')[0],
        notas: ""
    });

    // Traer datos del usuario y registros
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Datos del usuario
                const { data: userData } = await supabase
                    .from("usuarios")
                    .select("id")
                    .eq("auth_id", user.id)
                    .single();

                if (userData) {
                    const { data: usuario } = await supabase
                        .from("usuarios")
                        .select("*")
                        .eq("id", userData.id)
                        .single();

                    setDatosUsuario(usuario);

                    // Traer registros de progreso (simulados por ahora)
                    // En una implementación real, tendrías una tabla 'progreso'
                    const progresoSimulado = [
                        { fecha: "2024-01-01", peso: 70.5, grasa: 22.1, musculo: 35.2, cintura: 85 },
                        { fecha: "2024-01-08", peso: 69.8, grasa: 21.5, musculo: 35.5, cintura: 84 },
                        { fecha: "2024-01-15", peso: 69.2, grasa: 20.8, musculo: 35.8, cintura: 83 },
                        { fecha: "2024-01-22", peso: 68.5, grasa: 20.1, musculo: 36.1, cintura: 82 },
                        { fecha: "2024-01-29", peso: 67.9, grasa: 19.5, musculo: 36.4, cintura: 81 },
                        { fecha: "2024-02-05", peso: 67.2, grasa: 18.8, musculo: 36.7, cintura: 80 },
                        { fecha: "2024-02-12", peso: 66.8, grasa: 18.2, musculo: 37.0, cintura: 79 },
                    ];

                    setRegistrosPeso(progresoSimulado);
                    setRegistrosMedidas(progresoSimulado);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Calcular métricas
    const calcularMetricas = () => {
        if (registrosPeso.length < 2) return null;

        const primerRegistro = registrosPeso[0];
        const ultimoRegistro = registrosPeso[registrosPeso.length - 1];
        const totalSemanas = Math.ceil((new Date(ultimoRegistro.fecha) - new Date(primerRegistro.fecha)) / (7 * 24 * 60 * 60 * 1000));

        return {
            pesoPerdido: primerRegistro.peso - ultimoRegistro.peso,
            grasaPerdida: primerRegistro.grasa - ultimoRegistro.grasa,
            musculoGanado: ultimoRegistro.musculo - primerRegistro.musculo,
            cinturaReducida: primerRegistro.cintura - ultimoRegistro.cintura,
            semanas: totalSemanas,
            promedioSemanal: (primerRegistro.peso - ultimoRegistro.peso) / totalSemanas
        };
    };

    const metricas = calcularMetricas();

    // Agregar nuevo registro
    const agregarRegistro = async () => {
        if (!nuevoRegistro.valor) {
            alert("Por favor ingresa un valor");
            return;
        }

        // En una implementación real, guardarías en Supabase
        const nuevo = {
            fecha: nuevoRegistro.fecha,
            [nuevoRegistro.tipo]: parseFloat(nuevoRegistro.valor),
            notas: nuevoRegistro.notas
        };

        if (nuevoRegistro.tipo === "peso") {
            setRegistrosPeso(prev => [...prev, nuevo].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
        } else {
            setRegistrosMedidas(prev => [...prev, nuevo].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
        }

        setNuevoRegistro({
            tipo: "peso",
            valor: "",
            fecha: new Date().toISOString().split('T')[0],
            notas: ""
        });
    };

    // Calcular progreso hacia meta
    const calcularProgresoMeta = () => {
        if (!datosUsuario || !registrosPeso.length) return null;

        const pesoActual = registrosPeso[registrosPeso.length - 1].peso;
        const pesoInicial = registrosPeso[0].peso;
        const metaPeso = datosUsuario.meta_peso;

        if (!metaPeso) return null;

        const totalCambioNecesario = Math.abs(pesoInicial - metaPeso);
        const cambioLogrado = Math.abs(pesoInicial - pesoActual);
        const progreso = (cambioLogrado / totalCambioNecesario) * 100;

        return {
            progreso: Math.min(100, progreso),
            restante: Math.abs(pesoActual - metaPeso),
            direccion: pesoInicial > metaPeso ? "pérdida" : "ganancia"
        };
    };

    const progresoMeta = calcularProgresoMeta();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Cargando tu progreso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Mi Progreso 📈
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Sigue tu evolución y celebra cada logro
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

            {/* Resumen de Métricas Principales */}
            {metricas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Peso Perdido</h3>
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600 mb-2">
                            {metricas.pesoPerdido.toFixed(1)} kg
                        </div>
                        <p className="text-sm text-gray-600">
                            {metricas.promedioSemanal > 0 ? `${metricas.promedioSemanal.toFixed(2)} kg/semana` : 'Manteniendo'}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Grasa Corporal</h3>
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600 mb-2">
                            -{metricas.grasaPerdida.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">
                            {registrosPeso.length} mediciones
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Músculo Ganado</h3>
                            <span className="text-2xl">💪</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            +{metricas.musculoGanado.toFixed(1)} kg
                        </div>
                        <p className="text-sm text-gray-600">
                            Masa muscular
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700">Cintura</h3>
                            <span className="text-2xl">📏</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                            -{metricas.cinturaReducida} cm
                        </div>
                        <p className="text-sm text-gray-600">
                            Reducción abdominal
                        </p>
                    </div>
                </div>
            )}

            {/* Progreso hacia Meta */}
            {progresoMeta && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-8">
                    <h3 className="text-xl font-bold mb-4">Progreso hacia tu Meta</h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600">
                            {progresoMeta.direccion === "pérdida" ? "Pérdida de peso" : "Ganancia muscular"}
                        </span>
                        <span className="font-semibold">
                            {progresoMeta.progreso.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progresoMeta.progreso}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {progresoMeta.restante.toFixed(1)} kg restantes para tu meta de {datosUsuario.meta_peso} kg
                    </p>
                </div>
            )}

            {/* Tabs de Navegación */}
            <div className="flex space-x-4 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("peso")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "peso" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    ⚖️ Seguimiento de Peso
                </button>
                <button
                    onClick={() => setActiveTab("medidas")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "medidas" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    📏 Medidas Corporales
                </button>
                <button
                    onClick={() => setActiveTab("nuevo")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                        activeTab === "nuevo" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25" 
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    ➕ Nuevo Registro
                </button>
            </div>

            {/* Tabla de Seguimiento de Peso */}
            {activeTab === "peso" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-6">Historial de Peso y Composición Corporal</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border px-4 py-3 text-left">Fecha</th>
                                    <th className="border px-4 py-3">Peso (kg)</th>
                                    <th className="border px-4 py-3">Grasa (%)</th>
                                    <th className="border px-4 py-3">Músculo (kg)</th>
                                    <th className="border px-4 py-3">Cambio</th>
                                    <th className="border px-4 py-3">Tendencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosPeso.map((registro, index) => {
                                    const cambio = index > 0 ? registro.peso - registrosPeso[index - 1].peso : 0;
                                    const tendencia = cambio < 0 ? "📉" : cambio > 0 ? "📈" : "➡️";
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border px-4 py-3 font-medium">
                                                {new Date(registro.fecha).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="border px-4 py-3 text-center font-semibold">
                                                {registro.peso}
                                            </td>
                                            <td className="border px-4 py-3 text-center">
                                                {registro.grasa}%
                                            </td>
                                            <td className="border px-4 py-3 text-center">
                                                {registro.musculo}kg
                                            </td>
                                            <td className={`border px-4 py-3 text-center font-semibold ${
                                                cambio < 0 ? 'text-green-600' : 
                                                cambio > 0 ? 'text-red-600' : 'text-gray-600'
                                            }`}>
                                                {cambio !== 0 ? (cambio > 0 ? `+${cambio.toFixed(1)}` : cambio.toFixed(1)) : '-'}
                                            </td>
                                            <td className="border px-4 py-3 text-center text-2xl">
                                                {tendencia}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {registrosPeso.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">⚖️</div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">No hay registros de peso</h3>
                            <p className="text-gray-600">Comienza agregando tu primer registro.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tabla de Medidas Corporales */}
            {activeTab === "medidas" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-6">Medidas Corporales</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border px-4 py-3 text-left">Fecha</th>
                                    <th className="border px-4 py-3">Cintura (cm)</th>
                                    <th className="border px-4 py-3">Cadera (cm)</th>
                                    <th className="border px-4 py-3">Pecho (cm)</th>
                                    <th className="border px-4 py-3">Brazo (cm)</th>
                                    <th className="border px-4 py-3">Muslo (cm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosMedidas.map((registro, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-3 font-medium">
                                            {new Date(registro.fecha).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {registro.cintura || '-'}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {registro.cadera || '-'}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {registro.pecho || '-'}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {registro.brazo || '-'}
                                        </td>
                                        <td className="border px-4 py-3 text-center">
                                            {registro.muslo || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {registrosMedidas.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📏</div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">No hay registros de medidas</h3>
                            <p className="text-gray-600">Comienza agregando tus medidas corporales.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Formulario para Nuevo Registro */}
            {activeTab === "nuevo" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-6">Agregar Nuevo Registro</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Registro</label>
                            <select
                                value={nuevoRegistro.tipo}
                                onChange={(e) => setNuevoRegistro({...nuevoRegistro, tipo: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            >
                                <option value="peso">Peso</option>
                                <option value="grasa">Grasa Corporal</option>
                                <option value="musculo">Masa Muscular</option>
                                <option value="cintura">Cintura</option>
                                <option value="cadera">Cadera</option>
                                <option value="pecho">Pecho</option>
                                <option value="brazo">Brazo</option>
                                <option value="muslo">Muslo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                            <input
                                type="date"
                                value={nuevoRegistro.fecha}
                                onChange={(e) => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valor {nuevoRegistro.tipo === 'peso' || nuevoRegistro.tipo === 'musculo' ? '(kg)' : 
                                      nuevoRegistro.tipo === 'grasa' ? '(%)' : '(cm)'}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={nuevoRegistro.valor}
                                onChange={(e) => setNuevoRegistro({...nuevoRegistro, valor: e.target.value})}
                                placeholder={`Ingresa ${nuevoRegistro.tipo}`}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                            <input
                                type="text"
                                value={nuevoRegistro.notas}
                                onChange={(e) => setNuevoRegistro({...nuevoRegistro, notas: e.target.value})}
                                placeholder="Observaciones adicionales..."
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={agregarRegistro}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            Guardar Registro
                        </button>
                    </div>
                </div>
            )}

            {/* Consejos y Motivación */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl p-6 shadow-lg mt-8">
                <h3 className="text-xl font-bold mb-4">🎯 Consejos para Continuar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 Consistencia</h4>
                        <p className="text-sm">Mide tu progreso regularmente, preferiblemente el mismo día y hora cada semana.</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">💪 Enfoque en Proceso</h4>
                        <p className="text-sm">Celebra los pequeños logros, no solo el peso final.</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📷 Fotos de Progreso</h4>
                        <p className="text-sm">Toma fotos mensuales para ver cambios visuales.</p>
                    </div>
                    <div className="bg-white/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Metas Realistas</h4>
                        <p className="text-sm">Establece objetivos alcanzables de 0.5-1kg por semana.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}