import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const tbody = document.getElementById("tablaCitas");
const btn_guardar = document.getElementById("btn_guardar");
const inputNombre = document.getElementById("nombre");
const inputApellidos = document.getElementById("apellidos");
const inputFechaNacimiento = document.getElementById("fechaNacimiento");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora")
const inputTelefono = document.getElementById("numero");
const inputEmail = document.getElementById("email");
const selectTratamiento = document.getElementById("tratamiento");
const form = document.getElementById("formulario");
const mostrarUser = document.getElementById("admin");
const buscar = document.getElementById("buscar");
const btnAbrirModal = document.getElementById("btn_abrir");
const btnCancelar = document.getElementById("btn_cancelar");
const selectEstado = document.getElementById("selectFiltroEstado");
const salir = document.getElementById("salir");
const token = localStorage.getItem("token");

let citaEditado = null;
const URL_TRATAMIENTOS = "/api/tratamientos";
const URL_USUARIOS = "/api/usuarios";
const URL_CITAS = "/api/citas";

const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    return /^\d{10}$/.test(telefonoLimpio);
};

const convertirHorasAMinutos = (hora) => {
    const [h, m] = hora.split(":");
    return Number(h) * 60 + Number(m);
}
const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    window.location.href = "../Templates/login.html";
}
function toggleDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

window.toggleDropdown = toggleDropdown;

const parseResponse = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return { mensaje: text };
    }
};

const validarEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const obtenerUsuarioConToken = (token) => {
    return JSON.parse(atob(token.split(".")[1]));
}
const mostrarUsuarioAdministrador = () => {
   const user = obtenerUsuarioConToken(token);
   mostrarUser.textContent = user.usuario;
}
const cargarTratamientosEnSelect = async () => {
    try {
        const response = await fetch(URL_TRATAMIENTOS, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const tratamientos = await response.json();

        if (!response.ok) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "No se Pudieron cargar los tratamientos"
            });
            return;
        }

        selectTratamiento.innerHTML = '<option value="" selected disabled>Selecciona un tratamiento</option>';

        tratamientos.forEach((tratamiento) => {
            const opcion = document.createElement("option");
            opcion.value = tratamiento.id;
            opcion.textContent = tratamiento.nombreTratamiento || tratamiento.nombre;
            selectTratamiento.appendChild(opcion);
        });

        selectTratamiento.disabled = false;
    } catch (error) {
        selectTratamiento.innerHTML = '<option value="">No se pudieron cargar los tratamientos</option>';
        console.error("Error al cargar tratamientos:", error);
    }
};

const obtenerCitas = async () => {
    const response = await fetch(URL_CITAS, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const data = await parseResponse(response);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data?.mensaje || "Error al obtener las citas"
        });
        return data;
    }

    const data = await parseResponse(response);
    return Array.isArray(data) ? data : [];
};

const obtenerCitasPorId = async (id) => {
    const response = await fetch(`${URL_CITAS}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const data = await parseResponse(response);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data?.mensaje || "Error al obtener la cita"
        });
        return data;
        
    }

    const data = await parseResponse(response);
    return data;
};
const actualizarTarjeta = async () => {
    try{
        const citas = await obtenerCitas();

        const totales = citas.length;

        const pendiente = citas.filter(cita => cita.estado === "Pendiente").length;

        const confirmadas = citas.filter(cita => cita.estado === "Confirmada").length;

        const canceladas = citas.filter(cita => cita.estado === "Cancelada").length;

        document.getElementById("totales").textContent = totales;
        document.getElementById("pendientes").textContent = pendiente;
        document.getElementById("confirmadas").textContent = confirmadas;
        document.getElementById("canceladas").textContent = canceladas;
    } catch (error) {
        alert(error.message);
    }
}
const buscarCita = async () => {
    try {
        let listaCitas = await obtenerCitas();

        if (buscar.value) {
            const buscarNombre = buscar.value.toLowerCase();
            listaCitas = listaCitas.filter((nombrePaciente) =>
                nombrePaciente.nombre.toLowerCase().includes(buscarNombre)
            );
        }

        if (selectEstado.value !== "Todas") {
            listaCitas = listaCitas.filter((cita) => cita.estado === selectEstado.value);
        }

        return listaCitas;
    } catch (error) {
        alert(error.message);
        return [];
    }
};

const eliminarCita = async (id) => {
    const response = await fetch(`${URL_CITAS}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await parseResponse(response);
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Cita eliminada correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }
    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo eliminar la cita"
        });
        return data;
    }

    return data;
};
const editarElemento = (cita) => {
    form.style.display = "flex";
}
const cambiarEdicionDatosPaciente = (deshabilitar) => {
    inputNombre.disabled = deshabilitar;
    inputApellidos.disabled = deshabilitar;
    inputFechaNacimiento.disabled = deshabilitar;
    inputTelefono.disabled = deshabilitar;
    inputEmail.disabled = deshabilitar;
};

