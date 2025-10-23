import { createContext, useContext, useState } from "react";
export const AuthCtx = createContext(null);
export const useAuth = ()=> useContext(AuthCtx);

function safeParseUser() {
  const raw = localStorage.getItem("user");
  if (raw == null || raw === "" || raw === "undefined" || raw === "null") return null;
  try {
    return JSON.parse(raw);
  } catch {
    // si está corrupto, lo limpiamos
    localStorage.removeItem("user");
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => safeParseUser());

  const login = (data)=>{
    // asegurar que guardamos JSON válido
    localStorage.setItem("token", data?.token ?? "");
    localStorage.setItem("user", JSON.stringify(data?.user ?? null));
    setUser(data?.user ?? null);
  };

  const logout = ()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}
