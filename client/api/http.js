import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const http = axios.create({ baseURL });
// ... (interceptor de token como ya lo tienes)
export default http;
