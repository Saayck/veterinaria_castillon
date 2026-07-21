import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ArrowRight, Package, ShoppingCart, RefreshCw, Users, Target, Award, Mail, Phone, MapPin } from 'lucide-react';
import ProductCard from '../components/ProductCard';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Inicio() {
  const container = useRef(null);
  const { addToCart } = useCart();

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos-public'],
    queryFn: () => api.get('/api/catalogo/productos').then((r) => r.data),
  });

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.hero-title', { y: 60, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-subtitle', { y: 40, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.from('.hero-cta', { y: 30, opacity: 0, duration: 0.8, delay: 0.6, ease: 'power3.out' });

      gsap.from('.feature-card', {
        y: 80, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.features', start: 'top 75%' }
      });

      gsap.from('.section-title', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-title', start: 'top 85%' }
      });

      gsap.from('.about-card', {
        y: 60, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-grid', start: 'top 80%' }
      });

      gsap.from('.contact-item', {
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-section', start: 'top 80%' }
      });

      gsap.from('.contact-form', {
        x: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-section', start: 'top 80%' }
      });
    });

    return () => mm.revert();
  }, { scope: container });

  return (
    <div ref={container}>
      <section id="inicio" className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/inicio-hero.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 opacity-80 mix-blend-multiply" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h1 className="hero-title text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Consolidado<span className="text-blue-400">.</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl mb-8 text-blue-100">
            Gestión centralizada de productos con sincronización automática entre bases de datos
          </p>
          <Link
            to="/login"
            className="hero-cta inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-2xl"
          >
            Comenzar <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-sm animate-bounce">
          ↓ Desliza para ver más
        </div>
      </section>

      <section className="features py-20 max-w-6xl mx-auto px-6">
        <h2 className="section-title text-4xl font-bold text-center mb-12">Nuestras Características</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Package className="w-8 h-8 text-blue-600" />, color: 'blue', title: 'Catálogo Centralizado', desc: 'Productos de múltiples orígenes en un solo lugar' },
            { icon: <RefreshCw className="w-8 h-8 text-green-600" />, color: 'green', title: 'Sincronización Automática', desc: 'Los cambios se propagan a las bases de origen en tiempo real' },
            { icon: <ShoppingCart className="w-8 h-8 text-purple-600" />, color: 'purple', title: 'Catálogo de Productos', desc: 'Explora nuestra amplia variedad de productos disponibles' },
          ].map((f, i) => (
            <div key={i} className="feature-card text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className={`w-16 h-16 bg-${f.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="productos" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="section-title text-4xl font-bold text-center mb-4">Nuestros Productos</h2>
          <p className="text-center text-gray-500 mb-12">Descubre nuestra colección de productos</p>
          {isLoading ? (
            <p className="text-center text-gray-400">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="text-center text-gray-400">No hay productos disponibles</p>
          ) : (
            <div id="productos-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.slice(0, 9).map((p) => (
                <ProductCard key={p.idProducto} p={p} />
              ))}
            </div>
          )}
          {productos.length > 9 && (
            <div className="text-center mt-8">
              <Link to="/catalog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                Ver todos los productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
