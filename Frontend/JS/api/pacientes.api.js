import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const btn_guardar = document.getElementById("btn_guardar");
const btnAbrirModal = document.getElementById("btn_abrir_modal");
const btnCerrarModal = document.getElementById("btn_cerrar_modal");
const modalOverlay = document.querySelector(".modal-overlay");
const inputNombre = document.getElementById("nombre");
const inputApellidos = document.getElementById("apellidos");
const inputFecha = document.getElementById("fecha");
const inputCorreo = document.getElementById("correo")
const inputTelefono = document.getElementById("numero");
const tabla = document.getElementById("tablaPacientes");
const token = localStorage.getItem("token");
let pacienteEditando = null;

const URL_API = "http://localhost:3000/api/pacientes";

const validarEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    return /^\d{10}$/.test(telefonoLimpio);
};

export const obtenerPacientes = async () => {
    const response = await fetch(URL_API, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json()
    if(!response.ok)
    {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data?.mensaje || "Error al obtener los pacientes"
        });
        return data;
    }
    return data;
}

export const crearPaciente = async () => {

    const paciente = {
        nombre: inputNombre.value,
        apellidos: inputApellidos.value,
        telefono: inputTelefono.value,
        correo: inputCorreo.value,
        fechaNacimiento: inputFecha.value
    }

    if(Object.entries(paciente)
        .filter(([campo]) => campo !== "correo")
        .some(([, valor]) => !valor) 
    ) {
         Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Todos los campos son requeridos"
        });
        return;
    }
    if(!validarEmail(paciente.correo)){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un correo electronico valido"
        });
        return;
    }

    if (!validarTelefono(paciente.telefono)){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un numero telefonico valido"
        });
        return;
    }

    const response = await fetch(URL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paciente)
    });

    const data = await parseResponse(response);
        if(response.ok){
            Swal.fire({
                icon: "success",
                title: "¡Correcto!",
                text: "Paciente creado correctamente",
                confirmButtonText: "Aceptar"
            });
            return data;
        }
    
        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No se pudo crear un nuevo paciente"
            });
            return data;
        }
    return data;
}

const eliminarPacientes = async (id) => {
    const respuesta = await fetch(`http://localhost:3000/api/pacientes/${id}`, {
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
            text: "Paciente eliminado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo eliminar al paciente"
        });
        return data;
    }
    return data;
}
const mostrarPacientesForm = (paciente) => {
        inputNombre.value = paciente.nombre;
        inputApellidos.value = paciente.apellidos;
        inputTelefono.value = paciente.telefono;
        inputCorreo.value = paciente.correo;
        inputFecha.value = paciente.fechaNacimiento.split("T")[0];
}
const limpiarFormulario = () => {
    inputNombre.value = "";
    inputApellidos.value = "";
    inputTelefono.value = "";
    inputCorreo.value = "";
    inputFecha.value = ""
}

const actualizarPaciente = async (id) => {
    const paciente = {
        nombre: inputNombre.value,
        apellidos: inputApellidos.value,
        telefono: inputTelefono.value,
        correo: inputCorreo.value,
        fechaNacimiento: inputFecha.value
    }


    if(!validarEmail(paciente.correo)){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un correo electronico valido"
        });
        return;
    }

    if (!validarTelefono(paciente.telefono)){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un numero telefonico valido"
        });
        return;
    }

    const response = await fetch(`http://localhost:3000/api/pacientes/${id}`, {
        method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paciente)
    });

    const data = response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Paciente editado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }
    if(!response.ok){
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.mensaje || "No se pudo editar al paciente"
        });
        return data;
    }
    pacienteEditando = null;
    return data;
}
const mostrarPacientes = (pacientes) => {
    tabla.innerHTML= "";

    if (!Array.isArray(pacientes)) {
        console.error("Se esperaba un arreglo:", pacientes);
        return;
    }

    pacientes.forEach((paciente) => {
        const id = paciente.id;
        const fila = document.createElement("tr");
        const btn_eliminar = document.createElement("button");
        const btn_editar = document.createElement("button");
        const botones = document.createElement("td");
        botones.className = "acciones";
        btn_eliminar.type = "button";
        btn_editar.type = "button";
        btn_eliminar.className = "btn_eliminar";
        btn_editar.className = "btn_editar";
        btn_eliminar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icons">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 0c-.893 0-1.777.12-2.618.357m0 0A47.53 47.53 0 0 1 6 5.315m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.164h-4.82c-1.18 0-2.09.984-2.09 2.164v.916M13.5 7.5h-3" />
            </svg>
        `;
        btn_editar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icons">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
        `;
        btn_eliminar.title = "Eliminar";
        btn_editar.title = "Editar";

        fila.innerHTML = `
            <td>${paciente.nombre}</td>
            <td>${paciente.apellidos}</td>
            <td>${paciente.telefono}</td>
            <td>${paciente.correo}</td>
            <td>${paciente.fechaNacimiento.split("T")[0]}</td>
        `;

        btn_eliminar.addEventListener('click', async () => {
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
                    await eliminarPacientes(id); 
                    await cargarPacientes() 
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se pudo eliminar al paciente"
                });
            }
        });

        btn_editar.addEventListener('click', async () => { 
            pacienteEditando = id; 
            abrirModal();
            mostrarPacientesForm(paciente); 
        });

        botones.appendChild(btn_eliminar);
        botones.appendChild(btn_editar);
        fila.appendChild(botones);
        tabla.appendChild(fila);
    });

}
const cargarPacientes = async () => {
    const pacientes = await obtenerPacientes();
    mostrarPacientes(pacientes);
}
cargarPacientes();

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

btn_guardar.addEventListener('click', async () => { 
    if(pacienteEditando){
        await actualizarPaciente(pacienteEditando);
        await cargarPacientes();
    } else {
        await crearPaciente();
        await cargarPacientes();
    }
    limpiarFormulario();
    cerrarModal();
});

if (btnAbrirModal) {
    btnAbrirModal.addEventListener('click', abrirModal);
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            cerrarModal();
        }
    });
}

if (!token){
    window.location.href = "../Templates/login.html"
}