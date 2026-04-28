import fs from "fs";
import path from "path";
import axios from "axios";

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const fetchJson = async (url, options = {}) => {
  try {
    const res = await axios({
      method: "GET",
      url,
      ...options,
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching JSON:", err);
    return null;
  }
};

export const getBuffer = async (url) => {
  try {
    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
    });
    return res.data;
  } catch (err) {
    console.error("Error getting buffer:", err);
    return null;
  }
};

export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};