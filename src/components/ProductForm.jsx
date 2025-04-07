import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

function ProductForm() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  const handleAddProduct = async () => {
    if (!name || !brand || !price || !unit) {
      return alert("Completa todos los campos");
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        brand,
        price: parseFloat(price),
        unit,
      });
      alert("Producto agregado ✅");
      setName("");
      setBrand("");
      setPrice("");
      setUnit("");
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Agregar Producto</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="border p-2 mb-2" />
      <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" className="border p-2 mb-2" />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" className="border p-2 mb-2" />
      <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unidad (kg, lt, unidad)" className="border p-2 mb-2" />
      <button onClick={handleAddProduct} className="bg-yellow-500 text-white px-4 py-2">
        Guardar Producto
      </button>
    </div>
  );
}

export default ProductForm;