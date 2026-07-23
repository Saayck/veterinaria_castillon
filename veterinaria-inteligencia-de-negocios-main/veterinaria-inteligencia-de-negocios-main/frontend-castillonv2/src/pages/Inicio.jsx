import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Database, LogIn, Search, UtensilsCrossed, Package, Tags, ArrowRight } from 'lucide-react';

// Portada PÚBLICA del sistema Castillón V2: muestra el catálogo (carta) de la BD
// CASTILLONV2 sin necesidad de iniciar sesión, con acceso al login del portal.
export default function Inicio() {
  const { user, isExpired } = useAuth();
  const logueado = user && !isExpired;
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['catalogo-v2'],
    queryFn: () => api.get('/api/catalogo/castillonv2/productos').then((r) => r.data),
  });

  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria).filter(Boolean))],
    [productos]
  );
  const rows = useMemo(
    () => productos.filter((p) =>
      (!cat || p.categoria === cat) &&
      (p.nomProducto || '').toLowerCase().includes(search.toLowerCase())),
    [productos, search, cat]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar pública */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Database className="h-5 w-5" /></span>
            Castillón V2<span className="text-emerald-600">.</span>
          </span>
          <Link to={logueado ? '/portal' : '/login'} className="btn-primary">
            <LogIn className="h-4 w-4" /> {logueado ? 'Ir al portal' : 'Iniciar sesión'}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <UtensilsCrossed className="h-3.5 w-3.5" /> Sistema Castillón V2
          </p>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Bienvenido a Castillón V2</h1>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-50">
            Conoce nuestra carta: desayunos, almuerzos, bebidas y más. Toda la información
            sale en vivo de la base de datos <strong>CASTILLONV2</strong>.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#catalogo" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
              Ver la carta <ArrowRight className="h-4 w-4" />
            </a>
            <Link to={logueado ? '/portal' : '/login'} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
              <LogIn className="h-4 w-4" /> {logueado ? 'Ir al portal' : 'Iniciar sesión'}
            </Link>
          </div>
          {/* Stats */}
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="flex items-center justify-center gap-2 text-3xl font-bold"><Package className="h-6 w-6" />{productos.length}</p>
              <p className="text-sm text-emerald-100">Productos en carta</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="flex items-center justify-center gap-2 text-3xl font-bold"><Tags className="h-6 w-6" />{categorias.length}</p>
              <p className="text-sm text-emerald-100">Categorías</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo público */}
      <section id="catalogo" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-slate-900">Nuestra carta</h2>
        <p className="mt-1 text-sm text-slate-500">Catálogo público del sistema Castillón V2.</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="relative max-w-sm flex-1 basis-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Buscar en la carta…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setCat('')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${cat === '' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${cat === c ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-600" /></div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <div key={p.idProducto} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{p.nomProducto}</h3>
                  <span className="whitespace-nowrap rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white">S/{Number(p.precio ?? 0).toFixed(2)}</span>
                </div>
                {p.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.descripcion}</p>}
                <div className="mt-3 flex items-center gap-2">
                  {p.categoria && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">{p.categoria}</span>}
                  {p.marca && p.marca !== 'XXXXXXXX' && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{p.marca}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="py-14 text-center text-slate-400">No se encontraron productos.</div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-sm text-slate-400">
        <p>Sistema Castillón V2 — conectado exclusivamente a la BD <strong className="text-slate-500">CASTILLONV2</strong>.</p>
        <Link to="/login" className="mt-1 inline-flex items-center gap-1 text-emerald-600 hover:underline"><LogIn className="h-3.5 w-3.5" /> Acceso al portal de gestión</Link>
      </footer>
    </div>
  );
}
