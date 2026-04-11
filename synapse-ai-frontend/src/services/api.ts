import axios from "axios";

const USER_TOKEN_KEY = "synapse_user_token";
const SESSION_TOKEN_KEY = "synapse_session_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const token = sessionToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export { api, USER_TOKEN_KEY, SESSION_TOKEN_KEY };
