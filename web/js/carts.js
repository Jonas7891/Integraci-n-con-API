const API = "http://localhost:3000/carts";
let deleteCartId = null;

const container = document.getElementById("container");

async function request(url, options = {}) {
    const response = await fetch(url, options);
    return response.json();
}

async function getAllCarts() {
    const carts = await request(API);
    renderTable(carts);
}

async function getFindByIdCarts() {
    const id = document.getElementById("idFilter").value.trim();
    if (!id) return getAllCarts();
    const cart = await request(`${API}/${id}`);
    renderTable([cart]);
}

async function getFindByTotalCarts() {
    const total = document.getElementById("totalFilter").value.trim();
    if (!total) return getAllCarts();
    const carts = await request(`${API}?total=${total}`);
    renderTable(carts);
}

async function getFindByDiscountCarts() {
    const discount = document.getElementById("discountFilter").value.trim();
    if (discount === "") return getAllCarts();
    const carts = await request(`${API}?discountedTotal=${discount}`);
    renderTable(carts);
}

function renderTable(carts) {
    container.innerHTML = "";

    carts.forEach(cart => {
        const row = document.createElement("tr");

        const productsList = cart.products.map(p => {
            return `${p.title} (x${p.quantity})`;
        }).join("<br>");

        row.innerHTML = `
            <td>${cart.id}</td>
            <td>${productsList}</td>
            <td>$${cart.total.toFixed(0)}</td>
            <td>${cart.totalQuantity}</td>
            <td>${cart.userId}</td>
            <td>
                <button class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#modalActualizarCarts"
                    onclick="loadCartById(${cart.id})">
                    Actualizar
                </button>
                <button class="btn btn-danger btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEliminarCarts"
                    onclick="loadCartForDelete(${cart.id}, ${cart.total})">
                    Eliminar
                </button>
            </td>
        `;

        container.appendChild(row);
    });
}

async function loadCartById(id) {
    const cart = await request(`${API}/${id}`);

    document.getElementById("updateId").value = cart.id;
    document.getElementById("updateTotal").value = cart.total;
    document.getElementById("updateDiscountedTotal").value = cart.discountedTotal;
    document.getElementById("updateUserId").value = cart.userId;
}

async function loadCartForDelete(id, total) {
    deleteCartId = id;
    document.getElementById("deleteId").value = id;
    document.getElementById("deleteTotal").value = total;
}

