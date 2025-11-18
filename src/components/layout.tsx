"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";

const menuItems = [
    { label: "Loại sản phẩm", href: "/product-types" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Người dùng", href: "/users" },
];

export function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useUser();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">IGV Admin</h1>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`block px-4 py-2 rounded transition ${pathname === item.href
                                            ? "bg-blue-500 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}