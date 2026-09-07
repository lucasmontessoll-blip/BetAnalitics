import 'dotenv/config';
import axios from "axios";

const api = axios.create({
  baseURL: "https://v3.football.api-sports.io",
  headers: {
    "x-apisports-key": process.env.API_FOOTBALL_KEY || ""
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