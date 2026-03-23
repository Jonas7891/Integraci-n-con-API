document.addEventListener("DOMContentLoaded", () => {
    const navbar = `
    <nav class="navbar navbar-expand-lg bg-body-tertiary" style="font-size: 20px;">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <a class="nav-link active" aria-current="page" href="/web/view/index.html">Principal</a>
                    <a class="nav-link" href="/web/view/indexPosts.html">Publicaciones</a>
                    <a class="nav-link" href="/web/view/indexProduct.html">Productos</a>
                    <a class="nav-link" href="/web/view/indexUsers.html">Usuarios</a>
                    <a class="nav-link" href="/web/view/indexCarts.html">Carrito Compras</a>
                </div>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML("afterbegin", navbar);
});