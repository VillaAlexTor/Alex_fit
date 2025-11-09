import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function LayoutDashboard() {
    return (
        <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1">
            <Navbar />
            <main className="p-6 overflow-y-auto">
            <Outlet />
            </main>
        </div>
        </div>
    );
}
