// Alex_fit/src/pages/Dasboard/Rutina.jsx
import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../../utils/supabaseClient";
import { AuthContext } from "../../context/AuthContext.jsx";
export default function Rutina() {
    const { user } = useContext(AuthContext);
    const [rutinas, setRutinas] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [editingRutina, setEditingRutina] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    // Form state
    const [formData, setFormData] = useState({
        dia: "lunes",
        tipo: "fuerza",
        nombre_rutina: "",
        ejercicios: [{ nombre: "", series: "", repeticiones: "", peso: "", descanso: "60s", estado: "pendiente", notas: "" }],
        estado: "pendiente",
        fecha: selectedDate
    });

    // Días de la semana
    const diasSemana = [
        { value: "lunes", label: "Lunes", emoji: "💪" },
        { value: "martes", label: "Martes", emoji: "🔥" },
        { value: "miercoles", label: "Miércoles", emoji: "⚡" },
        { value: "jueves", label: "Jueves", emoji: "🚀" },
        { value: "viernes", label: "Viernes", emoji: "🏆" },
        { value: "sabado", label: "Sábado", emoji: "🌟" },
        { value: "domingo", label: "Domingo", emoji: "🧘" }
    ];

    // Tipos de entrenamiento
    const tiposEntrenamiento = [
        { value: "fuerza", label: "Fuerza", emoji: "🏋️" },
        { value: "cardio", label: "Cardio", emoji: "🏃" },
        { value: "hiit", label: "HIIT", emoji: "⚡" },
        { value: "flexibilidad", label: "Flexibilidad", emoji: "🧘" },
        { value: "descanso", label: "Descanso", emoji: "😴" }
    ];

    // Traer rutinas del usuario
    useEffect(() => {
        if (!user) return;

        const fetchRutinas = async () => {
            const { data: userData } = await supabase
                .from("usuarios")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (userData) {
                const { data, error } = await supabase
                    .from("rutinas")
                    .select("*")
                    .eq("usuario_id", userData.id)
                    .order("fecha", { ascending: false });

                if (!error) setRutinas(data || []);
                else console.log("Error al traer rutinas:", error.message);
            }
            setLoading(false);
        };

        fetchRutinas();
    }, [user]);

    // Filtrar rutinas por día seleccionado
    const rutinasDelDia = rutinas.filter(rutina => rutina.fecha === selectedDate);

    // Generar calendario estilo GitHub para el año actual
    const generateGitHubStyleCalendar = () => {
        const months = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];

        // Obtener todos los días del año
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

            // Si cambiamos de mes, guardar el mes anterior y empezar nuevo
            if (month !== currentMonth && currentMonth !== -1) {
                calendar.push({
                    month: months[currentMonth],
                    days: monthDays
                });
                monthDays = [];
            }

            // Encontrar rutinas para este día
            const rutinasDelDia = rutinas.filter(r => r.fecha === dayStr);
            const totalEjercicios = rutinasDelDia.reduce((sum, rutina) => 
                sum + (rutina.ejercicios?.length || 0), 0);
            const ejerciciosCompletados = rutinasDelDia.reduce((sum, rutina) => 
                sum + (rutina.ejercicios?.filter(e => e.estado === 'completado').length || 0), 0);

            // Determinar color basado en el progreso
            let intensity = 0;
            if (totalEjercicios > 0) {
                const ratio = ejerciciosCompletados / totalEjercicios;
                if (ratio === 0) intensity = 0;
                else if (ratio < 0.25) intensity = 1;
                else if (ratio < 0.5) intensity = 2;
                else if (ratio < 0.75) intensity = 3;
                else intensity = 4;
            }

            monthDays.push({
                date: dayStr,
                day: date.getDate(),
                isToday: dayStr === new Date().toISOString().split('T')[0],
                isSelected: dayStr === selectedDate,
                rutinas: rutinasDelDia,
                totalEjercicios,
                ejerciciosCompletados,
                intensity
            });

            currentMonth = month;
        }

        // Agregar el último mes
        if (monthDays.length > 0) {
            calendar.push({
                month: months[currentMonth],
                days: monthDays
            });
        }

        return calendar;
    };

    // Agregar ejercicio al formulario
    const addEjercicio = () => {
        if (formData.ejercicios.length >= 10) {
            alert("Máximo 10 ejercicios por día");
            return;
        }
        setFormData({
            ...formData,
            ejercicios: [...formData.ejercicios, { nombre: "", series: "", repeticiones: "", peso: "", descanso: "60s", estado: "pendiente", notas: "" }]
        });
    };

    // Remover ejercicio del formulario
    const removeEjercicio = (index) => {
        const nuevosEjercicios = formData.ejercicios.filter((_, i) => i !== index);
        setFormData({ ...formData, ejercicios: nuevosEjercicios });
    };

    // Actualizar ejercicio en el formulario
    const updateEjercicio = (index, field, value) => {
        const nuevosEjercicios = [...formData.ejercicios];
        nuevosEjercicios[index][field] = value;
        setFormData({ ...formData, ejercicios: nuevosEjercicios });
    };

    // Guardar rutina
    const saveRutina = async () => {
        if (!formData.nombre_rutina || !formData.ejercicios.some(e => e.nombre)) {
            alert("Por favor completa al menos el nombre de la rutina y un ejercicio");
            return;
        }

        setLoading(true);
        try {
            const { data: userData, error: userError } = await supabase
                .from("usuarios")
                .select("id")
                .eq("auth_id", user.id)
                .single();

            if (userError) throw userError;

            const rutinaData = {
                usuario_id: userData.id,
                dia: formData.dia,
                tipo: formData.tipo,
                nombre_rutina: formData.nombre_rutina,
                ejercicios: formData.ejercicios,
                estado: formData.estado,
                fecha: formData.fecha
            };

            let error;
            if (editingRutina) {
                const { error: updateError } = await supabase
                    .from("rutinas")
                    .update(rutinaData)
                    .eq("id", editingRutina.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("rutinas")
                    .insert([rutinaData]);
                error = insertError;
            }

            if (error) throw error;

            const { data } = await supabase
                .from("rutinas")
                .select("*")
                .eq("usuario_id", userData.id)
                .order("fecha", { ascending: false });

            setRutinas(data || []);
            resetForm();
        } catch (error) {
            console.error("Error guardando rutina:", error.message);
            alert("Error al guardar la rutina: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Editar rutina
    const editRutina = (rutina) => {
        setFormData({
            dia: rutina.dia,
            tipo: rutina.tipo,
            nombre_rutina: rutina.nombre_rutina,
            ejercicios: rutina.ejercicios || [],
            estado: rutina.estado,
            fecha: rutina.fecha
        });
        setEditingRutina(rutina);
        setShowForm(true);
    };

    // Eliminar rutina
    const deleteRutina = async (id) => {
        if (!confirm("¿Estás seguro de eliminar esta rutina?")) return;

        const { error } = await supabase
            .from("rutinas")
            .delete()
            .eq("id", id);

        if (!error) {
            setRutinas(rutinas.filter(r => r.id !== id));
        } else {
            alert("Error al eliminar la rutina");
        }
    };

    // Marcar ejercicio como completado
    const toggleEjercicioEstado = async (rutinaId, ejercicioIndex, nuevoEstado) => {
        const rutina = rutinas.find(r => r.id === rutinaId);
        if (!rutina) return;

        const nuevosEjercicios = [...rutina.ejercicios];
        nuevosEjercicios[ejercicioIndex].estado = nuevoEstado;

        const { error } = await supabase
            .from("rutinas")
            .update({ ejercicios: nuevosEjercicios })
            .eq("id", rutinaId);

        if (!error) {
            setRutinas(rutinas.map(r => 
                r.id === rutinaId ? { ...r, ejercicios: nuevosEjercicios } : r
            ));
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            dia: "lunes",
            tipo: "fuerza",
            nombre_rutina: "",
            ejercicios: [{ nombre: "", series: "", repeticiones: "", peso: "", descanso: "60s", estado: "pendiente", notas: "" }],
            estado: "pendiente",
            fecha: selectedDate
        });
        setEditingRutina(null);
        setShowForm(false);
    };

    // Navegación de años
    const changeYear = (delta) => {
        setCurrentYear(prev => prev + delta);
    };

    if (loading && rutinas.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Cargando rutinas...</p>
                </div>
            </div>
        );
    }

    const calendarData = generateGitHubStyleCalendar();

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Mi Rutina 💪
                </h1>
                <p className="text-lg text-gray-600">
                    Planifica y sigue tu progreso de entrenamiento
                </p>
            </div>

            {/* Controles */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Nueva Rutina
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendario Estilo GitHub */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Progreso {currentYear}</h2>
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
                                            onClick={() => setSelectedDate(day.date)}
                                            className={`w-3 h-3 rounded-sm border transition-all duration-200 hover:scale-125 ${
                                                day.isSelected 
                                                    ? 'border-2 border-emerald-500 ring-2 ring-emerald-200' 
                                                    : day.isToday 
                                                        ? 'border border-emerald-400'
                                                        : 'border-transparent'
                                            } ${
                                                day.intensity === 0 ? 'bg-gray-100' :
                                                day.intensity === 1 ? 'bg-emerald-200' :
                                                day.intensity === 2 ? 'bg-emerald-300' :
                                                day.intensity === 3 ? 'bg-emerald-400' :
                                                day.intensity === 4 ? 'bg-emerald-500' :
                                                'bg-gray-100'
                                            }`}
                                            title={`${day.date}: ${day.ejerciciosCompletados}/${day.totalEjercicios} ejercicios completados`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leyenda */}
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                        <span>Sin ejercicios</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-emerald-200 rounded-sm"></div>
                        <span>Poco progreso</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                        <span>Buen progreso</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                        <span>Excelente progreso</span>
                    </div>
                </div>
            </div>

            {/* Resumen del Día Seleccionado */}
            {rutinasDelDia.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-6">
                    <h3 className="text-lg font-bold mb-4">
                        Resumen {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {rutinasDelDia.map((rutina, index) => {
                            const totalEjercicios = rutina.ejercicios?.length || 0;
                            const completados = rutina.ejercicios?.filter(e => e.estado === 'completado').length || 0;
                            return (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">{rutina.nombre_rutina}</h4>
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {completados}/{totalEjercicios}
                                    </div>
                                    <p className="text-sm text-gray-600">ejercicios completados</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div 
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${totalEjercicios > 0 ? (completados / totalEjercicios) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Formulario de Rutina (se mantiene igual) */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-6">
                    {/* ... (todo el formulario se mantiene igual) */}
                    {/* Formulario de Rutina */}
                    {showForm && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg mb-6">
                            <h2 className="text-xl font-bold mb-4">
                                {editingRutina ? "Editar Rutina" : "Nueva Rutina"}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Día */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                                    <select
                                        value={formData.dia}
                                        onChange={(e) => setFormData({ ...formData, dia: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    >
                                        {diasSemana.map(dia => (
                                            <option key={dia.value} value={dia.value}>
                                                {dia.emoji} {dia.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    >
                                        {tiposEntrenamiento.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>
                                                {tipo.emoji} {tipo.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    >
                                        <option value="pendiente">⏳ Pendiente</option>
                                        <option value="completado">✅ Completado</option>
                                        <option value="fallado">❌ Fallado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Nombre de Rutina */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Rutina</label>
                                <input
                                    type="text"
                                    value={formData.nombre_rutina}
                                    onChange={(e) => setFormData({ ...formData, nombre_rutina: e.target.value })}
                                    placeholder="Ej: Rutina de pecho y tríceps"
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            </div>

                            {/* Ejercicios */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Ejercicios ({formData.ejercicios.length}/10)</h3>
                                    <button
                                        onClick={addEjercicio}
                                        disabled={formData.ejercicios.length >= 10}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        + Agregar Ejercicio
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.ejercicios.map((ejercicio, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
                                                {/* Nombre */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Ejercicio</label>
                                                    <input
                                                        type="text"
                                                        value={ejercicio.nombre}
                                                        onChange={(e) => updateEjercicio(index, "nombre", e.target.value)}
                                                        placeholder="Nombre del ejercicio"
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    />
                                                </div>

                                                {/* Series */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Series</label>
                                                    <input
                                                        type="text"
                                                        value={ejercicio.series}
                                                        onChange={(e) => updateEjercicio(index, "series", e.target.value)}
                                                        placeholder="3-4"
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    />
                                                </div>

                                                {/* Repeticiones */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
                                                    <input
                                                        type="text"
                                                        value={ejercicio.repeticiones}
                                                        onChange={(e) => updateEjercicio(index, "repeticiones", e.target.value)}
                                                        placeholder="8-12"
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    />
                                                </div>

                                                {/* Peso */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Peso</label>
                                                    <input
                                                        type="text"
                                                        value={ejercicio.peso}
                                                        onChange={(e) => updateEjercicio(index, "peso", e.target.value)}
                                                        placeholder="60kg"
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    />
                                                </div>

                                                {/* Descanso */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Descanso</label>
                                                    <input
                                                        type="text"
                                                        value={ejercicio.descanso}
                                                        onChange={(e) => updateEjercicio(index, "descanso", e.target.value)}
                                                        placeholder="60s"
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    />
                                                </div>

                                                {/* Estado */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                                                    <select
                                                        value={ejercicio.estado}
                                                        onChange={(e) => updateEjercicio(index, "estado", e.target.value)}
                                                        className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                    >
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="completado">Completado</option>
                                                        <option value="fallado">Fallado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Notas */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                                                <input
                                                    type="text"
                                                    value={ejercicio.notas}
                                                    onChange={(e) => updateEjercicio(index, "notas", e.target.value)}
                                                    placeholder="Notas adicionales..."
                                                    className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                                />
                                            </div>

                                            {/* Botón Eliminar */}
                                            {formData.ejercicios.length > 1 && (
                                                <div className="mt-2 text-right">
                                                    <button
                                                        onClick={() => removeEjercicio(index)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={resetForm}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveRutina}
                                    disabled={loading}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Guardando..." : (editingRutina ? "Actualizar" : "Guardar")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Lista de Rutinas del Día Seleccionado */}
            <div className="space-y-6">
                {rutinasDelDia.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">💪</div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                            No hay rutinas para {new Date(selectedDate).toLocaleDateString('es-ES')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comienza creando una rutina para este día.
                        </p>
                        <button 
                            onClick={() => setShowForm(true)}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            Crear Rutina para este Día
                        </button>
                    </div>
                ) : (
                    rutinasDelDia.map((rutina) => (
                        <div key={rutina.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
                            {/* Header de la Rutina */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                                        {rutina.nombre_rutina}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            {diasSemana.find(d => d.value === rutina.dia)?.emoji}
                                            {diasSemana.find(d => d.value === rutina.dia)?.label}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {tiposEntrenamiento.find(t => t.value === rutina.tipo)?.emoji}
                                            {tiposEntrenamiento.find(t => t.value === rutina.tipo)?.label}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            rutina.estado === 'completado' 
                                                ? 'bg-green-100 text-green-800'
                                                : rutina.estado === 'fallado'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {rutina.estado}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-2 lg:mt-0">
                                    <button
                                        onClick={() => editRutina(rutina)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => deleteRutina(rutina.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Lista de Ejercicios */}
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border px-4 py-2 text-left">Ejercicio</th>
                                            <th className="border px-4 py-2">Series</th>
                                            <th className="border px-4 py-2">Reps</th>
                                            <th className="border px-4 py-2">Peso</th>
                                            <th className="border px-4 py-2">Descanso</th>
                                            <th className="border px-4 py-2">Estado</th>
                                            <th className="border px-4 py-2">Notas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rutina.ejercicios.map((ejercicio, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="border px-4 py-2 font-medium">{ejercicio.nombre}</td>
                                                <td className="border px-4 py-2 text-center">{ejercicio.series}</td>
                                                <td className="border px-4 py-2 text-center">{ejercicio.repeticiones}</td>
                                                <td className="border px-4 py-2 text-center">{ejercicio.peso}</td>
                                                <td className="border px-4 py-2 text-center">{ejercicio.descanso}</td>
                                                <td className="border px-4 py-2 text-center">
                                                    <select
                                                        value={ejercicio.estado}
                                                        onChange={(e) => toggleEjercicioEstado(rutina.id, index, e.target.value)}
                                                        className={`text-sm font-semibold px-2 py-1 rounded border-0 focus:ring-2 focus:ring-emerald-400 ${
                                                            ejercicio.estado === 'completado' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : ejercicio.estado === 'fallado'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="completado">Completado</option>
                                                        <option value="fallado">Fallado</option>
                                                    </select>
                                                </td>
                                                <td className="border px-4 py-2 text-sm text-gray-600">{ejercicio.notas}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}