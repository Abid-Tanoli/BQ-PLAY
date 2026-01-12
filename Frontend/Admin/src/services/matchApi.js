import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/matches",
});

export const getMatches = () => API.get("/").then(res => res.data);
export const createMatch = (data) => API.post("/", data).then(res => res.data);
export const updateMatch = (id, data) => API.put(`/${id}`, data).then(res => res.data);
export const deleteMatch = (id) => API.delete(`/${id}`).then(res => res.data);
export const setMOM = (id, playerId) => API.put(`/mom/${id}`, { playerId }).then(res => res.data);
