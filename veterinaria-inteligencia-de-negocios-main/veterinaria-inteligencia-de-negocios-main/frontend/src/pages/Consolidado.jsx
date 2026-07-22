import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { RefreshCw, Package, Users, Database, BarChart3, Search, ExternalLink, Eye, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Color fijo por fuente (identidad). El texto de la fuente siempre acompaña al color.
const ORIGEN_STYLE = {
  BD_CASTILLON_VETERINARIA: 'bg-blue-100 text-blue-700',
  CASTILLONV2: 'bg-emerald-100 text-emerald-700',
  SamarImportadora: 'bg-amber-100 text-amber-700',
  DW_SamarImportadora: 'bg-violet-100 text-violet-700',
};

function OrigenBadge({ origen }) {
  const cls = ORIGEN_STYLE[origen] || 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>{origen || '—'}</span>;
}

function StatTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function money(n) {
  return typeof n === 'number' ? `S/${n.toFixed(2)}` : '—';
}

// ------------------------ Productos consolidados ------------------------
function TabProductos() {
  const [origen, setOrigen] = useState('');
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['consolidado-productos'],
    queryFn: () => api.get('/api/consolidado/productos').then((r) => r.data),
  });

  const origenes = [...new Set(productos.map((p) => p.bdOrigen).filter(Boolean))].sort();
  const filtrados = origen ? productos.filter((p) => p.bdOrigen === origen) : productos;

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <select value={origen} onChange={(e) => setOrigen(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Todas las fuentes ({productos.length})</option>
          {origenes.map((o) => <option key={o} value={o}>{o} ({productos.filter((p) => p.bdOrigen === o).length})</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtrados.length} productos</span>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-left">
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Producto</th>
              <th className="p-3 font-semibold">Categoría</th>
              <th className="p-3 font-semibold text-right">Precio</th>
              <th className="p-3 font-semibold text-right">Costo</th>
              <th className="p-3 font-semibold text-right">Stock</th>
              <th className="p-3 font-semibold">Marca</th>
              <th className="p-3 font-semibold">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.map((p) => (
              <tr key={p.idRegistro} className="hover:bg-gray-50/70">
                <td className="p-3 text-gray-400 font-mono text-xs">{p.idProducto || p.idRegistro}</td>
                <td className="p-3 font-medium text-gray-800">{p.nomProducto}</td>
                <td className="p-3 text-gray-600">{p.categoria || '—'}</td>
                <td className="p-3 text-right font-semibold tabular-nums">{money(p.precioUnitario)}</td>
                <td className="p-3 text-right text-gray-500 tabular-nums">{money(p.costoUnitario)}</td>
                <td className="p-3 text-right tabular-nums">{p.stockActual ?? '—'}</td>
                <td className="p-3 text-gray-600">{p.marca || '—'}</td>
                <td className="p-3"><OrigenBadge origen={p.bdOrigen} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <Empty>No hay productos para esta fuente.</Empty>}
      </div>
    </div>
  );
}

// ------------------------ Clientes consolidados ------------------------
function TabClientes() {
  const [busqueda, setBusqueda] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['consolidado-clientes', busqueda, page],
    queryFn: () => api.get('/api/consolidado/clientes', { params: { busqueda: busqueda || undefined, page, size } }).then((r) => r.data),
    keepPreviousData: true,
  });

  const total = data?.total ?? 0;
  const clientes = data?.contenido ?? [];
  const totalPages = Math.max(1, Math.ceil(total / size));

  const buscar = (e) => { e.preventDefault(); setPage(0); setBusqueda(input.trim()); };

  return (
    <div>
      <form onSubmit={buscar} className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Buscar por nombre, empresa o ID…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Buscar</button>
        <span className="text-sm text-gray-500 ml-auto">{total.toLocaleString()} clientes {isFetching && '…'}</span>
      </form>
      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-left">
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Nombre completo</th>
                <th className="p-3 font-semibold">Empresa</th>
                <th className="p-3 font-semibold">Tipo</th>
                <th className="p-3 font-semibold">Fuente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.map((c) => (
                <tr key={c.idRegistro} className="hover:bg-gray-50/70">
                  <td className="p-3 text-gray-400 font-mono text-xs">{c.idCliente || c.idRegistro}</td>
                  <td className="p-3 font-medium text-gray-800">{c.nombreCompleto || `${c.nombre || ''} ${c.apellido || ''}`.trim()}</td>
                  <td className="p-3 text-gray-600">{c.empresa || '—'}</td>
                  <td className="p-3 text-gray-600">{c.tipoCliente || '—'}</td>
                  <td className="p-3"><OrigenBadge origen={c.bdOrigen} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {clientes.length === 0 && <Empty>Sin resultados.</Empty>}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 text-sm">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
          className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">Anterior</button>
        <span className="text-gray-500">Página {page + 1} de {totalPages}</span>
        <button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages}
          className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40">Siguiente</button>
      </div>
    </div>
  );
}

// ------------------------ Power BI (un solo link) ------------------------
function TabPowerBi() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['powerbi'],
    queryFn: () => api.get('/api/consolidado/powerbi').then((r) => r.data),
  });

  const url = data?.url || '';
  const [input, setInput] = useState('');

  const guardar = useMutation({
    mutationFn: (nuevaUrl) => api.put('/api/consolidado/powerbi', { url: nuevaUrl }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['powerbi'] });
      toast.success('Enlace de Power BI guardado');
    },
    onError: () => toast.error('No se pudo guardar el enlace'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="block text-sm font-medium text-gray-700 mb-2">
            Enlace del reporte de Power BI publicado (un solo link con los dashboards)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={input || url}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://app.powerbi.com/view?r=..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => guardar.mutate(input || url)}
              disabled={guardar.isPending}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {guardar.isPending ? 'Guardando…' : 'Guardar'}
            </button>
            {url && (
              <button
                onClick={() => { setInput(''); guardar.mutate(''); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            En Power BI Service: “Archivo → Insertar informe → Publicar en la web (público)”, y pega aquí la URL.
          </p>
        </div>
      )}

      {url ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-600" /> Dashboards Consolidados</h3>
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              Abrir en Power BI <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <iframe title="Power BI Consolidado" src={url} className="w-full h-[600px] border-t border-gray-100" allowFullScreen />
        </div>
      ) : (
        <Empty>
          <p className="font-medium text-gray-600">Aún no hay un enlace de Power BI configurado.</p>
          <p className="text-xs mt-2 max-w-md mx-auto">
            {isAdmin
              ? 'Pega arriba la URL del reporte publicado y presiona Guardar.'
              : 'El administrador aún no ha configurado el dashboard.'}
          </p>
        </Empty>
      )}
    </div>
  );
}