const valorParaFecha = (valor) => valor ? valor.split("T")[0] : "";

const mostrarCitasEnFormulario = (cita) => {
    inputNombre.value = cita.nombre;
    inputApellidos.value = cita.apellidos;
    inputFechaNacimiento.value = valorParaFecha(cita.fechaNacimiento);
    inputFecha.value = valorParaFecha(cita.fecha);
    inputHora.value = cita.hora;
    selectTratamiento.value = cita.tratamientoId;
    inputTelefono.value = cita.telefono;
    inputEmail.value = cita.correo;
}

const limpiarFormulario = () => {
    inputNombre.value = "";
    inputApellidos.value = "";
    inputFechaNacimiento.value = "";
    inputFecha.value = "";
    inputHora.value = "";
    inputTelefono.value = "";
    inputEmail.value = "";
    selectTratamiento.value = "";
};

const abrirNuevaCita = () => {
    citaEditado = null;
    cambiarEdicionDatosPaciente(false);
    limpiarFormulario();
    form.style.display = "flex";
};

const cerrarModal = () => {
    citaEditado = null;
    cambiarEdicionDatosPaciente(false);
    limpiarFormulario();
    form.style.display = "none";
};

const guardarCita = async () => {
    const horaApertura = convertirHorasAMinutos("9:00");
    const horaCierre = convertirHorasAMinutos("18:00");

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const nuevaCita = {
        nombre: inputNombre.value.trim(),
        apellidos: inputApellidos.value.trim(),
        telefono: inputTelefono.value.trim(),
        correo: inputEmail.value.trim(),
        fechaNacimiento: inputFechaNacimiento.value,
        tratamientoId: selectTratamiento.value,
        fecha: inputFecha.value,
        hora: inputHora.value
    };
    const horaInicio = convertirHorasAMinutos(nuevaCita.hora);
    const fechaSeleccionada = new Date(nuevaCita.fecha);

    if (Object.entries(nuevaCita)
        .filter(([campo]) => campo !== "correo")
        .some(([, valor]) => !valor)) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Todos los campos son requeridos"
        });
        return;
    }

    if (!validarEmail(nuevaCita.correo)) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un correo electronico valido"
        });
        return;
    }

    if (!validarTelefono(nuevaCita.telefono)){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un numero telefonico valido"
        });
        return;
    }

    if(fechaSeleccionada < hoy){
        Swal.fire({
            icon: "warning",
            title: "Atencion",
            text: "No puedes registrar citas en fechas pasadas"
        });
        return;
    }

    if(
        horaInicio < horaApertura ||
        horaInicio >= horaCierre
    ){
        Swal.fire({
            icon: "warning",
            title: "Atencion",
            text: "El horario de citas es de 9 am a 6 pm"
        });
        return;
    }
    const response = await fetch(URL_CITAS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevaCita)
    });

    const data = await parseResponse(response);
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Cita creada correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo agentar la cita"
        });
        return data;
    }

    return data;
};

