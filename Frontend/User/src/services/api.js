import axios from "axios";
import { io } from "socket.io-client";

export const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const socket = io("http://localhost:5000");
