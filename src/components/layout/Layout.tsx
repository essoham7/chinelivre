import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, Menu, X, Package } from "lucide-react";
import clsx from "clsx";
import { getNavItems, Role } from "./nav";
import { BottomNav } from "./BottomNav";
import { InstallPrompt } from "../pwa/InstallPrompt";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const roleKey: Role = role === "admin" ? "admin" : "client";
  const navigation = getNavItems(roleKey);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">ChineLivre</span>
            </div>
            <button
              className="lg:hidden text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {role === "admin" ? "Transitaire" : "Client"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        clsx(
                          "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )
                      }
                    >
                      <item.icon
                        className={clsx(
                          "mr-3 h-5 w-5",
                          isActive ? "text-blue-600" : "text-gray-400"
                        )}
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white mobile-blur border-b border-gray-200 h-14 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-3 text-base font-semibold text-gray-900">
              {navigation.find((n) => n.href === location.pathname)?.name ||
                "ChineLivre"}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
        <BottomNav />
        <InstallPrompt />
      </div>
    </div>
  );
}
