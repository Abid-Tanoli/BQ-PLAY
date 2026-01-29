import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/players",
});

export const getPlayers = () =>
  API.get("/").then(res => res.data);

export const getPlayerRanking = () =>
  API.get("/").then(res => res.data);

export const createPlayer = (data) =>
  API.post("/", data).then(res => res.data);

export const updatePlayer = (id, data) =>
  API.put(`//${id}`, data).then(res => res.data);

export const deletePlayer = (id) =>
  API.delete(`//${id}`).then(res => res.data);
