import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/admin/matches",
});

export const getMatches = () =>
  API.get("/").then(res => res.data);

export const getMatch = () =>
  API.get("/").then(res => res.data);

export const createMatch = (data) =>
  API.post("/", data).then(res => res.data);

export const updateMatch = (id, data) =>
  API.put("/", data).then(res => res.data);

export const deleteMatch = (id) =>
  API.delete('/').then(res => res.data);

export const getMatchStats = (id) =>
  API.get(`/${id}/stats`).then(res => res.data);
