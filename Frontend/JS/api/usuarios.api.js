import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const btn_guardar = document.getElementById("btn_guardar");
const btnAbrirModal = document.getElementById("btn_abrir_modal");
const btnCerrarModal = document.getElementById("btn_cerrar_modal");
const modalOverlay = document.querySelector(".modal-overlay");
const inputNombreUsuario = document.getElementById("nombreUsuario");
const inputPassword = document.getElementById("password");
const inputRol = document.getElementById("rol");
const tabla = document.getElementById("tablaUsuarios");
const modalTitulo = document.getElementById("modalTitulo");
const inputBuscar = document.getElementById("buscarUsuario");
const token = localStorage.getItem("token");
let usuarioEditando = null;

const URL_API = "http://localhost:3000/api/usuarios";

const obtenerUsuarios = async () => {
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
            text: data.mensaje || "No se pudo obtener los usuarios"
        });
        return data;
    }

    return data;
};

const crearUsuario = async () => {
    const usuario = {
        nombreUsuario: inputNombreUsuario.value.trim(),
        password: inputPassword.value,
        rol: inputRol.value
    };
    if (Object.entries(usuario)
        .some(([, valor]) => !valor)) {
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Completa todos los campos obligatorios para crear un nuevo usuario"
            });
            return;
    }

    if(usuario.nombreUsuario.length < 3){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El usuario debe tener al menos 3 caracteres"
        });
        return;
    }

    if(usuario.password.length < 8){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "La contraseña debe tener al menos 8 caracteres"
        });
        return;
    }
    const response = await fetch(URL_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
    });



    const data = await response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Usuario creado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.mensaje || "No se pudo crear el usuario"
        });
        return data;
    }
    return data;
};

const eliminarUsuario = async (id) => {

    if (!id || isNaN(id)) {
        throw new Error("ID de usuario inválido.");
    }
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
            text: "Usuario eliminado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.mensaje || "No se pudo eliminar el usuario"
        });
        return data;
    }
    return data;
};

const mostrarUsuarioForm = (usuario) => {
    inputNombreUsuario.value = usuario.nombreUsuario;
    inputPassword.value = "";
    inputRol.value = usuario.rol;
};

const limpiarFormulario = () => {
    inputNombreUsuario.value = "";
    inputPassword.value = "";
    inputRol.value = "";
};

const actualizarTextoModal = () => {
    if (usuarioEditando) {
        modalTitulo.textContent = "Editar usuario";
        btn_guardar.textContent = "Actualizar usuario";
        return;
    }

    modalTitulo.textContent = "Registrar usuario";
    btn_guardar.textContent = "+ Agregar usuario";
};

const actualizarUsuario = async (id) => {

    if (!id || isNaN(id)) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "ID de usuario invalido"
        });
        return;
        
    }


    const usuario = {
        nombreUsuario: inputNombreUsuario.value.trim(),
        password: inputPassword.value,
        rol: inputRol.value
    };
    
    if(usuario.nombreUsuario.length < 3){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "El usuario debe tener al menos 3 caracteres"
        });
        return;
    }

    if(usuario.password.length < 8){
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "La contraseña debe tener al menos 8 caracteres"
        });
        return;
    }

    const response = await fetch(`${URL_API}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        
        body: JSON.stringify(usuario)
    });

    const data = await response.json();
    if(response.ok){
        Swal.fire({
            icon: "success",
            title: "¡Correcto!",
            text: "Usuario actualizado correctamente",
            confirmButtonText: "Aceptar"
        });
        return data;
    }

    if (!response.ok) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.mensaje || "No se pudo actualizado el usuario"
        });
        return data;
    }

    usuarioEditando = null;
    return data;
};

const mostrarUsuarios = (usuarios) => {
    tabla.innerHTML = "";

    if (!Array.isArray(usuarios)) {
        console.error("Se esperaba un arreglo:", usuarios);
        return;
    }

    const termino = inputBuscar.value.toLowerCase();
    const usuariosFiltrados = usuarios.filter((usuario) => {
        return usuario.nombreUsuario.toLowerCase().includes(termino) || usuario.rol.toLowerCase().includes(termino);
    });

    usuariosFiltrados.forEach((usuario) => {
        const fila = document.createElement("tr");
        const botones = document.createElement("td");
        const btn_eliminar = document.createElement("button");
        const btn_editar = document.createElement("button");

        botones.className = "acciones";
        btn_eliminar.type = "button";
        btn_editar.type = "button";
        btn_eliminar.className = "btn_eliminar";
        btn_editar.className = "btn_editar";

        btn_eliminar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icons">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 0c-.893 0-1.77.12-2.618.357m0 0A47.53 47.53 0 0 1 6 5.315m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.164h-4.82c-1.18 0-2.09.984-2.09 2.164v.916M13.5 7.5h-3" />
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
            <td>${usuario.nombreUsuario}</td>
            <td>${usuario.rol}</td>
        `;

        btn_eliminar.addEventListener("click", async () => {
            try {
                const resultado = await Swal.fire({
                        title: "¿Eliminar usuario?",
                        text: "Esta acción no se puede deshacer.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar"
                    });
                if (resultado.isConfirmed){
                    await eliminarUsuario(usuario.id);
                    await cargarUsuarios();
                }
            } catch (error) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se pudo eliminar al usuario"
                });
            }
        });

        btn_editar.addEventListener("click", () => {
            usuarioEditando = usuario.id;
            actualizarTextoModal();
            mostrarUsuarioForm(usuario);
            abrirModal();
        });

        botones.appendChild(btn_eliminar);
        botones.appendChild(btn_editar);
        fila.appendChild(botones);
        tabla.appendChild(fila);
    });
};

const cargarUsuarios = async () => {
    const usuarios = await obtenerUsuarios();
    mostrarUsuarios(usuarios);
};

const cerrarModal = () => {
    if (modalOverlay) {
        modalOverlay.style.display = "none";
    }
};

const abrirModal = () => {
    if (modalOverlay) {
        modalOverlay.style.display = "flex";
        actualizarTextoModal();
    }
};

btn_guardar.addEventListener("click", async () => {
    try {
        if (usuarioEditando) {
            await actualizarUsuario(usuarioEditando);
        } else {
            await crearUsuario();
        }

        await cargarUsuarios();
        limpiarFormulario();
        cerrarModal();
        usuarioEditando = null;
        actualizarTextoModal();
    } catch (error) {
        alert(error.message);
    }
});

if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", () => {
        usuarioEditando = null;
        actualizarTextoModal();
        limpiarFormulario();
        abrirModal();
    });
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", () => {
        usuarioEditando = null;
        actualizarTextoModal();
        limpiarFormulario();
        cerrarModal();
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) {
            usuarioEditando = null;
            actualizarTextoModal();
            limpiarFormulario();
            cerrarModal();
        }
    });
}

if (inputBuscar) {
    inputBuscar.addEventListener("input", () => {
        cargarUsuarios().catch((error) => console.error(error));
    });
}

cargarUsuarios().catch((error) => console.error(error));

if (!token){
    window.location.href = "../Templates/login.html"
}