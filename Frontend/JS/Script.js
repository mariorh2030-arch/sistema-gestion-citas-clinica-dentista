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

const URL_TRATAMIENTOS = "/api/tratamientos";
const URL_CITAS = "/api/citas";

const convertirHorasAMinutos = (hora) => {
    const [h, m] = hora.split(":");
    return Number(h) * 60 + Number(m);
}

const cargarTratamientosEnSelect = async () => {
    try {
        const response = await fetch(URL_TRATAMIENTOS);
        const tratamientos = await response.json();

        if (!response.ok) {
            throw new Error(tratamientos.mensaje || "No se pudieron cargar los tratamientos");
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: tratamientos.mensaje || "No se pudieron cargar los tratamientos"
            });
            return;
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
    const horaApertura = convertirHorasAMinutos("9:00");
    const horaCierre = convertirHorasAMinutos("18:00"); 
    const hora = new Date();
    const hoy = new Date();
    hoy.setHours(0,0,0,0);


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
    const [
        anioNacimiento, 
        mesNacomiento, 
        diaNacimiento
    ] = nuevaCita.fechaNacimiento.split("-");
    const [anio, mes, dia] = nuevaCita.fecha.split("-");
    const horaInicio = convertirHorasAMinutos(nuevaCita.hora);
    const horaActual = hora.getHours() * 60 + hora.getMinutes();
    const fecha_nacimiento = new Date(Number(anioNacimiento));
    const anioActual = new Date().getFullYear();
    const fechaSeleccionada = new Date(
        Number(anio),
        Number(mes) -1,
        Number(dia)
    );

    fechaSeleccionada.setHours(0, 0, 0, 0);




    if (Object.entries(nuevaCita)
        .filter(([campo]) => campo !== "correo")
        .some(([, valor]) => !valor)) {
          Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Completa todos los campos."
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

    if(!validarTelefono(nuevaCita.telefono))
    {
        Swal.fire({
            icon: "warning",
            title: "Atención",
            text: "Numero de telefono invalido"
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
    if (
        fechaSeleccionada.getTime() === hoy.getTime() && 
        horaInicio < horaActual
    ) {
        Swal.fire({
            icon: "warning",
            title: "Horario Invalido",
            text: "No puedes agendar una cita en una hora que ya pasó."
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
    if(fecha_nacimiento > anioActual){
        Swal.fire({
            icon: "warning",
            title: "Atencion",
            text: "El año de nacimiento debe de ser menor al año actual"
        });
        return;
    }

    const response = await fetch(URL_CITAS, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCita)
    });

    const data = await response.json();
      if(response.ok){
          Swal.fire({
              icon: "success",
              title: "¡Correcto!",
              text: "Cita creada correctamente",
              confirmButtonText: "Aceptar"
          });
          limpiarInputs();
          return data;
      }
  
      if (!response.ok) {
          Swal.fire({
              icon: "error",
              title: "Oops...",
              text: data?.mensaje || "No se pudo agendar la cita."
          });
          return data;
      }

    
}

btn_agendar.addEventListener('click', async () => {
    await insertarCita();
});

