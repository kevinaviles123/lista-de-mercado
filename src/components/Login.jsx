import { useState } from "react";
import { auth, googleProvider, githubProvider, facebookProvider } from "../firebaseConfig";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GithubAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithCredential,
  OAuthCredential
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [alternativeProvider, setAlternativeProvider] = useState(null);
  const [pendingCred, setPendingCred] = useState(null);

  const getProviderInstance = (providerName) => {
    switch (providerName) {
      case 'google.com':
        return googleProvider;
      case 'github.com':
        return githubProvider;
      case 'facebook.com':
        return facebookProvider;
      default:
        return null;
    }
  };

  const getProviderName = (providerName) => {
    switch (providerName) {
      case 'google.com':
        return "Google";
      case 'github.com':
        return "GitHub";
      case 'facebook.com':
        return "Facebook";
      default:
        return "email/contraseña";
    }
  };

  const handleAuthError = async (error, provider) => {
    console.log("Error de autenticación:", error);
    setError(""); // Limpiar error anterior
    setAlternativeProvider(null);
    setPendingCred(null);
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      try {
        const email = error.customData.email;
        console.log("Email asociado:", email);
        
        // Guardar la credencial pendiente
        if (error.customData._credential) {
          console.log("Credencial pendiente encontrada");
          setPendingCred(error.customData._credential);
        }
        
        const methods = await fetchSignInMethodsForEmail(auth, email);
        console.log("Métodos disponibles:", methods);
        
        if (methods.length > 0) {
          const firstProvider = methods[0];
          console.log("Primer proveedor encontrado:", firstProvider);
          
          const alternativeProviderInstance = getProviderInstance(firstProvider);
          setAlternativeProvider(alternativeProviderInstance);
          
          setError(
            `Ya existe una cuenta con el email ${email}. ` +
            `Debes iniciar sesión primero con ${getProviderName(firstProvider)} ` +
            `para poder vincular tu cuenta de ${getProviderName(provider.providerId)}.`
          );
        }
      } catch (innerError) {
        console.error("Error al manejar vinculación:", innerError);
        setError("Error al verificar la cuenta. Por favor, intenta con otro método de inicio de sesión.");
      }
    } else if (error.code === 'auth/popup-closed-by-user') {
      setError("Se cerró la ventana de inicio de sesión. Por favor, intenta nuevamente.");
    } else if (error.code === 'auth/unauthorized-domain') {
      setError("Este dominio no está autorizado para iniciar sesión. Por favor, contacta al administrador.");
    } else {
      setError("Error al iniciar sesión. Por favor, intenta nuevamente.");
    }
  };

  const handleAuth = async (provider) => {
    try {
      setError(""); // Limpiar error anterior
      console.log("Intentando iniciar sesión con:", provider.providerId);
      
      const result = await signInWithPopup(auth, provider);
      console.log("Inicio de sesión exitoso:", result);
      
      // Si hay una credencial pendiente, intentar vincular
      if (pendingCred) {
        try {
          console.log("Intentando vincular credencial pendiente");
          await linkWithCredential(result.user, pendingCred);
          setPendingCred(null);
          setError("¡Cuentas vinculadas exitosamente!");
          setTimeout(() => setError(""), 3000);
        } catch (linkError) {
          console.error("Error al vincular cuentas:", linkError);
          setError("Error al vincular las cuentas. Por favor, intenta nuevamente.");
        }
      }
      
      navigate("/home");
    } catch (error) {
      console.error("Error de autenticación:", error);
      handleAuthError(error, provider);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setError(""); // Limpiar error anterior
      if (!email || !password) {
        setError("Por favor, completa todos los campos.");
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Error al registrar:", error);
      if (error.code === 'auth/email-already-in-use') {
        setError("Este email ya está registrado. Por favor, inicia sesión.");
      } else if (error.code === 'auth/weak-password') {
        setError("La contraseña es muy débil. Debe tener al menos 6 caracteres.");
      } else {
        setError("Error al registrar. Por favor, intenta nuevamente.");
      }
    }
  };

  const handleEmailLogin = async () => {
    try {
      setError(""); // Limpiar error anterior
      if (!email || !password) {
        setError("Por favor, completa todos los campos.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error.code === 'auth/wrong-password') {
        setError("Contraseña incorrecta.");
      } else if (error.code === 'auth/user-not-found') {
        setError("No existe una cuenta con este email.");
      } else {
        setError("Error al iniciar sesión. Por favor, intenta nuevamente.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión o Registrarse</h2>
        
        {error && (
          <div className="error-message" style={{
            color: '#dc2626',
            backgroundColor: '#fee2e2',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
            {alternativeProvider && (
              <button 
                onClick={() => handleAuth(alternativeProvider)}
                className="btn btn-primary btn-icon"
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  fontSize: '0.875rem'
                }}
              >
                <i className="fas fa-sign-in-alt"></i>
                Iniciar sesión con el método requerido
              </button>
            )}
          </div>
        )}
        
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