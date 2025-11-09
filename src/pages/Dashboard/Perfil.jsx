/* Alex_fit/src/pages/Dashboard/Perfil.jsx */
import React from "react";
import { supabase } from "../../utils/supabaseClient";
export default function Perfil() {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const fetchUsuario = async () => {
        const { data, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", "alex@example.com") // 🔹 más adelante esto vendrá del login
            .single();

        if (error) console.error("Error cargando usuario:", error);
        else setUsuario(data);
        };

        fetchUsuario();
    }, []);

    if (!usuario)
        return <div className="card">Cargando datos del usuario...</div>;

    return (
        <div className="card max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Perfil del Usuario</h2>

        <div className="space-y-2">
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Edad:</strong> 20</p>
            <p><strong>Peso:</strong> {usuario.peso} kg</p>
            <p><strong>Altura:</strong> {usuario.altura} m</p>
            <p><strong>Grasa corporal:</strong> {usuario.grasa}%</p>
            <p><strong>Objetivo:</strong> {usuario.objetivo}</p>
        </div>
        </div>
    );
}