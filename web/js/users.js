const API = "http://localhost:3000/users";
let deleteUserId = null;

const container = document.getElementById("container");

async function request(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

async function getAllUsers() {
  const users = await request(API);
  renderTable(users);
}

async function getFindByIdUser() {
  const id = document.getElementById("idFilter").value.trim();
  if (!id) return getAllUsers();
  const user = await request(`${API}/${id}`);
  renderTable([user]);
}

async function getFindByPhoneUser() {
  const phone = document.getElementById("phoneFilter").value.trim();
  if (!phone) return getAllUsers();
  const users = await request(`${API}?phone=${encodeURIComponent(phone)}`);
  renderTable(users);
}

async function getFindByUsernameUser() {
  const username = document.getElementById("usernameFilter").value.trim();

  if (!username) return getAllUsers();

  const users = await request(`${API}?username=${encodeURIComponent(username)}`);
  renderTable(users);
}

function renderTable(users) {
  container.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.phone}</td>
      <td>${user.age}</td>
      <td>
        <button class="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modalActualizarUser"
          onclick="loadUserById('${user.id}')">
          Actualizar
        </button>

        <button class="btn btn-danger btn-sm" 
          data-bs-toggle="modal" 
          data-bs-target="#modalEliminarUser" 
          onclick="loadUserForDelete('${user.id}', '${user.phone}')">
          Eliminar
        </button>
      </td>
    `;

    container.appendChild(row);
  });
}

async function loadUserById(id) {
  const user = await request(`${API}/${id}`);

  document.getElementById("updateId").value = user.id;
  document.getElementById("updateUsername").value = user.username;
  document.getElementById("updatePhone").value = user.phone;
  document.getElementById("updateAge").value = user.age;
}

function loadUserForDelete(id, phone) {
  deleteUserId = id;

  const deletePhoneInput = document.getElementById("deletePhone");
  if (deletePhoneInput) {
    deletePhoneInput.value = phone;
  }
}

async function deleteByPhoneInput() {
  const phone = document.getElementById("phoneFilter").value.trim();
  if (!phone) {
    alert("Ingresa un Teléfono en Buscar por Teléfono para eliminar.");
    return;
  }

  const allUsers = await request(API);
  const users = allUsers.filter(user => user.phone === phone);

  if (!users || users.length === 0) {
    alert("No se encontró ningún usuario con ese Teléfono.");
    return;
  }
  if (users.length > 1) {
    alert("Se encontraron varios usuarios con ese Teléfono. Usa el botón Eliminar en la tabla para borrar el correcto.");
    return;
  }

  try {
    const response = await fetch(`${API}/${users[0].id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar: ${response.status}`);
    }

    getAllUsers();
    alert("Usuario eliminado por Teléfono.");

  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el usuario");
  }
}

async function createUser() {
  if (!usernameCreate.value || !phoneCreate.value || !ageCreate.value) {
    alert("Todos los campos son obligatorios");
    return;
  }

  const user = {
    username: usernameCreate.value,
    phone: phoneCreate.value,
    age: ageCreate.value
  };

  try {
    const newUser = await request(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    console.log("Usuario creado:", newUser);

    usernameCreate.value = "";
    phoneCreate.value = "";
    ageCreate.value = "";

    getAllUsers();

  } catch (error) {
    console.error("Error al crear usuario:", error);
    alert("Error al crear usuario");
  }
}

async function updateUser() {
  const id = document.getElementById("updateId").value;

  if (!id || !updateUsername.value || !updatePhone.value || !updateAge.value) {
    alert("Todos los campos son obligatorios");
    return;
  }

  const user = {
    id: id,
    username: updateUsername.value,
    phone: updatePhone.value,
    age: updateAge.value
  };

  try {
    await request(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalActualizar'));
    if (modal) modal.hide();

    getAllUsers();
    alert("Usuario actualizado correctamente");

  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Error al actualizar el usuario");
  }
}

async function deleteUser() {
  let idToDelete = deleteUserId;
  const phone = document.getElementById("deletePhone").value.trim();

  if (!idToDelete && phone) {
    const allUsers = await request(API);
    const usersWithPhone = allUsers.filter(user => user.phone === phone);

    if (!usersWithPhone || usersWithPhone.length === 0) {
      alert("No se encontró ningún usuario con ese Teléfono.");
      return;
    }
    if (usersWithPhone.length > 1) {
      alert("Hay varios usuarios con ese Teléfono; selecciona uno por ID.");
      return;
    }
    idToDelete = usersWithPhone[0].id;
  }

  if (!idToDelete) {
    alert("No se seleccionó ningún usuario para eliminar.");
    return;
  }

  try {
    const response = await fetch(`${API}/${idToDelete}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar: ${response.status}`);
    }

    deleteUserId = null;

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
    if (modal) modal.hide();

    getAllUsers();
    alert("Usuario eliminado correctamente");

  } catch (error) {
    console.error("Error en deleteUser:", error);
    alert("Error al eliminar el usuario");
  }
}

document.addEventListener('DOMContentLoaded', function () {
  getAllUsers();
});
