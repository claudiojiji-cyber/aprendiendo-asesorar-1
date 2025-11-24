// ===============================================
// 1. BASE DE DATOS DE PRODUCTOS (SIMULACIÓN JSON)
// ===============================================

let productos = []; 

// Función que simula la carga de datos (como si fuera un archivo JSON o una API)
async function obtenerProductos() {
    // Usamos los datos internos para simular la respuesta del servidor:
    productos = [
        { id: "PC001", nombre: "Curso: Procesadores", precio: 12000, descuento: 10, imagen: "imagenes/Procesadores.jpg", descripcion: "Descubre la arquitectura interna, núcleos, hilos y el impacto de la velocidad de reloj en el rendimiento de un CPU moderno." },
        { id: "PC002", nombre: "Curso: Memoria RAM", precio: 9800, descuento: 15, imagen: "imagenes/memoria-ram.jpg", descripcion: "Claves sobre latencia, velocidad y tipos (DDR4, DDR5) para optimizar cualquier sistema operativo y su desempeño en tareas simultáneas." },
        { id: "PC003", nombre: "Curso: Placa Madre", precio: 14500, descuento: 20, imagen: "imagenes/motherboard.jpg", descripcion: "Conoce los sockets, chipsets y cómo elegir la placa base ideal para tu procesador, garantizando compatibilidad y futuro crecimiento." },
        { id: "PC004", nombre: "Curso: Discos SSD", precio: 11000, descuento: 5, imagen: "imagenes/SSD.jpg", descripcion: "De SATA a NVMe: aprende sobre la tecnología de almacenamiento más rápida y confiable del mercado, fundamental para la velocidad del sistema." },
        { id: "PC005", nombre: "Curso: Fuentes", precio: 10500, descuento: 10, imagen: "imagenes/Fuente.jpg", descripcion: "Conceptos de potencia (Watts), eficiencia y certificaciones (80 PLUS) para armados seguros y estables. ¡La base de cualquier PC!" },
        { id: "PC006", nombre: "Curso: Placa de Video", precio: 18000, descuento: 12, imagen: "imagenes/Placa-de-video.jpg", descripcion: "Domina las especificaciones clave (VRAM, bus) y las diferencias entre NVIDIA y AMD para gaming o trabajo profesional en 3D." }
    ];
}


// ===============================================
// 2. REFERENCIAS Y VARIABLES DE ESTADO
// ===============================================

let carrito = [];

const contenedorProductos = document.querySelector('.contenedor-productos');
const mostrarCarritoBtn = document.getElementById('mostrar-carrito-btn');
const panelCarritoOculto = document.getElementById('panel-carrito-oculto');
const cerrarCarritoBtn = document.getElementById('cerrar-carrito-btn');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito-btn');
const contadorCarrito = document.getElementById('contador-carrito');


// ===============================================
// 3. GESTIÓN DE EVENTOS INICIALES
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos los datos (simulando API) y luego generamos el HTML
    obtenerProductos().then(() => {
        cargarProductosHTML(); 
        actualizarCarritoHTML();
    });
});

// Event listeners
contenedorProductos.addEventListener('click', agregarCurso);
mostrarCarritoBtn.addEventListener('click', togglePanelCarrito);
cerrarCarritoBtn.addEventListener('click', togglePanelCarrito);
vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
document.addEventListener('click', cerrarPanelFuera);


// ===============================================
// 4. FUNCIONES DE PRODUCTOS Y VISTA
// ===============================================

/**
 * Genera el HTML de las tarjetas de producto usando el array `productos`.
 */
function cargarProductosHTML() {
    contenedorProductos.innerHTML = ''; 
    productos.forEach(producto => {
        const divProducto = document.createElement('div');
        divProducto.classList.add('producto');
        
        // Calcular el precio final con descuento
        const precioFinal = producto.precio * (1 - producto.descuento / 100);

        divProducto.innerHTML = `
            <div class="descuento">${producto.descuento}% OFF</div>
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>SKU: ${producto.id}</p>
            <p class="precio">$${precioFinal.toLocaleString('es-AR')}</p>
            
            <button data-id="${producto.id}">Comprar</button>
        `;

        contenedorProductos.appendChild(divProducto);
    });
}

/**
 * Se ejecuta al hacer clic en un botón "Comprar".
 */
function agregarCurso(e) {
    if (e.target.tagName === 'BUTTON' && e.target.textContent === 'Comprar') {
        const idCurso = e.target.getAttribute('data-id');
        
        // Buscar el producto completo en nuestra base de datos
        const cursoSeleccionado = productos.find(p => p.id === idCurso);

        if (cursoSeleccionado) {
            const precioFinal = cursoSeleccionado.precio * (1 - cursoSeleccionado.descuento / 100);

            const infoCurso = {
                id: cursoSeleccionado.id,
                nombre: cursoSeleccionado.nombre,
                precio: precioFinal, 
                cantidad: 1, 
            };
            
            const existe = carrito.some(curso => curso.id === infoCurso.id);
            
            if (existe) {
                carrito = carrito.map(curso => {
                    if (curso.id === infoCurso.id) {
                        curso.cantidad++;
                        return curso; 
                    } else {
                        return curso; 
                    }
                });
            } else {
                carrito.push(infoCurso);
            }
            
            actualizarCarritoHTML();
        }
    }
}

/**
 * Pinta el contenido del array 'carrito' en el HTML y calcula el total.
 */
function actualizarCarritoHTML() {
    limpiarHTML(listaCarrito); 

    let total = 0;
    let cantidadTotalCursos = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        carrito.forEach(curso => {
            const { nombre, precio, cantidad } = curso;

            const subtotal = precio * cantidad;
            total += subtotal;
            cantidadTotalCursos += cantidad;

            const div = document.createElement('div');
            div.classList.add('item-carrito');
            div.innerHTML = `
                <p>
                    ${cantidad} x ${nombre} 
                    <span style="font-weight: bold;">($${subtotal.toLocaleString('es-AR')})</span>
                </p>
            `;

            listaCarrito.appendChild(div);
        });
    }

    totalCarrito.textContent = `$${total.toLocaleString('es-AR')}`; 
    contadorCarrito.textContent = cantidadTotalCursos; 
}


// ===============================================
// 5. FUNCIONES DE VISIBILIDAD Y AUXILIARES
// ===============================================

/**
 * Muestra u oculta el panel del carrito flotante.
 */
function togglePanelCarrito() {
    const isVisible = panelCarritoOculto.style.display === 'block';
    panelCarritoOculto.style.display = isVisible ? 'none' : 'block';
}

/**
 * Cierra el panel del carrito si se hace clic fuera de él.
 */
function cerrarPanelFuera(e) {
    if (!document.getElementById('carrito-flotante').contains(e.target)) {
        panelCarritoOculto.style.display = 'none';
    }
}

/**
 * Vacía el array del carrito y actualiza el HTML.
 */
function vaciarCarrito() {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        carrito = []; 
        actualizarCarritoHTML(); 
    }
}

/**
 * Función auxiliar para limpiar el contenido de un elemento HTML.
 */
function limpiarHTML(elemento) {
    while (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
    }
}