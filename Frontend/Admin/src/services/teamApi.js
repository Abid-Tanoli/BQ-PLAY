import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/teams",
});

export const getTeams = () =>
  API.get("/").then(r => r.data);
