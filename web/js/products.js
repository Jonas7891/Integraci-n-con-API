const API = "http://localhost:3000/products";
let deleteProductId = null;

const container = document.getElementById("containerProducts");

async function request(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

async function getAllProducts() {
  const products = await request(API);
  renderTable(products);
}

async function getFindByIdProduct() {
  const id = document.getElementById("idFilter").value.trim();
  if (!id) return getAllProducts();
  const product = await request(`${API}/${id}`);
  renderTable([product]);
}


async function getFindByTitleProduct() {
  const title = document.getElementById("titleFilter").value;
  const products = await request(`${API}?title=${title}`);
  renderTable(products);
}


async function getFindByPriceProduct() {
  const price = document.getElementById("priceFilter").value;
  const products = await request(`${API}?price=${price}`);
  renderTable(products);
}

function renderTable(products) {
  container.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.id}</td>
      <td>${product.title}</td>
      <td>${product.price}</td>
      <td>

        <button class="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modalActualizarProduct"
          onclick="loadProductById(${product.id})">
          Actualizar
        </button>

        <button class="btn btn-danger btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modalEliminarProduct"
          onclick="loadProductForDelete(${product.id}, '${product.title}')">
          Eliminar
        </button>

      </td>
    `;

    container.appendChild(row);

  });

}

async function loadProductById(id) {
  const product = await request(`${API}/${id}`);

  document.getElementById("updateId").value = product.id;
  document.getElementById("updateTitle").value = product.title;
  document.getElementById("updatePrice").value = product.price;
}


function loadProductForDelete(id, title) {

  deleteProductId = id;

  document.getElementById("deleteTitle").value = title;

}

async function deleteByTitleInput() {
  const title = document.getElementById("titleFilter").value.trim();
  if (!title) {
    alert("Ingresa un título en Buscar por Titulo para eliminar.");
    return;
  }

  const products = await request(`${API}?title=${encodeURIComponent(title)}`);
  if (!products || products.length === 0) {
    alert("No se encontró ningún producto con ese título.");
    return;
  }
  if (products.length > 1) {
    alert("Se encontraron varios productos con ese título. Usa el botón Eliminar en la tabla para borrar el correcto.");
    return;
  }

  await fetch(`${API}/${products[0].id}`, { method: "DELETE" });
  getAllProducts();
  alert("Producto eliminado por título.");
}

async function createProduct() {
  const titleCreate = document.getElementById("titleCreate");
  const priceCreate = document.getElementById("priceCreate");

  const product = {
    title: titleCreate.value,
    price: parseFloat(priceCreate.value) // Convertir a número
  };

  await request(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });

  titleCreate.value = "";
  priceCreate.value = "";

  getAllProducts();
}

async function updateProduct() {
  const id = document.getElementById("updateId").value;
  const title = document.getElementById("updateTitle").value;
  const price = document.getElementById("updatePrice").value;

  const product = {
    id: parseInt(id),
    title: title,
    price: parseFloat(price)
  };

  await request(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });
  getAllProducts();
}

async function deleteProduct() {
  let idToDelete = deleteProductId;
  const title = document.getElementById("deleteTitle").value.trim();

  if (!idToDelete && title) {
    const products = await request(`${API}?title=${encodeURIComponent(title)}`);
    if (!products || products.length === 0) {
      alert("No se encontró ningún producto con ese título.");
      return;
    }
    if (products.length > 1) {
      alert("Hay varios productos con ese título; selecciona uno por ID.");
      return;
    }
    idToDelete = products[0].id;
  }

  if (!idToDelete) {
    alert("No se seleccionó ningún producto para eliminar.");
    return;
  }

  await fetch(`${API}/${idToDelete}`, {
    method: "DELETE"
  });

  deleteProductId = null;
  getAllProducts();
}