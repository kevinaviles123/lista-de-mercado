import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

function CategoryManager() {
  const [category, setCategory] = useState("");

  const handleAddCategory = async () => {
    if (!category) return alert("Escribe una categoría");

    try {
      await addDoc(collection(db, "categories"), { name: category });
      alert("Categoría guardada ✅");
      setCategory("");
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Crear Categoría</h2>
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Ej: Lácteos"
        className="border p-2 mb-2"
      />
      <button onClick={handleAddCategory} className="bg-green-500 text-white px-4 py-2">
        Agregar Categoría
      </button>
    </div>
  );
}

export default CategoryManager;