import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const toggleFavorite = async (phoneId, token) =>
  API.post(
    `/favorites/${phoneId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const getFavorites = async (token) =>
  API.get("/favorites", { headers: { Authorization: `Bearer ${token}` } });