import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PreciosMensuales from "./PreciosMensuales";
import GastosPorCategoria from "./GastosPorCategoria";

// Simulación de datos para gráficos sin dependencia de Chart.js
function Home() {
  const navigate = useNavigate();
  const [store, setStore] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState({ name: "", brand: "", price: "", unit: "" });
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState(""); // Filtro por tipo: alimento/limpieza
  const [filterGroup, setFilterGroup] = useState(""); // Nuevo filtro por grupo
  const [filterPrice, setFilterPrice] = useState({ min: "", max: "" });
  const [priceHistory, setPriceHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [view, setView] = useState("products"); // productos, análisis, ayuda
  
  // Modal de confirmación para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Obtener productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener productos
        const productsQuery = await getDocs(collection(db, "products"));
        const productsData = productsQuery.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          active: doc.data().active !== false // Si no existe, se establece como true
        }));
        setProducts(productsData);
        
        // Obtener categorías
        const categoriesQuery = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);
        
        console.log(`Se cargaron ${categoriesData.length} categorías`);
        
        // Generar datos de historial de precios simulados para demostración
        generateSampleData(productsData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    
    fetchData();
  }, []);
  
  // Función para generar datos de muestra para demostración
  const generateSampleData = (products) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const prices = {};
    
    // Simular historial de precios para cada producto con precios más realistas
    products.forEach(product => {
      // Precio base del producto
      const basePrice = parseFloat(product.price);
      
      // Genera una serie de precios con variaciones lógicas para cada mes
      prices[product.id] = months.map((month, index) => {
        // Pequeña fluctuación basada en el índice del mes (tendencia ligera al alza)
        const variation = ((Math.random() * 6) - 2) + (index * 0.5); 
        const newPrice = basePrice + variation;
        return {
          month,
          price: Math.max(newPrice, 0).toFixed(2) // Asegura dos decimales y no precios negativos
        };
      });
    });
    
    setPriceHistory(prices);
  };

  const handleAddProduct = async () => {
    if (!store || !category || !product.name || !product.price) return alert("Todos los campos son obligatorios.");
    try {
      const now = new Date();
      const initialPriceRecord = {
        date: now,
        price: parseFloat(product.price),
        timestamp: now.getTime(),
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
        isInitial: true
      };
      
      const newProduct = { 
        ...product, 
        store, 
        category, 
        active: true,
        price: parseFloat(product.price),
        priceHistory: [initialPriceRecord],
        created: now,
        lastUpdated: now
      };
      
      const docRef = await addDoc(collection(db, "products"), newProduct);
      alert("Producto agregado exitosamente.");
      
      // Actualizar listado de productos
      setProducts([...products, { id: docRef.id, ...newProduct }]);
      
      // Limpiar formulario
      setProduct({ name: "", brand: "", price: "", unit: "" });
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  const handleToggleProductStatus = async (id) => {
    try {
      const productToToggle = products.find(p => p.id === id);
      const newStatus = !productToToggle.active;
      
      await updateDoc(doc(db, "products", id), { active: newStatus });
      
      // Actualizar en la interfaz
      setProducts(products.map(p => 
        p.id === id ? { ...p, active: newStatus } : p
      ));
      
      alert(newStatus ? "Producto activado." : "Producto desactivado.");
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
    }
  };
  
  // Función para eliminar un producto
  const handleDeleteProduct = async (id) => {
    console.log("Intentando eliminar producto con ID:", id);
    // Abre el modal y guarda el ID del producto a eliminar
    setProductToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", productToDelete));
      
      // Actualizar en la interfaz
      setProducts(products.filter(p => p.id !== productToDelete));
      
      // Cierra el modal y limpia el productToDelete
      setShowDeleteModal(false);
      setProductToDelete(null);
      
      alert("Producto eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto. Por favor, intenta de nuevo.");
    }
  };
  
  // Función para cancelar la eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };
  
  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setView("analysis");
  };
  
  // Filtrar productos según criterios
  const filteredProducts = products.filter(p => {
    const matchesText = p.name?.toLowerCase().includes(filter.toLowerCase()) || 
                     p.brand?.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = filterCategory ? p.category === filterCategory : true;
    const matchesType = filterType ? (categories.find(c => c.name === p.category)?.type === filterType) : true;
    
    // Filtrar por grupo
    const matchesGroup = filterGroup ? (
      categories.find(c => c.name === p.category)?.group === filterGroup
    ) : true;
    
    const matchesMinPrice = filterPrice.min ? parseFloat(p.price) >= parseFloat(filterPrice.min) : true;
    const matchesMaxPrice = filterPrice.max ? parseFloat(p.price) <= parseFloat(filterPrice.max) : true;
    
    return matchesText && matchesCategory && matchesType && matchesGroup && matchesMinPrice && matchesMaxPrice;
  });

  // Categorías agrupadas por tipo
  const categoriesByType = {
    alimento: categories.filter(c => c.type === 'alimento'),
    limpieza: categories.filter(c => c.type === 'limpieza'),
    otros: categories.filter(c => !c.type || (c.type !== 'alimento' && c.type !== 'limpieza'))
  };

  // Categorías agrupadas por grupo
  const categoriesByGroup = {};
  categories.forEach(cat => {
    if (cat.group) {
      if (!categoriesByGroup[cat.type]) {
        categoriesByGroup[cat.type] = {};
      }
      if (!categoriesByGroup[cat.type][cat.group]) {
        categoriesByGroup[cat.type][cat.group] = [];
      }
      categoriesByGroup[cat.type][cat.group].push(cat);
    }
  });

  // Obtener grupos únicos para el tipo seleccionado
  const getUniqueGroups = useCallback((type) => {
    if (!type) return [];
    
    const groups = new Set();
    categories
      .filter(c => c.type === type && c.group)
      .forEach(c => groups.add(c.group));
    
    return Array.from(groups).sort();
  }, [categories]);

  const uniqueGroups = getUniqueGroups(filterType);

  // Verifica que todas las categorías se carguen correctamente
  useEffect(() => {
    if (categories.length > 0) {
      console.log(`Categorías cargadas: ${categories.length}`);
      console.log(`Alimentos: ${categoriesByType.alimento.length}`);
      console.log(`Limpieza: ${categoriesByType.limpieza.length}`);
      console.log(`Otros: ${categoriesByType.otros.length}`);
      
      // Verificar grupos
      const gruposAlimentos = getUniqueGroups('alimento');
      const gruposLimpieza = getUniqueGroups('limpieza');
      console.log(`Grupos de alimentos: ${gruposAlimentos.length} (${gruposAlimentos.join(', ')})`);
      console.log(`Grupos de limpieza: ${gruposLimpieza.length} (${gruposLimpieza.join(', ')})`);
    }
  }, [categories, categoriesByType.alimento.length, categoriesByType.limpieza.length, categoriesByType.otros.length, getUniqueGroups]);

  // Función para editar un producto
  const handleEditProduct = async (updatedProduct) => {
    try {
      const productToUpdate = products.find(p => p.id === updatedProduct.id);
      const now = new Date();

      // Solo crear nuevo registro en el historial si el precio ha cambiado
      let newPriceHistory = [...(productToUpdate.priceHistory || [])];
      
      if (parseFloat(updatedProduct.price) !== parseFloat(productToUpdate.price)) {
        const newPriceRecord = {
          date: now,
          price: parseFloat(updatedProduct.price),
          previousPrice: parseFloat(productToUpdate.price),
          timestamp: now.getTime(),
          year: now.getFullYear(),
          month: now.getMonth(),
          day: now.getDate()
        };
        newPriceHistory.push(newPriceRecord);
      }

      const updatedFields = {
        name: updatedProduct.name,
        brand: updatedProduct.brand,
        price: parseFloat(updatedProduct.price),
        category: updatedProduct.category,
        store: updatedProduct.store,
        unit: updatedProduct.unit,
        priceHistory: newPriceHistory,
        lastUpdated: now
      };

      await updateDoc(doc(db, "products", updatedProduct.id), updatedFields);

      // Actualizar el producto en el estado local
      setProducts(products.map(p => 
        p.id === updatedProduct.id ? { 
          ...p, 
          ...updatedFields
        } : p
      ));

      setShowEditModal(false);
      setEditingProduct(null);
      alert("Producto actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("Error al actualizar el producto. Por favor, intenta de nuevo.");
    }
  };

  return (
    <div className="home-container">
      {/* Modal de confirmación para eliminar producto */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirmar eliminación</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <p>¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
              {productToDelete && (
                <div className="product-to-delete">
                  <p><strong>{products.find(p => p.id === productToDelete)?.name}</strong></p>
                  <p>{products.find(p => p.id === productToDelete)?.brand} - {products.find(p => p.id === productToDelete)?.category}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete} style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 20px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edición de producto */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Editar Producto</h3>
              <button className="modal-close" onClick={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-store"></i>
                    <input 
                      type="text" 
                      placeholder="Tienda" 
                      className="input-field" 
                      value={editingProduct.store || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, store: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-layer-group"></i>
                    <select 
                      className="input-field categoria-selector" 
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-shopping-cart"></i>
                    <input 
                      type="text" 
                      placeholder="Nombre del producto" 
                      className="input-field" 
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-tag"></i>
                    <input 
                      type="text" 
                      placeholder="Marca" 
                      className="input-field" 
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-dollar-sign"></i>
                    <input 
                      type="number" 
                      placeholder="Precio" 
                      className="input-field" 
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-with-icon">
                    <i className="fas fa-balance-scale"></i>
                    <input 
                      type="text" 
                      placeholder="Unidad de medida" 
                      className="input-field" 
                      value={editingProduct.unit || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-edit"
                onClick={() => handleEditProduct(editingProduct)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 20px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="home-header">
        <h2 className="home-title">Gestión de Productos</h2>
        <div className="header-buttons">
          <button 
            onClick={() => setView("products")} 
            className={`btn ${view === "products" ? "btn-primary" : "btn-secondary"} btn-icon`}
            style={{ width: 'auto', marginRight: '10px' }}
          >
            <i className="fas fa-shopping-cart"></i>
            Productos
          </button>
          <button 
            onClick={() => setView("analysis")} 
            className={`btn ${view === "analysis" ? "btn-primary" : "btn-secondary"} btn-icon`}
            style={{ width: 'auto', marginRight: '10px' }}
          >
            <i className="fas fa-chart-line"></i>
            Análisis
          </button>
          <button 
            onClick={() => navigate("/help")} 
            className="btn btn-secondary btn-icon"
            style={{ width: 'auto', marginRight: '10px' }}
          >
            <i className="fas fa-question-circle"></i>
            Ayuda
          </button>
          <button 
            onClick={() => navigate("/security")} 
            className="btn btn-secondary btn-icon"
            style={{ width: 'auto', marginRight: '10px' }}
          >
            <i className="fas fa-shield-alt"></i>
            Seguridad
          </button>
          <button 
            onClick={() => auth.signOut().then(() => navigate("/"))} 
            className="btn btn-danger btn-icon"
            style={{ width: 'auto' }}
          >
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {view === "products" && (
        <>
          <div className="product-form">
            <h3 className="form-title">Agregar Nuevo Producto</h3>
            <div className="form-grid">
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-store"></i>
                  <input 
                    type="text" 
                    placeholder="Tienda" 
                    className="input-field" 
                    value={store}
                    onChange={(e) => setStore(e.target.value)} 
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-layer-group"></i>
                  <select 
                    className="input-field categoria-selector" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    
                    <option value="Carnes" className="categoria-alimento">🥩 Carnes</option>
                    <option value="Lácteos" className="categoria-alimento">🧀 Lácteos</option>
                    <option value="Cereales" className="categoria-alimento">🌾 Cereales</option>
                    {categoriesByType.alimento
                      .filter(cat => !['Carnes', 'Lácteos', 'Cereales'].includes(cat.name))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(cat => (
                        <option key={cat.id} value={cat.name} className="categoria-alimento">
                          {cat.name}
                        </option>
                      ))
                    }
                    
                    {categoriesByType.limpieza
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(cat => (
                        <option key={cat.id} value={cat.name} className="categoria-limpieza">
                          {cat.name}
                        </option>
                      ))
                    }
                    
                    {categoriesByType.otros.length > 0 && (
                      <>
                        {categoriesByType.otros
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(cat => (
                            <option key={cat.id} value={cat.name} className="categoria-otro">
                              {cat.name}
                            </option>
                          ))
                        }
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-shopping-cart"></i>
                  <input 
                    type="text" 
                    placeholder="Nombre del producto" 
                    className="input-field" 
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })} 
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-tag"></i>
                  <input 
                    type="text" 
                    placeholder="Marca" 
                    className="input-field" 
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })} 
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-dollar-sign"></i>
                  <input 
                    type="number" 
                    placeholder="Precio" 
                    className="input-field" 
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })} 
                  />
                </div>
              </div>
              <div className="input-group">
                <div className="input-with-icon">
                  <i className="fas fa-balance-scale"></i>
                  <input 
                    type="text" 
                    placeholder="Unidad de medida" 
                    className="input-field" 
                    value={product.unit}
                    onChange={(e) => setProduct({ ...product, unit: e.target.value })} 
                  />
                </div>
              </div>
            </div>
            <button onClick={handleAddProduct} className="btn btn-secondary btn-icon" style={{ maxWidth: '200px' }}>
              <i className="fas fa-plus-circle"></i>
              Agregar Producto
            </button>
          </div>

          <div className="product-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="list-title">Lista de Productos</h3>
            </div>
            
            <div className="categorias-container">
              <button 
                onClick={() => {setFilterType('alimento'); setFilterCategory(''); setFilterGroup('');}}
                className={`categoria-btn btn-alimentos ${filterType === 'alimento' ? 'active' : ''}`}
              >
                <span className="flex items-center">
                  <i className="fas fa-apple-alt"></i>
                  <span className="ml-1">Alimentos</span>
                  <span className="ml-2 flex">
                    <i className="fas fa-drumstick-bite text-xs mx-0.5 categoria-icon icon-carnes"></i>
                    <i className="fas fa-cheese text-xs mx-0.5 categoria-icon icon-lacteos"></i>
                    <i className="fas fa-wheat text-xs mx-0.5 categoria-icon icon-granos"></i>
                  </span>
                </span>
              </button>
              <button 
                onClick={() => {setFilterType('limpieza'); setFilterCategory(''); setFilterGroup('');}}
                className={`categoria-btn btn-limpieza ${filterType === 'limpieza' ? 'active' : ''}`}
              >
                <i className="fas fa-soap"></i> Limpieza
              </button>
              <button 
                onClick={() => {setFilterType(''); setFilterCategory(''); setFilterGroup('');}}
                className={`categoria-btn btn-todos ${filterType === '' && filterCategory === '' ? 'active' : ''}`}
              >
                <i className="fas fa-list"></i> Todos
              </button>
              
              {filterType !== '' && (
                <div className="subcategorias-container">
                  {/* Mostrar filtros por grupos si hay un tipo seleccionado */}
                  {uniqueGroups.length > 0 && (
                    <div className="grupo-container">
                      <div className={`grupo-titulo ${filterType === 'alimento' ? 'alimentos' : 'limpieza'}`}>
                        <i className={`fas ${filterType === 'alimento' ? 'fa-utensils' : 'fa-spray-can'}`}></i>
                        Grupos de {filterType === 'alimento' ? 'Alimentos' : 'Productos de Aseo'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setFilterGroup('')}
                          className={`grupo-btn grupo-todos-btn ${filterGroup === '' ? 'active' : ''}`}
                        >
                          <i className={`fas ${filterType === 'alimento' ? 'fa-utensils' : 'fa-spray-can'}`}></i> 
                          Todos los grupos
                        </button>
                        
                        {filterType === 'alimento' && uniqueGroups.map(group => {
                          let btnClass = '';
                          let iconClass = '';
                          
                          if (group === 'Frescos y Perecederos') {
                            btnClass = 'grupo-frescos-btn';
                            iconClass = 'fa-apple-alt';
                          } else if (group === 'Procesados y Envasados') {
                            btnClass = 'grupo-procesados-btn';
                            iconClass = 'fa-utensils';
                          } else if (group === 'Congelados') {
                            btnClass = 'grupo-congelados-btn';
                            iconClass = 'fa-snowflake';
                          } else if (group === 'Panadería y Repostería') {
                            btnClass = 'grupo-panaderia-btn';
                            iconClass = 'fa-bread-slice';
                          } else if (group === 'Cereales y Granos') {
                            btnClass = 'grupo-cereales-btn';
                            iconClass = 'fa-wheat';
                          } else if (group === 'Bebidas') {
                            btnClass = 'grupo-bebidas-btn';
                            iconClass = 'fa-bottle-water';
                          } else if (group === 'Snacks y Dulces') {
                            btnClass = 'grupo-snacks-btn';
                            iconClass = 'fa-cookie';
                          }
                          
                          return (
                            <button 
                              key={group}
                              onClick={() => setFilterGroup(group)}
                              className={`grupo-btn ${btnClass} ${filterGroup === group ? 'active' : ''}`}
                            >
                              <i className={`fas ${iconClass}`}></i> {group}
                            </button>
                          );
                        })}
                        
                        {filterType === 'limpieza' && uniqueGroups.map(group => {
                          let btnClass = '';
                          let iconClass = '';
                          
                          if (group === 'Limpieza del Hogar') {
                            btnClass = 'grupo-limpieza-hogar-btn';
                            iconClass = 'fa-broom';
                          } else if (group === 'Cuidado Personal') {
                            btnClass = 'grupo-cuidado-personal-btn';
                            iconClass = 'fa-pump-soap';
                          } else if (group === 'Productos Especializados') {
                            btnClass = 'grupo-especializados-btn';
                            iconClass = 'fa-spray-can-sparkles';
                          }
                          
                          return (
                            <button 
                              key={group}
                              onClick={() => setFilterGroup(group)}
                              className={`grupo-btn ${btnClass} ${filterGroup === group ? 'active' : ''}`}
                            >
                              <i className={`fas ${iconClass}`}></i> {group}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Mostrar categorías dentro del grupo seleccionado o todas si no hay grupo */}
                  <div className="subcategorias-contenedor">
                    <div className={`grupo-titulo ${filterType === 'alimento' ? 'alimentos' : 'limpieza'}`}>
                      <i className={`fas ${filterType === 'alimento' ? 'fa-apple-alt' : 'fa-soap'}`}></i>
                      Categorías {filterGroup ? `de ${filterGroup}` : ''}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterType === 'alimento' && (
                        <>
                          <div className="flex flex-wrap gap-2 w-full">
                            {(!filterGroup || filterGroup === 'Frescos y Perecederos') && (
                              <div className="flex gap-2 mb-1">
                                <button 
                                  onClick={() => setFilterCategory('Carnes')}
                                  className={`subcategoria-btn subcategoria-carnes ${filterCategory === 'Carnes' ? 'active' : ''}`}
                                >
                                  <i className="fas fa-drumstick-bite categoria-icon icon-carnes"></i>Carnes
                                </button>
                                <button 
                                  onClick={() => setFilterCategory('Lácteos')}
                                  className={`subcategoria-btn subcategoria-lacteos ${filterCategory === 'Lácteos' ? 'active' : ''}`}
                                >
                                  <i className="fas fa-cheese categoria-icon icon-lacteos"></i>Lácteos
                                </button>
                                {(!filterGroup || filterGroup === 'Cereales y Granos') && (
                                  <button 
                                    onClick={() => setFilterCategory('Cereales')}
                                    className={`subcategoria-btn subcategoria-granos ${filterCategory === 'Cereales' ? 'active' : ''}`}
                                  >
                                    <i className="fas fa-wheat categoria-icon icon-granos"></i>Cereales
                                  </button>
                                )}
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {categoriesByType.alimento
                                .filter(cat => 
                                  !['Carnes', 'Lácteos', 'Cereales'].includes(cat.name) && 
                                  (!filterGroup || cat.group === filterGroup)
                                )
                                .slice(0, 12)
                                .map(cat => (
                                  <button 
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.name)}
                                    className={`subcategoria-btn subcategoria-alimentos ${filterCategory === cat.name ? 'active' : ''}`}
                                  >
                                    {cat.name}
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        </>
                      )}
                      
                      {filterType === 'limpieza' && categoriesByType.limpieza
                        .filter(cat => !filterGroup || cat.group === filterGroup)
                        .slice(0, 12)
                        .map(cat => (
                          <button 
                            key={cat.id}
                            onClick={() => setFilterCategory(cat.name)}
                            className={`subcategoria-btn subcategoria-limpieza ${filterCategory === cat.name ? 'active' : ''}`}
                          >
                            {cat.name}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-container">
              <div className="filter-row">
                <div className="filter-group">
                  <label><i className="fas fa-search"></i> Buscar:</label>
                  <input 
                    type="text" 
                    placeholder="Filtrar por nombre o marca" 
                    className="filter-input" 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)} 
                  />
                </div>
                
                <div className="filter-group">
                  <label><i className="fas fa-tag"></i> Tipo:</label>
                  <select 
                    className="filter-input categoria-selector"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setFilterGroup('');
                      setFilterCategory('');
                    }}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="alimento" className="categoria-alimento">🍎 Alimentos</option>
                    <option value="limpieza" className="categoria-limpieza">🧼 Limpieza</option>
                  </select>
                </div>
                
                {filterType && uniqueGroups.length > 0 && (
                  <div className="filter-group">
                    <label><i className="fas fa-object-group"></i> Grupo:</label>
                    <select 
                      className="filter-input categoria-selector"
                      value={filterGroup}
                      onChange={(e) => {
                        setFilterGroup(e.target.value);
                        setFilterCategory('');
                      }}
                    >
                      <option value="">Todos los grupos</option>
                      {uniqueGroups.map(group => {
                        let icon = "";
                        
                        // Asignar iconos para grupos de alimentos
                        if (filterType === 'alimento') {
                          if (group === 'Frescos y Perecederos') icon = "🥬";
                          else if (group === 'Procesados y Envasados') icon = "🥫";
                          else if (group === 'Congelados') icon = "❄️";
                          else if (group === 'Panadería y Repostería') icon = "🍞";
                          else if (group === 'Cereales y Granos') icon = "🌾";
                          else if (group === 'Bebidas') icon = "🥤";
                          else if (group === 'Snacks y Dulces') icon = "🍬";
                        }
                        // Asignar iconos para grupos de limpieza
                        else if (filterType === 'limpieza') {
                          if (group === 'Limpieza del Hogar') icon = "🧹";
                          else if (group === 'Cuidado Personal') icon = "🧴";
                          else if (group === 'Productos Especializados') icon = "✨";
                        }
                        
                        return (
                          <option 
                            key={group} 
                            value={group}
                            className={`categoria-${filterType}`}
                          >
                            {icon} {group}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                
                <div className="filter-group">
                  <label><i className="fas fa-layer-group"></i> Categoría:</label>
                  <select 
                    className="filter-input categoria-selector"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    <option value="Carnes" className="categoria-alimento">🥩 Carnes</option>
                    <option value="Lácteos" className="categoria-alimento">🧀 Lácteos</option>
                    <option value="Cereales" className="categoria-alimento">🌾 Cereales</option>
                    <option value="frutas" className="categoria-frutas">🍎 frutas</option>
                    {filterType ? (
                      // Filtrar categorías por tipo y grupo
                      categories
                        .filter(cat => 
                          cat.type === filterType && 
                          (!filterGroup || cat.group === filterGroup)
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(cat => (
                          <option 
                            key={cat.id} 
                            value={cat.name}
                            className={`categoria-${filterType}`}
                          >
                            {cat.name}
                          </option>
                        ))
                    ) : (
                      // Mostrar todas las categorías separadas por tipo
                      <>
                        {categoriesByType.alimento
                          .filter(cat => !['Carnes', 'Lácteos', 'Cereales'].includes(cat.name))
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(cat => (
                            <option key={cat.id} value={cat.name} className="categoria-alimento">
                              {cat.name}
                            </option>
                          ))
                        }
                        
                        {categoriesByType.limpieza
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(cat => (
                            <option key={cat.id} value={cat.name} className="categoria-limpieza">
                              {cat.name}
                            </option>
                          ))
                        }
                        
                        {categoriesByType.otros.length > 0 && (
                          <>
                            {categoriesByType.otros
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map(cat => (
                                <option key={cat.id} value={cat.name} className="categoria-otro">
                                  {cat.name}
                                </option>
                              ))
                            }
                          </>
                        )}
                      </>
                    )}
                  </select>
                </div>
              </div>
              
              <div className="filter-row">
                <div className="filter-group">
                  <label><i className="fas fa-dollar-sign"></i> Precio mínimo:</label>
                  <input 
                    type="number" 
                    placeholder="Mínimo" 
                    className="filter-input" 
                    value={filterPrice.min}
                    onChange={(e) => setFilterPrice({...filterPrice, min: e.target.value})} 
                  />
                </div>
                
                <div className="filter-group">
                  <label><i className="fas fa-dollar-sign"></i> Precio máximo:</label>
                  <input 
                    type="number" 
                    placeholder="Máximo" 
                    className="filter-input" 
                    value={filterPrice.max}
                    onChange={(e) => setFilterPrice({...filterPrice, max: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            
            <ul>
              {filteredProducts.map(p => (
                <li key={p.id} className={`product-item ${!p.active ? 'product-inactive' : ''}`}>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)} 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: '100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                    title="Eliminar producto"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <div className="product-info">
                    <div className="product-name">
                      <i className="fas fa-shopping-cart"></i> {p.name}
                      {!p.active && <span className="inactive-badge">Inactivo</span>}
                    </div>
                    <div className="product-details">
                      <span><i className="fas fa-tag"></i> {p.brand}</span> - 
                      <span><i className="fas fa-dollar-sign"></i> ${parseFloat(p.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> - 
                      <span><i className="fas fa-layer-group"></i> {p.category}</span> - 
                      <span><i className="fas fa-store"></i> {p.store}</span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        setShowEditModal(true);
                      }} 
                      className="btn-edit btn-icon"
                    >
                      <i className="fas fa-edit"></i>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleToggleProductStatus(p.id)} 
                      className={`btn-toggle ${p.active ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      <i className={`fas ${p.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      {p.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button 
                      onClick={() => showProductDetails(p)} 
                      className="btn-details"
                    >
                      <i className="fas fa-chart-line"></i>
                      Ver Histórico
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {view === "analysis" && (
        <div className="analysis-container">
          <GastosPorCategoria />
          
          {selectedProduct ? (
            <div className="chart-container">
              <h3 className="chart-title">
                Historial de Precio: {selectedProduct.name}
                <button className="btn-close" onClick={() => setSelectedProduct(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </h3>
              
              {/* Componente de precios mensuales en tiempo real */}
              <PreciosMensuales productId={selectedProduct.id} />
              
              <div className="chart-placeholder">
                <div className="chart-data line-chart">
                  {priceHistory[selectedProduct.id]?.map((item, index) => (
                    <div key={index} className="chart-point-container">
                      <div 
                        className="chart-point" 
                        style={{ 
                          bottom: `${(parseFloat(item.price) / Math.max(...priceHistory[selectedProduct.id].map(i => parseFloat(i.price)))) * 80}%`
                        }}
                      >
                        <div className="chart-value">${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      <div className="chart-label">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-title">Evolución de precios</div>
                <div className="legend-description">
                  Historial de precios de {selectedProduct.name}. Precio actual: ${parseFloat(selectedProduct.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
            </div>
          ) : (
            <div className="product-selection">
              <h3>Selecciona un producto para ver su historial de precios</h3>
              <div className="product-grid">
                {products.filter(p => p.active).map(p => (
                  <div key={p.id} className="product-card" onClick={() => showProductDetails(p)}>
                    <h4>{p.name}</h4>
                    <p><i className="fas fa-tag"></i> {p.brand}</p>
                    <p><i className="fas fa-dollar-sign"></i> ${parseFloat(p.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;