import React from "react";

export default function Progreso() {
    const progreso = [
        { fecha: "01/11", peso: 61.2, grasa: 14.7 },
        { fecha: "15/11", peso: 62.0, grasa: 14.1 },
    ];

    return (
        <div className="card">
        <h2 className="text-2xl font-bold mb-4">Seguimiento de progreso</h2>

        <table className="w-full text-left">
            <thead>
            <tr className="border-b">
                <th className="py-2">Fecha</th>
                <th>Peso (kg)</th>
                <th>Grasa corporal (%)</th>
            </tr>
            </thead>
            <tbody>
            {progreso.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-100">
                <td className="py-2">{p.fecha}</td>
                <td>{p.peso}</td>
                <td>{p.grasa}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}
