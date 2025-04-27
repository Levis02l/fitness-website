import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // 后端 API 地址
});

// 请求拦截器，在每个请求头中自动添加 token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
