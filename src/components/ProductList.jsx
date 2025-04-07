import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function ProductList() {
  const [products, setProducts] = useState([]);
 
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  const handleUpdatePrice = async (id, newPrice) => {
    try {
      await updateDoc(doc(db, "products", id), { price: parseFloat(newPrice) });
      alert("Precio actualizado ✅");
    } catch (error) {
      console.error("Error al actualizar precio:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Lista de Productos</h2>
      {products.map(product => (
        <div key={product.id} className="mb-4">
          <p>{product.name} - {product.brand} - ${product.price}</p>
          <input
            type="number"
            placeholder="Nuevo precio"
            onBlur={(e) => handleUpdatePrice(product.id, e.target.value)}
            className="border p-2"
          />
        </div>
      ))}
    </div>
  );
}

export default ProductList;