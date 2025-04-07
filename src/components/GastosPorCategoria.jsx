import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';

const GastosPorCategoria = () => {
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [gastosPorTipo, setGastosPorTipo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('todos');

  useEffect(() => {
    const obtenerGastosPorCategoria = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las categorías
        const categoriasQuery = await getDocs(collection(db, 'categories'));
        const categorias = categoriasQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Obtener todos los productos activos
        const productosQuery = await getDocs(
          query(collection(db, 'products'), where('active', '==', true))
        );
        
        const productos = productosQuery.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calcular gastos por categoría
        const gastosCategorias = {};
        const gastosTipos = {
          alimento: { total: 0, categorias: {} },
          limpieza: { total: 0, categorias: {} },
          otros: { total: 0, categorias: {} }
        };
        
        productos.forEach(producto => {
          const categoria = producto.category;
          const precio = parseFloat(producto.price) || 0;
          
          // Agregar a gastos por categoría
          if (!gastosCategorias[categoria]) {
            gastosCategorias[categoria] = {
              nombre: categoria,
              total: 0,
              productos: []
            };
          }
          
          gastosCategorias[categoria].total += precio;
          gastosCategorias[categoria].productos.push(producto);
          
          // Determinar el tipo de categoría
          const categoriaInfo = categorias.find(c => c.name === categoria);
          const tipo = categoriaInfo?.type || 'otros';
          
          // Agregar a gastos por tipo
          if (!gastosTipos[tipo].categorias[categoria]) {
            gastosTipos[tipo].categorias[categoria] = 0;
          }
          
          gastosTipos[tipo].categorias[categoria] += precio;
          gastosTipos[tipo].total += precio;
        });
        
        setGastosPorCategoria(gastosCategorias);
        setGastosPorTipo(gastosTipos);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener gastos por categoría:', err);
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };
    
    obtenerGastosPorCategoria();
  }, []);
  
  // Filtrar categorías según el tipo seleccionado
  const categoriasFiltradas = () => {
    if (tipoSeleccionado === 'todos') {
      return Object.values(gastosPorCategoria);
    }
    
    return Object.entries(gastosPorCategoria)
      .filter(([categoria]) => {
        const categoriaEnTipo = Object.keys(gastosPorTipo[tipoSeleccionado]?.categorias || {});
        return categoriaEnTipo.includes(categoria);
      })
      .map(([, datos]) => datos);
  };
  
  // Calcular total general
  const totalGeneral = Object.values(gastosPorTipo).reduce(
    (sum, tipo) => sum + tipo.total, 
    0
  );

  if (loading) {
    return <div className="text-center py-6">Cargando datos de gastos...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Gastos por Categoría</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-medium">Resumen por Tipo</h4>
          <div className="flex space-x-2">
            <button 
              className={`categoria-btn btn-todos ${tipoSeleccionado === 'todos' ? 'active' : ''}`}
              onClick={() => setTipoSeleccionado('todos')}
            >
              <i className="fas fa-list"></i> Todos
            </button>
            <button 
              className={`categoria-btn btn-alimentos ${tipoSeleccionado === 'alimento' ? 'active' : ''}`}
              onClick={() => setTipoSeleccionado('alimento')}
            >
              <i className="fas fa-apple-alt"></i> Alimentos
            </button>
            <button 
              className={`categoria-btn btn-limpieza ${tipoSeleccionado === 'limpieza' ? 'active' : ''}`}
              onClick={() => setTipoSeleccionado('limpieza')}
            >
              <i className="fas fa-soap"></i> Limpieza
            </button>
            <button 
              className={`categoria-btn btn-otros ${tipoSeleccionado === 'otros' ? 'active' : ''}`}
              onClick={() => setTipoSeleccionado('otros')}
            >
              <i className="fas fa-box"></i> Otros
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Alimentos</div>
            <div className="text-2xl font-bold">${gastosPorTipo.alimento.total.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">{Object.keys(gastosPorTipo.alimento.categorias).length} categorías</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Limpieza</div>
            <div className="text-2xl font-bold">${gastosPorTipo.limpieza.total.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">{Object.keys(gastosPorTipo.limpieza.categorias).length} categorías</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Total</div>
            <div className="text-2xl font-bold">${totalGeneral.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">{Object.keys(gastosPorCategoria).length} categorías</div>
          </div>
        </div>
      </div>
      
      <h4 className="text-lg font-medium mb-3">Desglose por Categoría</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Categoría</th>
              <th className="py-2 px-4 border-b text-right">Total Gastado</th>
              <th className="py-2 px-4 border-b text-right">Productos</th>
              <th className="py-2 px-4 border-b text-right">% del Total</th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas().sort((a, b) => b.total - a.total).map((categoria, index) => {
              // Determinar el estilo de la categoría
              let categoriaClass = '';
              let categoriaIcon = '';
              
              if (categoria.nombre === 'Carnes') {
                categoriaClass = 'text-red-600';
                categoriaIcon = 'fa-drumstick-bite';
              } else if (categoria.nombre === 'Lácteos') {
                categoriaClass = 'text-blue-600';
                categoriaIcon = 'fa-cheese';
              } else if (categoria.nombre === 'Cereales') {
                categoriaClass = 'text-amber-600';
                categoriaIcon = 'fa-wheat';
              } else if (categoria.nombre.includes('Frut')) {
                categoriaClass = 'text-green-600';
                categoriaIcon = 'fa-apple-alt';
              } else if (categoria.nombre.includes('Bebida')) {
                categoriaClass = 'text-indigo-600';
                categoriaIcon = 'fa-bottle-water';
              }
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className={`py-2 px-4 border-b ${categoriaClass} font-medium`}>
                    {categoriaIcon && <i className={`fas ${categoriaIcon} mr-2`}></i>}
                    {categoria.nombre}
                  </td>
                  <td className="py-2 px-4 border-b text-right font-medium">${categoria.total.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b text-right">{categoria.productos.length}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {((categoria.total / totalGeneral) * 100).toFixed(1)}%
                    <div className="w-full bg-gray-200 h-1 mt-1 rounded-full">
                      <div 
                        className={`h-1 rounded-full ${
                          categoria.nombre === 'Carnes' ? 'bg-red-500' :
                          categoria.nombre === 'Lácteos' ? 'bg-blue-500' :
                          categoria.nombre === 'Cereales' ? 'bg-amber-500' :
                          'bg-indigo-600'
                        }`}
                        style={{width: `${(categoria.total / totalGeneral) * 100}%`}}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastosPorCategoria; 