'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard, BookOpen, ClipboardList,
  MessageSquare, User, Users, Settings, LogOut,
  BarChart2, GraduationCap, Menu, X
} from 'lucide-react';

const navAprendiz = [
  { href: '/dashboard',               label: 'Inicio',            icon: LayoutDashboard },
  { href: '/dashboard/programas',     label: 'Programas',         icon: BookOpen },
  { href: '/dashboard/inscripciones', label: 'Mis Inscripciones', icon: ClipboardList },
  { href: '/dashboard/chatbot',       label: 'ChatBot IA',        icon: MessageSquare },
  { href: '/dashboard/perfil',        label: 'Mi Perfil',         icon: User },
];

const navAdmin = [
  { href: '/dashboard/admin/overview',          label: 'Panel Admin',     icon: BarChart2 },
  { href: '/dashboard/admin/usuarios',          label: 'Usuarios',        icon: Users },
  { href: '/dashboard/admin/programas',         label: 'Programas',       icon: BookOpen },
  { href: '/dashboard/admin/inscripciones',     label: 'Inscripciones',   icon: ClipboardList },
  { href: '/dashboard/perfil',                  label: 'Mi Perfil',       icon: User },
];

const navCoordinador = [
  { href: '/dashboard/coordinador',   label: 'Mis Grupos',        icon: Users },
  { href: '/dashboard/programas',     label: 'Programas',         icon: BookOpen },
  { href: '/dashboard/perfil',        label: 'Mi Perfil',         icon: User },
];

const navProfesor = [
  { href: '/dashboard/profesor',      label: 'Mis Cursos',        icon: GraduationCap },
  { href: '/dashboard/programas',     label: 'Programas',         icon: BookOpen },
  { href: '/dashboard/perfil',        label: 'Mi Perfil',         icon: User },
];

const Sidebar = memo(function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  const navItems = useMemo(() => {
    if (usuario?.rol === 'Administrador') return navAdmin;
    if (usuario?.rol === 'Coordinador') return navCoordinador;
    if (usuario?.rol === 'Profesor') return navProfesor;
    return navAprendiz;
  }, [usuario?.rol]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary-600 text-white p-2 rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-primary-900 text-white flex flex-col min-h-screen flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

      {/* Logo */}
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-300" />
          <div>
            <div className="text-xl font-extrabold tracking-tight">SYNAPSE</div>
            <div className="text-primary-300 text-xs">Plataforma Académica</div>
          </div>
        </div>
      </div>

      {/* Usuario */}
      <div className="px-4 py-3 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {usuario?.nombres?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">
              {usuario?.nombres} {usuario?.apellidos}
            </div>
            <div className="text-primary-300 text-xs">{usuario?.rol}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {/* Separador para admin */}
        {usuario?.rol === 'Administrador' && (
          <>
            <div className="px-4 py-2">
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest">General</p>
            </div>
            {navAdmin.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg mb-0.5
                    ${active ? 'bg-primary-600 text-white font-semibold' : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`}>
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}

            <div className="px-4 py-2 mt-2">
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest">Administración</p>
            </div>
            {navAdmin.slice(2, 5).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg mb-0.5
                    ${active ? 'bg-primary-600 text-white font-semibold' : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`}>
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}

            <div className="px-4 py-2 mt-2">
              <p className="text-primary-400 text-xs font-semibold uppercase tracking-widest">Cuenta</p>
            </div>
            {navAdmin.slice(5).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg mb-0.5
                    ${active ? 'bg-primary-600 text-white font-semibold' : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`}>
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}

        {/* Nav para no-admin */}
        {usuario?.rol !== 'Administrador' && navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors mx-2 rounded-lg mb-0.5
                ${active ? 'bg-primary-600 text-white font-semibold' : 'text-primary-200 hover:bg-primary-800 hover:text-white'}`}>
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-primary-700">
        <button onClick={logout}
          className="flex items-center gap-3 text-primary-300 hover:text-white text-sm w-full px-2 py-2 rounded-lg hover:bg-primary-800 transition-colors">
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
    </>
  );
});

export default Sidebar;