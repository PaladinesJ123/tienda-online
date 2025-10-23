import axios from "axios";
const http = axios.create({ baseURL: "http://localhost:4000/api" });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null" && token !== "") {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default http;
