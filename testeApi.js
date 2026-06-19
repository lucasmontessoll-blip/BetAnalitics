import axios from "axios";

const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-apisports-key": "4fdbad40c44545a9ae3460ecb45b4c44"
  }
});

async function teste() {
  try {
    const { data } = await api.get("/status");
    console.log(data);
  } catch (e) {
    console.log(e.response?.data || e.message);
  }
}

teste();