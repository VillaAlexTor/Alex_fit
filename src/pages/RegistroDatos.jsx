// Alex_fit/src/pages/RegistroDatos.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "../context/AuthContext.jsx";
import { calcularTMB, calcularCaloriasDiarias, calcularMacros } from "../utils/calculos";

export default function RegistroDatos() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        nombre: "",
        edad: "",
        peso: "",
        altura: "",
        genero: "masculino",
        nivelActividad: "moderado",
        objetivo: "mantenimiento",
        metaPeso: ""
    });

    const [calculos, setCalculos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    // Calcular automáticamente cuando cambien los datos relevantes
    useEffect(() => {
        if (formData.peso && formData.altura && formData.edad) {
            calcularRecomendaciones();
        }
    }, [formData.peso, formData.altura, formData.edad, formData.genero, formData.nivelActividad, formData.objetivo]);

    const calcularRecomendaciones = () => {
        const peso = parseFloat(formData.peso);
        const altura = parseFloat(formData.altura);
        const edad = parseInt(formData.edad);
        
        if (!peso || !altura || !edad) return;

        const tmb = calcularTMB(peso, altura, edad, formData.genero);
        const caloriasDiarias = calcularCaloriasDiarias(tmb, formData.nivelActividad);
        const macros = calcularMacros(caloriasDiarias, formData.objetivo);

        setCalculos({
            tmb: Math.round(tmb),
            caloriasDiarias: Math.round(caloriasDiarias),
            macros
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje("");

        if (!user) {
            setMensaje("Error: Usuario no autenticado");
            setLoading(false);
            return;
        }

        try {
            // Guardar datos del usuario
            const { data, error } = await supabase
                .from("usuarios")
                .upsert({
                    id: user.id,
                    nombre: formData.nombre,
                    email: user.email,
                    edad: parseInt(formData.edad),
                    peso: parseFloat(formData.peso),
                    altura: parseFloat(formData.altura),
                    genero: formData.genero,
                    nivel_actividad: formData.nivelActividad,
                    objetivo: formData.objetivo,
                    meta_peso: parseFloat(formData.metaPeso) || null,
                    tmb: calculos?.tmb,
                    calorias_objetivo: calculos?.caloriasDiarias,
                    proteinas_objetivo: calculos?.macros?.proteinas,
                    carbohidratos_objetivo: calculos?.macros?.carbohidratos,
                    grasas_objetivo: calculos?.macros?.grasas
                }, { 
                    onConflict: ['id'],
                    ignoreDuplicates: false 
                });

            if (error) throw error;

            setMensaje("✅ Datos guardados correctamente");
            
            // Redirigir al dashboard después de 1.5 segundos
            setTimeout(() => {
                navigate("/app/nutricion");
            }, 1500);

        } catch (error) {
            console.error("Error:", error);
            setMensaje(`❌ Error al guardar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Si el usuario no está autenticado, mostrar mensaje
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center mb-4">Acceso no autorizado</h2>
                    <p className="text-gray-600 text-center">Debes iniciar sesión para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            ¡Bienvenido a Alex_Fit! 🎉
                        </h1>
                        <p className="text-gray-600">
                            Completa tu información para obtener un plan personalizado
                        </p>
                    </div>

                    {mensaje && (
                        <div className={`p-4 rounded-lg mb-6 text-center ${
                            mensaje.includes("✅") 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                            {mensaje}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Formulario */}
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información Personal */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        👤 Información Personal
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre completo *
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Tu nombre"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Edad (años) *
                                            </label>
                                            <input
                                                type="number"
                                                name="edad"
                                                value={formData.edad}
                                                onChange={handleChange}
                                                min="15"
                                                max="100"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="25"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Género *
                                        </label>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="genero"
                                                    value="masculino"
                                                    checked={formData.genero === "masculino"}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                Masculino
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="genero"
                                                    value="femenino"
                                                    checked={formData.genero === "femenino"}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                Femenino
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Medidas Corporales */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        📏 Medidas Corporales
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Peso (kg) *
                                            </label>
                                            <input
                                                type="number"
                                                name="peso"
                                                value={formData.peso}
                                                onChange={handleChange}
                                                step="0.1"
                                                min="30"
                                                max="200"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="70.5"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Altura (cm) *
                                            </label>
                                            <input
                                                type="number"
                                                name="altura"
                                                value={formData.altura}
                                                onChange={handleChange}
                                                min="100"
                                                max="250"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="175"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Meta de peso (kg) - Opcional
                                        </label>
                                        <input
                                            type="number"
                                            name="metaPeso"
                                            value={formData.metaPeso}
                                            onChange={handleChange}
                                            step="0.1"
                                            min="30"
                                            max="200"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="65.0"
                                        />
                                    </div>
                                </div>

                                {/* Estilo de Vida y Objetivos */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        🎯 Objetivos y Estilo de Vida
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nivel de actividad física *
                                            </label>
                                            <select
                                                name="nivelActividad"
                                                value={formData.nivelActividad}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="sedentario">Sedentario (poco o ningún ejercicio)</option>
                                                <option value="ligero">Ligero (ejercicio 1-3 días/semana)</option>
                                                <option value="moderado">Moderado (ejercicio 3-5 días/semana)</option>
                                                <option value="activo">Activo (ejercicio 6-7 días/semana)</option>
                                                <option value="muyActivo">Muy activo (ejercicio intenso diario)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tu objetivo principal *
                                            </label>
                                            <select
                                                name="objetivo"
                                                value={formData.objetivo}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="perdida">Pérdida de peso/grasa</option>
                                                <option value="mantenimiento">Mantenimiento</option>
                                                <option value="ganancia">Ganancia muscular</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Guardando..." : "🎯 Comenzar Mi Plan Personalizado"}
                                </button>
                            </form>
                        </div>

                        {/* Panel de Recomendaciones */}
                        <div>
                            <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-2xl p-6 sticky top-8">
                                <h3 className="text-xl font-bold mb-6 text-center">
                                    Tus Recomendaciones Personalizadas
                                </h3>

                                {calculos ? (
                                    <div className="space-y-6">
                                        {/* TMB */}
                                        <div className="bg-white/20 p-4 rounded-xl">
                                            <h4 className="font-semibold mb-2">🔥 Tasa Metabólica Basal</h4>
                                            <p className="text-2xl font-bold">{calculos.tmb} kcal</p>
                                            <p className="text-sm opacity-90">Calorías que quemas en reposo</p>
                                        </div>

                                        {/* Calorías Diarias */}
                                        <div className="bg-white/20 p-4 rounded-xl">
                                            <h4 className="font-semibold mb-2">📊 Calorías Diarias Recomendadas</h4>
                                            <p className="text-2xl font-bold">{calculos.caloriasDiarias} kcal/día</p>
                                            <p className="text-sm opacity-90">Para tu objetivo de {formData.objetivo === 'perdida' ? 'pérdida' : formData.objetivo === 'ganancia' ? 'ganancia' : 'mantenimiento'}</p>
                                        </div>

                                        {/* Macros */}
                                        <div className="bg-white/20 p-4 rounded-xl">
                                            <h4 className="font-semibold mb-3">🍽️ Distribución de Macronutrientes</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Proteínas:</span>
                                                    <span className="font-bold">{calculos.macros.proteinas}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Carbohidratos:</span>
                                                    <span className="font-bold">{calculos.macros.carbohidratos}g</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Grasas:</span>
                                                    <span className="font-bold">{calculos.macros.grasas}g</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Consejos */}
                                        <div className="bg-white/20 p-4 rounded-xl">
                                            <h4 className="font-semibold mb-2">💡 Consejos</h4>
                                            <ul className="text-sm space-y-1">
                                                <li>• Mantente hidratado durante el día</li>
                                                <li>• Combina cardio y fuerza</li>
                                                <li>• Descansa 7-9 horas cada noche</li>
                                                <li>• Sé consistente con tu plan</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-lg opacity-90">
                                            Completa el formulario para ver tus recomendaciones personalizadas
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}