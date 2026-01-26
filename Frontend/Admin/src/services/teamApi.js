import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/teams",
});

export const getTeams = () => API.get("/").then(res => res.data);
export const createTeam = (data) => API.post("/", data).then(res => res.data);
export const updateTeam = (id, data) => API.put(`/${id}`, data).then(res => res.data);
export const deleteTeam = (id) => API.delete(`/${id}`).then(res => res.data);