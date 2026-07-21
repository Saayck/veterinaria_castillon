import { Users, Target, Award } from 'lucide-react';

export default function SobreNosotros() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Sobre Nosotros</h1>

      <div className="prose prose-lg mx-auto">
        <p className="text-gray-600 mb-6">
          Sistema Consolidado es una plataforma de gestión centralizada de productos diseñada para
          integrar información de múltiples bases de datos en un único punto de acceso. Nuestra
          solución permite a las empresas mantener consistencia entre sus sistemas de venta,
          inventario y catálogo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="text-center p-6 bg-white rounded shadow">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Nuestro Equipo</h3>
          <p className="text-gray-600 text-sm">Profesionales dedicados al desarrollo de soluciones empresariales</p>
        </div>
        <div className="text-center p-6 bg-white rounded shadow">
          <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Nuestra Misión</h3>
          <p className="text-gray-600 text-sm">Simplificar la gestión de datos en entornos distribuidos</p>
        </div>
        <div className="text-center p-6 bg-white rounded shadow">
          <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Nuestros Valores</h3>
          <p className="text-gray-600 text-sm">Compromiso, innovación y excelencia técnica</p>
        </div>
      </div>
    </div>
  );
}
