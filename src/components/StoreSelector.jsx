import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore"; // 🔹 Corregido `addDocs` a `addDoc`

function StoreSelector() {
  const [store, setStore] = useState("");

  const handleSelectStore = async () => {
    if (!store) return alert("Selecciona una tienda");

    try {
      await addDoc(collection(db, "stores"), { name: store }); // 🔹 Corregido `addDocs` a `addDoc`
      alert("Tienda guardada ✅");
      setStore("");
    } catch (error) {
      console.error("Error al guardar tienda:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Selecciona tu tienda</h2>
      <input
        type="text"
        value={store}
        onChange={(e) => setStore(e.target.value)}
        placeholder="Ej: Walmart"
        className="border p-2 mb-2"
      />
      <button onClick={handleSelectStore} className="bg-blue-500 text-white px-4 py-2">
        Guardar Tienda
      </button>
    </div>
  );
}

export default StoreSelector;