// ------------------------ Análisis IA (HTML asistido con IA) ------------------------
function pct(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

// Genera insights en lenguaje natural a partir de los agregados consolidados.
function generarInsights(s) {
  const p = s.productos, c = s.clientes;
  const fuenteTopP = p.porFuente?.[0];
  const catTop = p.porCategoria?.[0];
  const persona = c.porTipo?.find((t) => (t.tipo || '').toUpperCase() === 'PERSONA');
  const insights = [];

  insights.push({ tone: 'good', icon: CheckCircle2,
    text: `Integración multi-fuente activa: se consolidaron ${p.total?.toLocaleString()} productos y ${c.total?.toLocaleString()} clientes desde 4 orígenes (veterinaria, CastillonV2, Samar OLTP y su Data Warehouse).` });

  if (fuenteTopP) insights.push({ tone: 'info', icon: TrendingUp,
    text: `${pct(fuenteTopP.total, p.total)}% de los productos provienen de ${fuenteTopP.fuente}, la fuente con mayor aporte al catálogo consolidado.` });

  if (catTop) insights.push({ tone: 'info', icon: BarChart3,
    text: `La categoría líder es "${catTop.categoria}" con ${catTop.total} productos; concentra la mayor oferta del inventario.` });

  if (p.precio?.promedio != null) insights.push({ tone: 'info', icon: Package,
    text: `El precio promedio consolidado es S/${Number(p.precio.promedio).toFixed(2)}, con un rango de S/${Number(p.precio.minimo).toFixed(2)} a S/${Number(p.precio.maximo).toFixed(2)}.` });

  if (persona) insights.push({ tone: 'info', icon: Users,
    text: `El ${pct(persona.total, c.total)}% de los clientes son personas naturales; el resto corresponde a empresas — útil para segmentar campañas.` });

  if (p.sinCosto > 0 || p.sinStock > 0) insights.push({ tone: 'warn', icon: AlertTriangle,
    text: `Calidad de datos: ${p.sinCosto} productos sin costo y ${p.sinStock} sin stock definido. Completarlos mejorará la precisión de los reportes de rentabilidad.` });

  return insights;
}

const TONE = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
};

