import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

/**
 * Sends chest X-ray image and optional demographic filters to backend for analysis.
 * @param {FormData} formData - Multipart form containing image, age_group, and gender.
 * @returns {Promise<object>} Analysis results from the 8-step pipeline.
 */
export const analyzeImage = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
