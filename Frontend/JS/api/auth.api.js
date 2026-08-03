import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const btn_acceder = document.getElementById("btn_acceder");
const URL_AUTH = "/api/autentificar";

const autentificar = async () => {

    try {
        const usuario = inputUsuario?.value?.trim() ?? "";
        const password = inputPassword?.value?.trim() ?? "";

        if (!usuario || !password) {

            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "Todos los campos requeridos"
            });
            return;
        }
        const user = {
            usuario: usuario,
            password: password
        }

        const response = await fetch(URL_AUTH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();
        if (response.ok){
            Swal.fire({
                icon: "success",
                title: "¡Correcto!",
                text: "Login Exitoso",
                confirmButtonText: "Aceptar"
            });
        }
        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: data.mensaje || "Error al iniciar sesion"
            });
            return;
        }
        localStorage.setItem("token", data.token);
        window.location.href = "../Templates/citas.html";
    } catch (error) {
        alert(error.message);
    }
}

btn_acceder.addEventListener('click', autentificar);