const actualizarCita = async (id) => {
    const cita = {
        fecha: inputFecha.value,
        hora: inputHora.value,
        tratamientoId: selectTratamiento.value
    };
    

    if(Object.entries(cita)
        .filter(([campo]) => campo !== "tratamientoId")
        .some(([, valor]) => !valor)
    ){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Completa todos los campos para editar la cita"
        });
        return;
    }
    const response = await fetch(`${URL_CITAS}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cita)
    });

    const data = await parseResponse(response);
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Cita modificada correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }
    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo actualizar la cita"
        });
        return data;
    }

    citaEditado = null;
};

const actualizarEstadoCita = async (id, estado) => {
    const response = await fetch(`${URL_CITAS}/${id}/estado`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            estado: estado
        })
    });

    const data = await parseResponse(response);
    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo actualizar el estado de la cita"
        });
        return data;
    }
};

const mostrarCitas = (citas) => {
    tbody.innerHTML = "";

    if (!Array.isArray(citas) || citas.length === 0) {
        const filaVacia = document.createElement("tr");
        const tdVacio = document.createElement("td");
        tdVacio.colSpan = 8;
        tdVacio.textContent = "No se encontraron citas.";
        filaVacia.appendChild(tdVacio);
        tbody.appendChild(filaVacia);
        return;
    }

    citas.forEach((cita) => {
            
            const fila = document.createElement("tr");

            const tdNombre = document.createElement("td");
            tdNombre.textContent = cita.nombre;

            const tdApellidos = document.createElement("td");
            tdApellidos.textContent = cita.apellidos;

            const tdFecha = document.createElement("td")
            tdFecha.textContent = cita.fecha.split("T")[0];
            
            const tdHora = document.createElement("td");
            tdHora.textContent = cita.hora;

            const tdTelefono = document.createElement("td");
            tdTelefono.textContent = cita.telefono;

            const tdTratamiento = document.createElement("td");
            tdTratamiento.textContent = cita.tratamiento;
            const selectEstado = document.createElement("select");
            const tdEstado = document.createElement("td");

            selectEstado.innerHTML = `
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Completada">Completada</option>
            `;
            selectEstado.value = cita.estado;
            tdEstado.appendChild(selectEstado);
            selectEstado.addEventListener('change', async () => {
                try {
                    await actualizarEstadoCita(cita.id, selectEstado.value);
                    await actualizarTarjeta();
                    await cargarCitas();
                } catch (error) {
                    selectEstado.value = cita.estado;
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo actualizar el estado de la cita"
                    });
                }
            });
            const btn_editar = document.createElement("button");
            const btn_eliminar = document.createElement("button");
            btn_eliminar.innerHTML = `<svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                `;
            btn_editar.innerHTML = `<svg class="icons" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                `;
            btn_eliminar.classList.add("btn_eliminar");
            btn_editar.classList.add("btn_editar");

            const tdAcciones = document.createElement("td");
            const id = cita.id;

            btn_eliminar.addEventListener("click", async () => {
                try {
                    const resultado = await Swal.fire({
                        title: "¿Eliminar cita?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    });

                    if (resultado.isConfirmed) {
                        await eliminarCita(id);
                        await cargarCitas();
                    }
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo eliminar la cita"
                    });
                }
            });
            btn_editar.addEventListener('click', async () => {
                try {
                    const resultado = await obtenerCitasPorId(id);
                    const citaCompleta = Array.isArray(resultado) ? resultado[0] : resultado;

                    if (!citaCompleta) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "No se encontro la cita seleccionada"
                        });
                    }

                    citaEditado = id;
                    mostrarCitasEnFormulario(citaCompleta);
                    cambiarEdicionDatosPaciente(true);
                    form.style.display = "flex";
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "No se pudo Editar la cita"
                    });
                }
            });


            tdAcciones.appendChild(btn_editar);
            tdAcciones.appendChild(btn_eliminar)
            fila.appendChild(tdNombre);
            fila.appendChild(tdApellidos);
            fila.appendChild(tdFecha);
            fila.appendChild(tdHora);
            fila.appendChild(tdTelefono);
            fila.appendChild(tdTratamiento);
            fila.appendChild(tdEstado)
            fila.appendChild(tdAcciones);
            tbody.appendChild(fila);
        })
    }


btnAbrirModal.addEventListener("click", abrirNuevaCita);
btnCancelar.addEventListener("click", cerrarModal);

const cargarCitas = async () => {
    try {
        const citas = await buscarCita();
        mostrarCitas(citas);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo cargar las citas"
        });
    }
};

buscar.addEventListener('input', async () => {
    cargarCitas();
});
selectEstado.addEventListener('change', async () => {
    cargarCitas();
});
actualizarTarjeta();
cargarCitas();
cargarTratamientosEnSelect();
mostrarUsuarioAdministrador();
btn_guardar.addEventListener('click', async () => {
    btn_guardar.disabled = true;
    try {
        if (citaEditado) {
            await actualizarCita(citaEditado);
        } else {
            await guardarCita();
        }
        await actualizarTarjeta();
        await cargarCitas();
        cerrarModal();
    } catch (error) {
        console.error("Error al guardar la cita:", error);
        alert(error.message);
    } finally {
        btn_guardar.disabled = false;
    }
});
window.onclick = function(event) {
  if (!event.target.closest('.drop-btn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

salir.addEventListener('click', cerrarSesion)

if (!token){
    window.location.href = "../Templates/login.html"
}