import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const btnGuardar = document.getElementById("btn_guardar");
const btnAbrirModal = document.getElementById("btn_abrir_modal");
const btnCerrarModal = document.getElementById("btn_cerrar_modal");
const modalOverlay = document.querySelector(".modal-overlay");
const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputPrecio = document.getElementById("precio");
const inputDuracion = document.getElementById("duracion");
const tabla = document.getElementById("tablaTratamientos");
const inputBusqueda = document.getElementById("buscadorTratamientos");
const token = localStorage.getItem("token");
let tratamientoEditando = null;
let tratamientosCargados = [];

const URL_API = "http://localhost:3000/api/tratamientos";

export const obtenerTratamientos = async () => {
    const response = await fetch(URL_API, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.mensaje || "No se pudo obtener los tratamientos"
        });
        return data;
    }
    return data;
};

export const crearTratamiento = async () => {

    const tratamiento = {
        nombre: inputNombre.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        precio: Number(inputPrecio.value),
        duracion: Number(inputDuracion.value)
    };
    if (Object.entries(tratamiento)
        .some(([, valor]) => !valor)) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Todos los campos son requeridos"
        });
        return;
    }

    if (tratamiento.precio < 0 || tratamiento.duracion < 0){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "No se pueden ingresar cantidades negativas"
        });
        return;
    }
    const response = await fetch(URL_API, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        Authorization: `Bearer ${token}`,
        body: JSON.stringify(tratamiento)
    });

    const data = await response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Tratamiento creado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo crear un nuevo tratamiento"
        });
        return data;
    }
    return data;
};



const mostrarTratamientoForm = (tratamiento) => {
    inputNombre.value = tratamiento.nombreTratamiento;
    inputDescripcion.value = tratamiento.descripcion;
    inputPrecio.value = tratamiento.precio;
    inputDuracion.value = tratamiento.duracion;
};

const limpiarFormulario = () => {
    inputNombre.value = "";
    inputDescripcion.value = "";
    inputPrecio.value = "";
    inputDuracion.value = "";
};

const actualizarTratamiento = async (id) => {
    const tratamiento = {
        nombre: inputNombre.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        precio: Number(inputPrecio.value),
        duracion: Number(inputDuracion.value)
    };

    if (tratamiento.precio < 0 || tratamiento.duracion < 0){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "No se pueden ingresar cantidades negativas"
        });
        return;
    }


    const response = await fetch(`${URL_API}/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
         },
        body: JSON.stringify(tratamiento)
    });
    const data = await response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Tratamiento editado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo editar un nuevo tratamiento"
        });
        return data;
    }
    return data;
};
const eliminarTratamiento = async (id) => {
    const response = await fetch(`${URL_API}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Tratamiento eliminado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo eliminar el tratamiento"
        });
        return data;
    }
    return data;
};

const cerrarModal = () => {
    if (modalOverlay) {
        modalOverlay.style.display = "none";
    }
};

const abrirModal = () => {
    if (modalOverlay) {
        modalOverlay.style.display = "flex";
    }
};

const mostrarTratamientos = (tratamientos) => {
    tabla.innerHTML = "";
    if (!Array.isArray(tratamientos)) return;

    if (tratamientos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#5c7d79;">No se encontraron tratamientos.</td></tr>`;
        return;
    }

    tratamientos.forEach((tratamiento) => {
        const fila = document.createElement("tr");
        const botones = document.createElement("td");
        const btnEliminar = document.createElement("button");
        const btnEditar = document.createElement("button");
        btnEliminar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icons">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 0c-.893 0-1.18-.91-2.164-2.09-2.164h-4.82c-1.18 0-2.09.984-2.09 2.164v.916M13.5 7.5h-3" />
            </svg>
        `;
        btnEditar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icons">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
        `;
        fila.innerHTML = `
            <td>${tratamiento.nombreTratamiento}</td>
            <td>${tratamiento.descripcion}</td>
            <td>$${Number(tratamiento.precio).toFixed(2)}</td>
            <td>${Number(tratamiento.duracion)} min</td>
        `;
        btnEliminar.addEventListener("click", async () => {
            try {
                const resultado = await Swal.fire({
                    title: "¿Eliminar paciente?",
                    text: "Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar"
                });

                if(resultado.isConfirmed){
                    await eliminarTratamiento(tratamiento.id);
                    await cargarTratamientos();
                }
            } catch (error) { 
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se pudo eliminar el tratamiento"
                });
             }
        });
        btnEditar.addEventListener("click", () => {
            tratamientoEditando = tratamiento.id;
            mostrarTratamientoForm(tratamiento);
            abrirModal();
        });
        botones.append(btnEliminar, btnEditar);
        fila.appendChild(botones);
        tabla.appendChild(fila);
    });
};

const filtrarTratamientos = () => {
    if (!inputBusqueda) return;

    const texto = inputBusqueda.value.trim().toLowerCase();

    if (!texto) {
        mostrarTratamientos(tratamientosCargados);
        return;
    }

    const filtrados = tratamientosCargados.filter((tratamiento) => {
        const nombre = String(tratamiento.nombreTratamiento || "").toLowerCase();
        const descripcion = String(tratamiento.descripcion || "").toLowerCase();
        return nombre.includes(texto) || descripcion.includes(texto);
    });

    mostrarTratamientos(filtrados);
};

const cargarTratamientos = async () => {
    try {
        const datos = await obtenerTratamientos();
        tratamientosCargados = Array.isArray(datos) ? datos : [];
        mostrarTratamientos(tratamientosCargados);
    } catch (error) {
        tabla.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    }
};

cargarTratamientos();

if (inputBusqueda) {
    inputBusqueda.addEventListener("input", filtrarTratamientos);
}

btnGuardar.addEventListener("click", async () => {
    try {
        if (tratamientoEditando) {
            await actualizarTratamiento(tratamientoEditando);
        } else {
            await crearTratamiento();
        }
        await cargarTratamientos();
        limpiarFormulario();
        cerrarModal();
    } catch (error) { 
         Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message || "No se pudo guardar el tratamiento"
        });
     }
});

if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", abrirModal);
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            cerrarModal();
        }
    });
}

if (!token){
    window.location.href = "../Templates/login.html"
}
