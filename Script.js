// ===============================
// ESTADO GLOBAL
// ===============================
let productos = [];
let carrito = [];

document.addEventListener("DOMContentLoaded", async () => {
  // REFERENCIAS DOM
  const contenedorProductos = document.querySelector(".contenedor-productos");
  const mostrarCarritoBtn = document.getElementById("mostrar-carrito-btn");
  const panelCarritoOculto = document.getElementById("panel-carrito-oculto");
  const cerrarCarritoBtn = document.getElementById("cerrar-carrito-btn");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalCarrito = document.getElementById("total-carrito");
  const vaciarCarritoBtn = document.getElementById("vaciar-carrito-btn");
  const contadorCarrito = document.getElementById("contador-carrito");

  // MODAL INFO (inyectado)
  crearModalInfo();

  // STORAGE
  cargarCarritoStorage();

  // CARGA DE PRODUCTOS DESDE JSON
  await obtenerProductos();
  cargarProductosHTML(contenedorProductos);
  actualizarCarritoHTML(listaCarrito, totalCarrito, contadorCarrito);

  // EVENTOS PRODUCTOS (delegación)
  contenedorProductos.addEventListener("click", (e) => {
    // INFO
    const btnInfo = e.target.closest("button.info-btn");
    if (btnInfo) {
      const id = btnInfo.dataset.id || btnInfo.dataset.sku;
      mostrarInfoSKU(id);
      return;
    }

    // COMPRAR
    const btnComprar = e.target.closest("button.comprar-btn, button.btn-comprar");
    if (btnComprar) {
      const id = btnComprar.dataset.id || btnComprar.dataset.sku;
      agregarCurso(id, listaCarrito, totalCarrito, contadorCarrito);
      return;
    }
  });

  // EVENTOS CARRITO
  mostrarCarritoBtn.addEventListener("click", () => togglePanelCarrito(panelCarritoOculto));
  cerrarCarritoBtn.addEventListener("click", () => togglePanelCarrito(panelCarritoOculto));
  vaciarCarritoBtn.addEventListener("click", () => vaciarCarrito(listaCarrito, totalCarrito, contadorCarrito));
  document.addEventListener("click", (e) => cerrarPanelFuera(e, panelCarritoOculto));

  // DROPDOWN MOBILE + SUBDROPDOWN
  initDropdownMobile();
});


// OBTENER PRODUCTOS DESDE productos.json
async function obtenerProductos() {
  try {
    const res = await fetch("productos.json");
    productos = await res.json();
  } catch (err) {
    console.error("Error cargando productos.json", err);
    productos = [];
    alert("No pude cargar productos.json. Abrí la web con Live Server.");
  }
}


// RENDER HTML DE PRODUCTOS
function cargarProductosHTML(contenedorProductos) {
  contenedorProductos.innerHTML = "";

  productos.forEach((producto) => {
    const divProducto = document.createElement("div");
    divProducto.classList.add("producto");

    const precioFinal = Math.round(producto.precio * (1 - producto.descuento / 100));

    divProducto.innerHTML = `
      <div class="descuento">${producto.descuento}% OFF</div>
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p>SKU: ${producto.id}</p>
      <p class="precio">$${precioFinal.toLocaleString("es-AR")}</p>

      <div style="display:flex; gap:8px; justify-content:center;">
        <button type="button" class="info-btn"
          data-id="${producto.id}" data-sku="${producto.id}">
          Info
        </button>

        <button type="button" class="comprar-btn"
          data-id="${producto.id}" data-sku="${producto.id}">
          Comprar
        </button>
      </div>
    `;

    contenedorProductos.appendChild(divProducto);
  });
}


