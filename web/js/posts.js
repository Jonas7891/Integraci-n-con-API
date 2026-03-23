const API = "http://localhost:3000/posts";
let deleteCartId = null;

const container = document.getElementById("container");

async function request(url, options = {}) {
    const response = await fetch(url, options);
    return response.json();
}

async function getAllPosts() {
    const posts = await request(API);
    renderTable(posts);
}

async function getFindByIdPosts() {
    const id = document.getElementById("idFilter").value.trim();
    if (!id) return getAllPosts();
    const post = await request(`${API}/${id}`);
    renderTable([post]);
}

async function getFindByTitlePosts() {
    const title = document.getElementById("titleFilter").value.trim();
    if (!title) return getAllPosts();
    const posts = await request(`${API}?title=${title}`);
    renderTable(posts);
}

async function getFindByViewPosts() {
    const view = document.getElementById("viewFilter").value.trim();
    if (view === "") return getAllPosts();
    const posts = await request(`${API}?views=${view}`);
    renderTable(posts);
}

function renderTable(posts) {

    container.innerHTML = "";

    posts.forEach(post => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.body}</td>
        <td>${post.views}</td>
        <td>

        <button class="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modalActualizarPosts"
          onclick="loadPostById(${post.id})">
          Actualizar
        </button>

        <button class="btn btn-danger btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modalEliminarPosts"
          onclick="loadPostForDelete(${post.id}, '${post.title}')">
          Eliminar
        </button>

      </td>
    `;

        container.appendChild(row);

    });

}

async function loadPostById(id) {

    const post = await request(`${API}/${id}`);

    document.getElementById("updateId").value = post.id;
    document.getElementById("updateTitle").value = post.title;
    document.getElementById("updateBody").value = post.body;
    document.getElementById("updateView").value = post.views;

}

function loadPostForDelete(id, title) {

    deletePostId = id;

    document.getElementById("deleteTitle").value = title;
    if (deleteByTitleInput) {
        deleteByTitleInput.value = title;
    }
}

async function deleteByTitleInput() {
  const title = document.getElementById("titleFilter").value.trim();
  if (!title) {
    alert("Ingresa un Teléfono en Buscar por Teléfono para eliminar.");
    return;
  }

  const allPosts = await request(API);
  const posts = allPosts.filter(Posts => post.title === title);

  if (!posts || posts.length === 0) {
    alert("No se encontró ningún usuario con ese Teléfono.");
    return;
  }
  if (posts.length > 1) {
    alert("Se encontraron varios usuarios con ese Teléfono. Usa el botón Eliminar en la tabla para borrar el correcto.");
    return;
  }

  try {
    const response = await fetch(`${API}/${posts[0].id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar: ${response.status}`);
    }

    getAllPosts();
    alert("Usuario eliminado por Teléfono.");

  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el usuario");
  }
}

async function createPost() {

    const post = {
        title: titleCreate.value,
        body: bodyCreate.value
    };

    await request(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
    });

    titleCreate.value = "";
    bodyCreate.value = "";

    getAllPosts();
}

async function updatePost() {

    const id = updateId.value;

    const post = {
        id: id,
        title: updateTitle.value,
        body: updateBody.value,
        views: updateView.value
    };

    await request(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
    });
    getAllPosts();
}

async function deletePosts() {
    let idToDelete = deletePostId;
    const title = document.getElementById("deleteTitle").value.trim();

    if (!idToDelete && title) {
        const posts = await request(`${API}?title=${encodeURIComponent(title)}`);
        if (!posts || posts.length === 0) {
            alert("No se encontró ningún producto con ese título.");
            return;
        }
        if (posts.length > 1) {
            alert("Hay varios productos con ese título; selecciona uno por ID.");
            return;
        }
        idToDelete = posts[0].id;
    }

    if (!idToDelete) {
        alert("No se seleccionó ningún producto para eliminar.");
        return;
    }

    await fetch(`${API}/${idToDelete}`, {
        method: "DELETE"
    });

    deletePostId = null;
    getAllPosts();
}