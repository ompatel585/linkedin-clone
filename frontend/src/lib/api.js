import axios from "axios";

// Requests go to /api/v1 on the same origin; Vite proxies it to the backend in development.
export const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

export const getErrorMessage = (error, fallback = "Something went wrong") =>
    error?.response?.data?.message || error?.message || fallback;

// Small helper so query functions read as `() => get("/posts")`
export const get = (url, params) => api.get(url, { params }).then((res) => res.data);
export const post = (url, body) => api.post(url, body).then((res) => res.data);
export const put = (url, body) => api.put(url, body).then((res) => res.data);
export const patch = (url, body) => api.patch(url, body).then((res) => res.data);
export const del = (url) => api.delete(url).then((res) => res.data);
