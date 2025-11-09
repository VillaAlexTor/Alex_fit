import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-5xl font-bold text-gray-700 mb-4">404</h1>
        <p className="text-gray-600 mb-4">Página no encontrada</p>
        <Link to="/" className="text-blue-600 hover:underline">
            Volver al inicio
        </Link>
        </div>
    );
}