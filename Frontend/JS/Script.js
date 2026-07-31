import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.all.js";
const btn_agendar = document.getElementById("btn_agendar");
const inputNombre = document.getElementById("nombre");
const inputApellidos = document.getElementById("apellidos");
const inputFechaNacimiento = document.getElementById("fechaNacimiento");
const inputCorreo = document.getElementById("correo");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora")
const inputTelefono = document.getElementById("numero");
const selectTratamiento = document.getElementById("tratamiento");
const error = document.getElementById("error");
const token = localStorage.getItem("token");

const URL_TRATAMIENTOS = "/api/tratamientos";
const URL_CITAS = "/api/citas";

const cargarTratamientosEnSelect = async () => {
    try {
        const response = await fetch(URL_TRATAMIENTOS, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const tratamientos = await response.json();

        if (!response.ok) {
            throw new Error(tratamientos.mensaje || "No se pudieron cargar los tratamientos");
        }

        selectTratamiento.innerHTML = "";

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Selecciona un tratamiento";
        opcionInicial.selected = true;
        opcionInicial.disabled = true;
        selectTratamiento.appendChild(opcionInicial);

        tratamientos.forEach(({ id, nombreTratamiento }) => {
            const opcion = document.createElement("option");
            opcion.value = id;
            opcion.textContent = nombreTratamiento;
            selectTratamiento.appendChild(opcion);
        });

        selectTratamiento.disabled = false;
    } catch (err) {
        selectTratamiento.innerHTML = "<option value=\"\">No se pudieron cargar los tratamientos</option>";
        error.textContent = err.message;
    }
};

cargarTratamientosEnSelect();



const limpiarInputs = () => {
    inputNombre.value = "";
    inputApellidos.value = "";
    inputFecha.value = "";
    inputHora.value = "";
    inputCorreo.value = "";
    inputTelefono.value = "";
    inputFechaNacimiento.value = "";
    selectTratamiento.value = "";
}
const validarEmail = (email) => {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTelefono = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    return /^\d{10}$/.test(telefonoLimpio);
};
const insertarCita = async () => {
    const nuevaCita = {
        nombre: inputNombre.value,
        apellidos: inputApellidos.value,
        telefono: inputTelefono.value,
        correo: inputCorreo.value,
        fechaNacimiento: inputFechaNacimiento.value,
        tratamientoId: selectTratamiento.value,
        fecha: inputFecha.value,
        hora: inputHora.value
    }

    if (Object.entries(nuevaCita)
        .filter(([campo]) => campo !== "correo")
        .some(([, valor]) => !valor)) {
          Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Completa todos los campos."
        });
    }

    if (!validarEmail(nuevaCita.correo)) {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Ingrese un correo electronico valido"
        });
        
    }

    if(!validarTelefono(nuevaCita.telefono))
    {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Numero de telefono invalido"
        });
        
    }

    const response = await fetch(URL_CITAS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nuevaCita)
    });


      if(response.ok){
          Swal.fire({
              icon: "success",
              title: "¡Correcto!",
              text: "Cita creada correctamente",
              confirmButtonText: "Aceptar"
          });
      }
  
      if (!response.ok) {
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "No se pudo agentar la cita"
          });
      }

    const data = await response.json();
}

btn_agendar.addEventListener('click', async () => {
    await insertarCita();
    limpiarInputs();
});