// AGREGAR CURSO AL CARRITO
function agregarCurso(idCurso, listaCarrito, totalCarrito, contadorCarrito) {
  const cursoSeleccionado = productos.find((p) => p.id === idCurso);
  if (!cursoSeleccionado) {
    console.error("No encontré producto para comprar:", idCurso);
    return;
  }

  const precioFinal = Math.round(cursoSeleccionado.precio * (1 - cursoSeleccionado.descuento / 100));
  const existe = carrito.some((c) => c.id === idCurso);

  if (existe) {
    carrito = carrito.map((c) =>
      c.id === idCurso ? { ...c, cantidad: c.cantidad + 1 } : c
    );
  } else {
    carrito.push({
      id: cursoSeleccionado.id,
      nombre: cursoSeleccionado.nombre,
      precio: precioFinal,
      cantidad: 1,
    });
  }

  actualizarCarritoHTML(listaCarrito, totalCarrito, contadorCarrito);
  guardarCarritoStorage();
}


// ACTUALIZAR CARRITO EN HTML
function actualizarCarritoHTML(listaCarrito, totalCarrito, contadorCarrito) {
  limpiarHTML(listaCarrito);

  let total = 0;
  let cantidadTotalCursos = 0;

  if (carrito.length === 0) {
    listaCarrito.innerHTML = "<p>El carrito está vacío.</p>";
  } else {
    carrito.forEach((curso) => {
      const subtotal = curso.precio * curso.cantidad;
      total += subtotal;
      cantidadTotalCursos += curso.cantidad;

      const div = document.createElement("div");
      div.classList.add("item-carrito");
      div.innerHTML = `
        <p>
          ${curso.cantidad} x ${curso.nombre}
          <span style="font-weight:bold;">($${subtotal.toLocaleString("es-AR")})</span>
        </p>
      `;
      listaCarrito.appendChild(div);
    });
  }

  totalCarrito.textContent = `$${total.toLocaleString("es-AR")}`;
  contadorCarrito.textContent = cantidadTotalCursos;
}


// VISIBILIDAD CARRITO
function togglePanelCarrito(panelCarritoOculto) {
  const isVisible = panelCarritoOculto.style.display === "block";
  panelCarritoOculto.style.display = isVisible ? "none" : "block";
}

function cerrarPanelFuera(e, panelCarritoOculto) {
  const carritoFlotante = document.getElementById("carrito-flotante");
  if (carritoFlotante && !carritoFlotante.contains(e.target)) {
    panelCarritoOculto.style.display = "none";
  }
}

function vaciarCarrito(listaCarrito, totalCarrito, contadorCarrito) {
  if (confirm("¿Vaciar carrito?")) {
    carrito = [];
    actualizarCarritoHTML(listaCarrito, totalCarrito, contadorCarrito);
    guardarCarritoStorage();
  }
}

function limpiarHTML(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}


// LOCALSTORAGE
function guardarCarritoStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarritoStorage() {
  const data = localStorage.getItem("carrito");
  carrito = data ? JSON.parse(data) : [];
}


// MODAL INFO SKU
function crearModalInfo() {
  const modal = document.createElement("div");
  modal.id = "modal-info";
  modal.className = "modal-info";
  modal.innerHTML = `
    <div class="modal-info-content">
      <button id="cerrar-modal-info" class="cerrar-modal">✕</button>
      <h3 id="modal-info-titulo"></h3>
      <p id="modal-info-desc"></p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target.id === "modal-info" || e.target.id === "cerrar-modal-info") {
      modal.classList.remove("activo");
      modal.style.display = "none";
    }
  });
}

function mostrarInfoSKU(id) {
  const prod = productos.find((p) => p.id === id);

  if (!prod) {
    console.error("No encontré el producto con id/sku:", id, productos);
    alert("No se encontró información para este SKU.");
    return;
  }

  const descripcion =
    prod.descripcion || prod.description || prod.detalle || "Sin descripción disponible.";

  document.getElementById("modal-info-titulo").textContent = prod.nombre;
  document.getElementById("modal-info-desc").textContent = descripcion;

  const modal = document.getElementById("modal-info");
  modal.classList.add("activo");
  modal.style.display = "flex"; // fallback visual por si el CSS no cargó
}


// DROPDOWN MOBILE + SUBDROPDOWN
function initDropdownMobile() {
  document.querySelectorAll(".dropdown > a, .dropdown-sub > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const menu = link.nextElementSibling;
      if (!menu) return;

      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
  });
}
