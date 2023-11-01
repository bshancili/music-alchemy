import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Set the base URL to your server's URL
  headers: {
    "Content-Type": "application/json", // Set the Content-Type header to JSON
  },
});

export default api;
