const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

async function fetchWithNetworkError(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(`Cannot reach backend at ${API_BASE_URL}. Start backend and retry.`);
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem("cxr_token");
  if (token) {
    options.headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };
  }
  const response = await fetchWithNetworkError(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  getTools: () => request("/tools"),
  getHealth: () => request("/health"),
  getHistory: () => request("/history"),
  getArtifacts: () => request("/artifacts"),
  getJob: (jobId) => request(`/jobs/${jobId}`),
  executeTool: async (toolId, values) => {
    const hasFile = Object.values(values).some((value) => value instanceof File);
    if (hasFile) {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      const response = await fetchWithNetworkError(`${API_BASE_URL}/execute/${toolId}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }
      return data;
    }
    return request(`/execute/${toolId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  },
  downloadUrl: (path) => `${API_BASE_URL}/download?path=${encodeURIComponent(path)}`,
  login: (credentials) => request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }),
  signup: (userData) => request("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  }),
  googleAuth: (data) => request("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }),
  updateProfile: (profileData) => request("/auth/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  }),
  addHistoryItem: (item) => request("/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  }),
};

