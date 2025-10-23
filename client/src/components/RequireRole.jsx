import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";

export default function RequireRole({ allow = ["admin","superadmin"], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) {
    return (
      <div className="card" style={{padding:16}}>
        <h3>Acceso restringido</h3>
        <p>Necesitas permisos de administrador.</p>
        <Link to="/">Volver</Link>
      </div>
    );
  }
  return children;
}
