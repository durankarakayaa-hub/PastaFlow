const API_URL = "https://pastaflow.onrender.com";

const logoImportService = {
  testConnection: async () => {
    const response = await fetch(`${API_URL}/logo-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    return response.json();
  },

  uploadExcel: async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(`${API_URL}/logo-import`, {
      method: "POST",
      body: formData,
    });

    return response.json();
  },
  confirmImport: async () => {
  const response = await fetch(`${API_URL}/logo-import-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
},
confirmSave: async () => {
  const response = await fetch(`${API_URL}/logo-import-save`, {
    method: "POST",
  });

  return response.json();
},
};

export default logoImportService;