function DistribBar({ items, total }) {
  const max = Math.max(...items.map((i) => i.total), 1);
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.fuente} className="flex items-center gap-3">
          <span className="w-44 shrink-0 text-xs text-gray-600 truncate" title={i.fuente}>{i.fuente}</span>
          <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
            <div className={`h-3 rounded ${ORIGEN_STYLE[i.fuente]?.replace('text-', 'bg-').split(' ').find((x) => x.startsWith('bg-')) || 'bg-blue-400'}`}
              style={{ width: `${(i.total / max) * 100}%` }} />
          </div>
          <span className="w-24 text-right text-xs tabular-nums text-gray-700">{i.total.toLocaleString()} · {pct(i.total, total)}%</span>
        </div>
      ))}
    </div>
  );
}

function TabAnalisis() {
  const { data: s, isLoading, isError } = useQuery({
    queryKey: ['consolidado-estadisticas'],
    queryFn: () => api.get('/api/consolidado/estadisticas').then((r) => r.data),
  });

  if (isLoading) return <Spinner />;
  if (isError || !s) return <Empty>No se pudieron cargar las estadísticas.</Empty>;

  const insights = generarInsights(s);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-white bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-bold">Análisis Inteligente</h2>
        </div>
        <p className="text-indigo-100 text-sm">Insights generados automáticamente por IA a partir de los datos de la base consolidada.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((ins, i) => (
          <div key={i} className={`flex gap-3 rounded-xl border p-4 ${TONE[ins.tone]}`}>
            <ins.icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-gray-400" /> Productos por fuente</h3>
          <DistribBar items={s.productos.porFuente} total={s.productos.total} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Clientes por fuente</h3>
          <DistribBar items={s.clientes.porFuente} total={s.clientes.total} />
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">Componente de análisis asistido por IA · se recalcula con cada consolidación.</p>
    </div>
  );
}

// ------------------------ Helpers ------------------------
function Spinner() {
  return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
}
function Empty({ children }) {
  return <div className="text-center py-12 text-gray-500">{children}</div>;
}

// ------------------------ Página ------------------------
export default function Consolidado() {
  const [tab, setTab] = useState('productos');
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: productos = [] } = useQuery({
    queryKey: ['consolidado-productos'],
    queryFn: () => api.get('/api/consolidado/productos').then((r) => r.data),
  });
  const { data: clientesMeta } = useQuery({
    queryKey: ['consolidado-clientes-meta'],
    queryFn: () => api.get('/api/consolidado/clientes', { params: { page: 0, size: 1 } }).then((r) => r.data),
  });

  const fuentesProd = new Set(productos.map((p) => p.bdOrigen).filter(Boolean)).size;

  const etl = useMutation({
    mutationFn: () => api.post('/api/consolidado/importar').then((r) => r.data),
    onSuccess: (res) => {
      const p = res?.procesados?.productos || {};
      const c = res?.procesados?.clientes || {};
      const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
      toast.success(`Consolidación completa: ${sum(p)} productos y ${sum(c)} clientes de ${Object.keys({ ...p, ...c }).length} fuentes`);
      queryClient.invalidateQueries();
    },
    onError: () => toast.error('Error al consolidar'),
  });

  const tabs = [
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'analisis', label: 'Análisis IA', icon: Sparkles },
    { id: 'powerbi', label: 'Power BI', icon: BarChart3 },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consolidado — Inteligencia de Negocios</h1>
          <p className="text-gray-500 text-sm mt-1">Datos unificados desde las 4 fuentes hacia la base consolidada</p>
        </div>
        {isAdmin ? (
          <button onClick={() => etl.mutate()} disabled={etl.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium">
            <RefreshCw className={`w-5 h-5 ${etl.isPending ? 'animate-spin' : ''}`} />
            {etl.isPending ? 'Consolidando…' : 'Consolidar ahora'}
          </button>
        ) : (
          <span className="flex items-center gap-2 text-gray-500 text-sm bg-gray-100 px-4 py-2 rounded-lg">
            <Eye className="w-4 h-4" /> Solo lectura
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile icon={Package} label="Productos consolidados" value={productos.length.toLocaleString()} sub={`${fuentesProd} fuentes con productos`} />
        <StatTile icon={Users} label="Clientes consolidados" value={(clientesMeta?.total ?? 0).toLocaleString()} />
        <StatTile icon={Database} label="Fuentes integradas" value="4" sub="Veterinaria · CastillonV2 · Samar · DW-Samar" />
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'productos' && <TabProductos />}
      {tab === 'clientes' && <TabClientes />}
      {tab === 'analisis' && <TabAnalisis />}
      {tab === 'powerbi' && <TabPowerBi />}
    </Layout>
  );
}
