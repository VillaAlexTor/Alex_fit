import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Overview() {
    const { user } = useContext(AuthContext);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bienvenido</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjetas de resumen */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Nutrición</h3>
                    <p className="text-gray-600">Controla tu alimentación y macros</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Rutina</h3>
                    <p className="text-gray-600">Sigue tu plan de ejercicios</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Progreso</h3>
                    <p className="text-gray-600">Mira tu evolución</p>
                </div>
            </div>
            
            {/* saludo eliminado deliberadamente */}
        </div>
    );
}