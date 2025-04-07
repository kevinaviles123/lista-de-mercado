import { useState } from "react";
import { auth, googleProvider, githubProvider, facebookProvider } from "../firebaseConfig";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/home"); // Redirige al Home después de autenticarse
    } catch (error) {
      console.error("Error de autenticación:", error);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión o Registrarse</h2>
        
        <div className="input-group">
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="input-field" 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="input-group">
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="input-field" 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button onClick={handleEmailLogin} className="btn btn-primary btn-icon">
          <i className="fas fa-sign-in-alt"></i>
          Iniciar Sesión
        </button>
        
        <button onClick={handleEmailSignUp} className="btn btn-secondary btn-icon">
          <i className="fas fa-user-plus"></i>
          Registrarse
        </button>
        
        <div className="social-divider">
          <span className="social-divider-text">O continuar con</span>
        </div>
        
        <button onClick={() => handleAuth(googleProvider)} className="btn btn-google btn-icon">
          <i className="fab fa-google"></i>
          Google
        </button>
        
        <button onClick={() => handleAuth(githubProvider)} className="btn btn-github btn-icon">
          <i className="fab fa-github"></i>
          GitHub
        </button>
        
        <button onClick={() => handleAuth(facebookProvider)} className="btn btn-facebook btn-icon">
          <i className="fab fa-facebook-f"></i>
          Facebook
        </button>
      </div>
    </div>
  );
}

export default Login;