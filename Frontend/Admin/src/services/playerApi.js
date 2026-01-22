import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/players",
});

export const getPlayers = () =>
  API.get("/allplayers").then(res => res.data);

export const getPlayerRanking = () =>
  API.get("/allplayers/ranking").then(res => res.data);

export const createPlayer = (data) =>
  API.post("/player", data).then(res => res.data);

export const updatePlayer = (id, data) =>
  API.put(`/player/${id}`, data).then(res => res.data);

export const deletePlayer = (id) =>
  API.delete(`/player/${id}`).then(res => res.data);
