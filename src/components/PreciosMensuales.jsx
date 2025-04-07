import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';

const PreciosMensuales = ({ productId }) => {
  const [preciosMensuales, setPreciosMensuales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPreciosMensuales = async () => {
      try {
        setIsLoading(true);
        // Consulta para obtener el producto específico
        const productoRef = collection(db, 'products');
        const q = query(productoRef, where('id', '==', productId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('No se encontró el producto');
          setIsLoading(false);
          return;
        }

        // Obtener el historial de precios del producto
        const producto = querySnapshot.docs[0].data();
        
        if (!producto.priceHistory || producto.priceHistory.length === 0) {
          setError('Este producto no tiene historial de precios');
          setIsLoading(false);
          return;
        }

        // Organizar los precios por mes
        const precios = {};
        
        producto.priceHistory.forEach(entry => {
          // Asegurarnos de que la fecha sea un objeto Date
          const fecha = entry.date instanceof Timestamp ? 
            entry.date.toDate() : 
            (entry.date instanceof Date ? entry.date : new Date(entry.date));
          
          const mes = fecha.getMonth();
          const año = fecha.getFullYear();
          const clave = `${año}-${mes + 1}`;
          
          if (!precios[clave]) {
            precios[clave] = {
              mes: new Date(año, mes, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
              precio: entry.price,
              fecha: fecha
            };
          } else {
            // Si ya existe una entrada para este mes, actualizar si la fecha es más reciente
            if (fecha > precios[clave].fecha) {
              precios[clave].precio = entry.price;
              precios[clave].fecha = fecha;
            }
          }
        });

        // Convertir objeto a array y ordenar por fecha
        const preciosArray = Object.values(precios).sort((a, b) => a.fecha - b.fecha);
        setPreciosMensuales(preciosArray);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al obtener precios mensuales:', err);
        setError('Error al cargar los datos de precios');
        setIsLoading(false);
      }
    };

    if (productId) {
      obtenerPreciosMensuales();
    }
  }, [productId]);

  if (isLoading) {
    return <div className="text-center py-4">Cargando datos de precios...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Precios Mensuales</h3>
      
      {preciosMensuales.length === 0 ? (
        <p className="text-gray-500">No hay datos de precios disponibles</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {preciosMensuales.map((item, index) => (
              <div key={index} className="border rounded p-3">
                <p className="text-sm text-gray-600">{item.mes}</p>
                <p className="text-lg font-bold">${item.precio.toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Gráfico de Tendencia</h4>
            <div className="h-24 flex items-end space-x-2 border-b border-gray-300">
              {preciosMensuales.map((item, index) => {
                // Calcular altura relativa para el gráfico
                const maxPrecio = Math.max(...preciosMensuales.map(p => p.precio));
                const altura = (item.precio / maxPrecio) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 bg-indigo-500 rounded-t"
                      style={{ height: `${altura}%`, minHeight: '10%' }}
                    ></div>
                    <span className="text-xs mt-1 transform -rotate-45 origin-top-left">
                      {item.mes.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PreciosMensuales; 