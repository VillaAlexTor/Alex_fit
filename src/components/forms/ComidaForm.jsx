import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function ComidaForm({ diaId, alimentosActuales, onUpdate }) {
	const [alimentos, setAlimentos] = useState(alimentosActuales || []);
	const [nuevoAlimento, setNuevoAlimento] = useState({
		nombre: "",
		calorias: 0,
		proteina: 0,
		carbohidratos: 0,
		grasas: 0
	});

	// Agregar nuevo alimento
	const agregarAlimento = async () => {
		if (!nuevoAlimento.nombre) return;

		const nuevaLista = [...alimentos, nuevoAlimento];

		const { error } = await supabase
			.from("comidas")
			.update({ alimentos: nuevaLista })
			.eq("id", diaId);

		if (!error) {
			setAlimentos(nuevaLista);
			onUpdate(nuevaLista);
			setNuevoAlimento({ nombre: "", calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 });
		}
	};

	// Editar alimento
	const editarAlimento = async (index, campo, valor) => {
		const nuevaLista = [...alimentos];
		nuevaLista[index][campo] = campo === "nombre" ? valor : parseFloat(valor);

		const { error } = await supabase
			.from("comidas")
			.update({ alimentos: nuevaLista })
			.eq("id", diaId);

		if (!error) {
			setAlimentos(nuevaLista);
			onUpdate(nuevaLista);
		}
	};

	// Eliminar alimento
	const eliminarAlimento = async (index) => {
		const nuevaLista = alimentos.filter((_, i) => i !== index);

		const { error } = await supabase
			.from("comidas")
			.update({ alimentos: nuevaLista })
			.eq("id", diaId);

		if (!error) {
			setAlimentos(nuevaLista);
			onUpdate(nuevaLista);
		}
	};

	// Calcular totales
	const totales = alimentos.reduce(
		(acc, item) => {
			acc.calorias += parseFloat(item.calorias || 0);
			acc.proteina += parseFloat(item.proteina || 0);
			acc.carbohidratos += parseFloat(item.carbohidratos || 0);
			acc.grasas += parseFloat(item.grasas || 0);
			return acc;
		},
		{ calorias: 0, proteina: 0, carbohidratos: 0, grasas: 0 }
	);

	return (
		<div className="mt-4 p-4 bg-gray-50 rounded shadow">
			<h3 className="font-semibold mb-2">Agregar / Editar Alimentos</h3>

			{/* Formulario para agregar */}
			<div className="flex flex-wrap gap-2 mb-4">
				<input
					type="text"
					placeholder="Nombre"
					className="border px-2 py-1 rounded flex-1"
					value={nuevoAlimento.nombre}
					onChange={(e) => setNuevoAlimento({ ...nuevoAlimento, nombre: e.target.value })}
				/>
				<input
					type="number"
					placeholder="Calorías"
					className="border px-2 py-1 rounded w-24"
					value={nuevoAlimento.calorias}
					onChange={(e) => setNuevoAlimento({ ...nuevoAlimento, calorias: e.target.value })}
				/>
				<input
					type="number"
					placeholder="Proteína"
					className="border px-2 py-1 rounded w-24"
					value={nuevoAlimento.proteina}
					onChange={(e) => setNuevoAlimento({ ...nuevoAlimento, proteina: e.target.value })}
				/>
				<input
					type="number"
					placeholder="Carbs"
					className="border px-2 py-1 rounded w-24"
					value={nuevoAlimento.carbohidratos}
					onChange={(e) => setNuevoAlimento({ ...nuevoAlimento, carbohidratos: e.target.value })}
				/>
				<input
					type="number"
					placeholder="Grasas"
					className="border px-2 py-1 rounded w-24"
					value={nuevoAlimento.grasas}
					onChange={(e) => setNuevoAlimento({ ...nuevoAlimento, grasas: e.target.value })}
				/>
				<button
					onClick={agregarAlimento}
					className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
				>
					+
				</button>
			</div>

			{/* Lista de alimentos existentes */}
			{alimentos.map((al, index) => (
				<div key={index} className="flex items-center space-x-2 mb-2 flex-wrap">
					<input
						type="text"
						value={al.nombre}
						onChange={(ev) => editarAlimento(index, "nombre", ev.target.value)}
						className="border px-2 py-1 rounded flex-1"
					/>
					<input
						type="number"
						value={al.calorias}
						onChange={(ev) => editarAlimento(index, "calorias", ev.target.value)}
						className="border px-2 py-1 rounded w-24"
					/>
					<input
						type="number"
						value={al.proteina}
						onChange={(ev) => editarAlimento(index, "proteina", ev.target.value)}
						className="border px-2 py-1 rounded w-24"
					/>
					<input
						type="number"
						value={al.carbohidratos}
						onChange={(ev) => editarAlimento(index, "carbohidratos", ev.target.value)}
						className="border px-2 py-1 rounded w-24"
					/>
					<input
						type="number"
						value={al.grasas}
						onChange={(ev) => editarAlimento(index, "grasas", ev.target.value)}
						className="border px-2 py-1 rounded w-24"
					/>
					<button
						onClick={() => eliminarAlimento(index)}
						className="bg-red-600 text-white px-3 rounded hover:bg-red-700"
					>
						🗑️
					</button>
				</div>
			))}

			{/* Totales */}
			<div className="mt-2 font-semibold">
				Totales: {totales.calorias} kcal | {totales.proteina} g Proteína | {totales.carbohidratos} g Carbs | {totales.grasas} g Grasas
			</div>
		</div>
	);
}
