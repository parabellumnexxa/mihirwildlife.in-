import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Attach admin token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getPhotos = (category) =>
  api.get("/photos", { params: category ? { category } : {} }).then((r) => r.data);
export const getSite = () => api.get("/site").then((r) => r.data);
export const postContact = (data) => api.post("/contact", data).then((r) => r.data);
export const postPrintRequest = (data) => api.post("/print-requests", data).then((r) => r.data);
export const getShareCard = (id) => api.get(`/photos/${id}/share-card`).then((r) => r.data);

// admin
export const adminLogin = (password) =>
  api.post("/admin/login", { password }).then((r) => r.data);
export const getSignature = (folder) =>
  api.get("/cloudinary/signature", { params: { folder } }).then((r) => r.data);
export const createPhoto = (data) => api.post("/photos", data).then((r) => r.data);
export const updatePhoto = (id, data) => api.put(`/photos/${id}`, data).then((r) => r.data);
export const deletePhoto = (id) => api.delete(`/photos/${id}`).then((r) => r.data);
export const reorderPhotos = (ids) => api.put("/photos/reorder", { ids }).then((r) => r.data);
export const updateSite = (data) => api.put("/site", data).then((r) => r.data);
export const getMessages = () => api.get("/contact").then((r) => r.data);
export const getPrintRequests = () => api.get("/print-requests").then((r) => r.data);

// Cloudinary direct upload using signed params
export async function uploadToCloudinary(file, folder = "portfolio/photos") {
  const sig = await getSignature(folder);
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.api_key);
  form.append("timestamp", sig.timestamp);
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json();
}