async function deleteByTotalInput() {
    const total = document.getElementById("totalFilter").value.trim();
    if (!total) {
        alert("Ingresa un Total en Buscar por Total para eliminar.");
        return;
    }

    const allCarts = await request(API);
    const filteredCarts = allCarts.filter(cart => cart.total.toString() === total);

    if (!filteredCarts || filteredCarts.length === 0) {
        alert("No se encontró ningún carrito con ese Total.");
        return;
    }
    if (filteredCarts.length > 1) {
        alert("Se encontraron varios carritos con ese Total. Usa el botón Eliminar en la tabla para borrar el correcto.");
        return;
    }

    try {
        const response = await fetch(`${API}/${filteredCarts[0].id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }

        getAllCarts();
        alert("Carrito eliminado por Total.");

    } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar el carrito");
    }
}

async function createCarts() {
    try {
        const rows = document.querySelectorAll("#productsContainer .row");

        if (rows.length === 0) {
            alert("Agrega al menos un producto");
            return;
        }

        let total = 0;
        let totalQuantity = 0;

        const products = [];

        rows.forEach((row, index) => {
            const title = row.querySelector(".title").value;
            const price = parseFloat(row.querySelector(".price").value);
            const quantity = parseInt(row.querySelector(".quantity").value);
            const discount = parseFloat(row.querySelector(".discount").value) || 0;

            if (!title || isNaN(price) || isNaN(quantity)) {
                throw new Error("Completa todos los campos correctamente");
            }

            const productTotal = price * quantity;
            const discountedTotal = productTotal * (1 - discount / 100);

            total += productTotal;
            totalQuantity += quantity;

            products.push({
                id: index + 1,
                title,
                price,
                quantity,
                discountPercentage: discount,
                total: productTotal,
                discountedTotal: discountedTotal
            });
        });

        const discountedTotal = products.reduce((sum, p) => sum + p.discountedTotal, 0);

        const userId = await getRandomUserId();

        const newCart = {
            products,
            total,
            discountedTotal,
            userId,
            totalProducts: products.length,
            totalQuantity
        };

        const response = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCart)
        });

        if (!response.ok) {
            throw new Error("Error al crear carrito");
        }

        document.getElementById("productsContainer").innerHTML = "";
        addProductRow();

        getAllCarts();
        alert("Carrito creado correctamente");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function removeRow(button) {
    button.parentElement.parentElement.remove();
    toggleCreateButton();
}

async function getRandomUserId() {
    const users = await request("http://localhost:3000/users");
    
    if (!users || users.length === 0) {
        throw new Error("No hay usuarios en la base de datos");
    }

    const randomUser = users[Math.floor(Math.random() * users.length)];
    return randomUser.id;
}

function addProductRow() {
    const container = document.getElementById("productsContainer");

    const div = document.createElement("div");
    div.classList.add("row", "mb-2");

    div.innerHTML = `
        <div class="col">
            <input type="text" class="form-control title" placeholder="Nombre producto">
        </div>
        <div class="col">
            <input type="number" class="form-control price" placeholder="Precio">
        </div>
        <div class="col">
            <input type="number" class="form-control quantity" placeholder="Cantidad">
        </div>
        <div class="col">
            <input type="number" class="form-control discount" placeholder="% Descuento">
        </div>
        <div class="col">
            <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">
                X
            </button>
        </div>
        <br><br>
    `;

    container.appendChild(div);
    toggleCreateButton();
}

function toggleCreateButton() {
    const rows = document.querySelectorAll("#productsContainer .row");
    const btn = document.getElementById("btnCreateCart");

    let hasValidProduct = false;

    rows.forEach(row => {
        const title = row.querySelector(".title").value.trim();
        const price = row.querySelector(".price").value.trim();
        const quantity = row.querySelector(".quantity").value.trim();

        if (title !== "" && price !== "" && quantity !== "") {
            hasValidProduct = true;
        }
    });

    btn.style.display = hasValidProduct ? "block" : "none";
}

function addProductRow() {
    const container = document.getElementById("productsContainer");

    const div = document.createElement("div");
    div.classList.add("row", "mb-2");

    div.innerHTML = `
        <div class="col">
            <input type="text" class="form-control title" placeholder="Nombre producto">
        </div>
        <div class="col">
            <input type="number" class="form-control price" placeholder="Precio">
        </div>
        <div class="col">
            <input type="number" class="form-control quantity" placeholder="Cantidad">
        </div>
        <div class="col">
            <input type="number" class="form-control discount" placeholder="% Descuento">
        </div>
        <div class="col">
            <button class="btn btn-danger" onclick="removeRow(this)">X</button>
        </div>
    `;

    container.appendChild(div);

    div.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", toggleCreateButton);
    });

    toggleCreateButton();
}

async function updateCart() {
    const id = document.getElementById("updateId").value;
    const total = parseFloat(document.getElementById("updateTotal").value);
    const discountedTotal = parseFloat(document.getElementById("updateDiscountedTotal").value);
    const userId = parseInt(document.getElementById("updateUserId").value);

    const updatedCart = {
        id: parseInt(id),
        total: total,
        discountedTotal: discountedTotal,
        userId: userId
    };

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCart)
        });

        if (!response.ok) {
            throw new Error(`Error al actualizar: ${response.status}`);
        }

        getAllCarts();
        alert("Carrito actualizado exitosamente");

    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el carrito");
    }
}

async function deleteCarts() {
    let idToDelete = deleteCartId;
    const totalInput = document.getElementById("deleteTotal").value.trim();

    if (!idToDelete && totalInput) {
        const carts = await request(`${API}?total=${encodeURIComponent(totalInput)}`);
        if (!carts || carts.length === 0) {
            alert("No se encontró ningún carrito con ese total.");
            return;
        }
        if (carts.length > 1) {
            alert("Hay varios carritos con ese total; selecciona uno por ID.");
            return;
        }
        idToDelete = carts[0].id;
    }

    if (!idToDelete) {
        alert("No se seleccionó ningún carrito para eliminar.");
        return;
    }

    try {
        const response = await fetch(`${API}/${idToDelete}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar: ${response.status}`);
        }

        deleteCartId = null;
        getAllCarts();
        alert("Carrito eliminado exitosamente");

    } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar el carrito");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getAllCarts();
    toggleCreateButton();
});