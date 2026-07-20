const API_URL = "http://localhost:3001/products";

export async function getProducts() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  return await response.json();
}

export async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  return await response.json();
}

export async function addProduct(product) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  return await response.json();
}