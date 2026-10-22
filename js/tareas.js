class Tarea {
    constructor(id, nombre, fecha, prioridad) {
        this.id = id;
        this.nombre = nombre;
        this.fecha = fecha;
        this.prioridad = prioridad;
        this.completada = false;
    }
}

class GestorTareas {
    constructor() {
        this.tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    }

    agregarTarea(tarea) {
        this.tareas.push(tarea);
        this.guardarTareas();
    }

    guardarTareas() {
        localStorage.setItem("tareas", JSON.stringify(this.tareas));
    }
}

// ELEMENTOS DEL HTML DE TAREAS
const formulario = document.getElementById("formularioTarea");
const nombreTarea = document.getElementById("nombreTarea");
const fechaTarea = document.getElementById("fechaTarea");
const prioridadTarea = document.getElementById("prioridadTarea");
const listaTareas = document.getElementById("listaTareas");

const gestor = new GestorTareas();

// MOSTRAR Y OCULTAR FORMULARIO
const botonNuevaTarea = document.getElementById("botonNuevaTarea");
const seccionFormulario = document.getElementById("seccionFormulario");

botonNuevaTarea.addEventListener("click", function () {

    if (seccionFormulario.hidden) {
        seccionFormulario.hidden = false;
        botonNuevaTarea.textContent = "Cerrar";
    } else {
        seccionFormulario.hidden = true;
        botonNuevaTarea.textContent = "+ Nueva tarea";
    }

});

// VALIDAR TAREAS
function validarTarea(nombre, fecha, prioridad) {
    if (nombre.trim() === "") {
        alert("El nombre de la tarea es obligatorio");
        return false;
    }

    if (prioridad !== "alta" && prioridad !== "media" && prioridad !== "baja") {
        alert("Debes seleccionar una prioridad válida");
        return false;
    }

    if (fecha === "") {
        alert("Debes seleccionar una fecha");
        return false;
    }

    let hoy = new Date();

    let fechaActual = hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

    if (fecha < fechaActual) {
        alert("La fecha no puede ser anterior a hoy");
        return false;
    }

    return true;
}

// CREAR TAREAS
if (formulario) {
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let nombre = nombreTarea.value.trim();
        let fecha = fechaTarea.value;
        let prioridad = prioridadTarea.value;

        if (!validarTarea(nombre, fecha, prioridad)) {
            return;
        }

        let tarea = new Tarea(Date.now(), nombre, fecha, prioridad);

        gestor.agregarTarea(tarea);

        mostrarTareas();

        formulario.reset();
    });
}

// MOSTRAR TAREAS
function mostrarTareas() {
    if (listaTareas) {
        listaTareas.innerHTML = "";

        gestor.tareas.forEach(function (tarea) {
            let li = document.createElement("li");

            li.textContent = tarea.nombre;

            if (tarea.fecha !== "") {
                li.textContent += " - " + tarea.fecha;
            }

            // ETIQUETA DE PRIORIDAD
            let etiquetaPrioridad = document.createElement("span");

            etiquetaPrioridad.textContent = tarea.prioridad;
            etiquetaPrioridad.className = "prioridad " + tarea.prioridad;

            li.appendChild(etiquetaPrioridad);

            // BOTON COMPLETAR
            let botonCompletar = document.createElement("button");
            botonCompletar.textContent = "Completar";

            if (tarea.completada === true) {

                li.classList.add("tareaCompletada");

                botonCompletar.disabled = true;
                botonCompletar.textContent = "Completada";
            }

            botonCompletar.addEventListener("click", function () {
                tarea.completada = true;

                gestor.guardarTareas();

                mostrarTareas();
            });

            li.appendChild(botonCompletar);

            // BOTON ELIMINAR
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";

            botonEliminar.addEventListener("click", function () {
                gestor.tareas = gestor.tareas.filter(function (tareaGuardada) {
                    return tareaGuardada.id !== tarea.id;
                });

                gestor.guardarTareas();

                mostrarTareas();
            });

            li.appendChild(botonEliminar);

            // BOTON EDITAR
            let botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";

            botonEditar.addEventListener("click", function () {
                let nuevoNombre = prompt(
                    "Introduce el nuevo nombre:",
                    tarea.nombre
                );

                if (nuevoNombre === null) {
                    return;
                }

                let nuevaFecha = prompt(
                    "Introduce la nueva fecha (AAAA-MM-DD):",
                    tarea.fecha
                );

                if (nuevaFecha === null) {
                    return;
                }

                let nuevaPrioridad = prompt(
                    "Introduce la nueva prioridad (alta, media o baja):",
                    tarea.prioridad
                );

                if (nuevaPrioridad === null) {
                    return;
                }

                nuevoNombre = nuevoNombre.trim();
                nuevaPrioridad = nuevaPrioridad.trim().toLowerCase();

                if (!validarTarea(nuevoNombre, nuevaFecha, nuevaPrioridad)) {
                    return;
                }

                tarea.nombre = nuevoNombre;
                tarea.fecha = nuevaFecha;
                tarea.prioridad = nuevaPrioridad;

                gestor.guardarTareas();

                mostrarTareas();
            });

            li.appendChild(botonEditar);

            listaTareas.appendChild(li);
        });
        contarTareas();
        mostrarProgreso();
    }
}

// CONTAR TAREAS
function contarTareas() {

    let pendientes = 0;
    let completadas = 0;
    let prioritarias = 0;

    gestor.tareas.forEach(function (tarea) {

        if (tarea.completada === true) {
            completadas++;
        } else {
            pendientes++;
        }

        if (tarea.prioridad === "alta" && tarea.completada === false) {
            prioritarias++;
        }
    });
    console.log("Pendientes:", pendientes);
    console.log("Completadas:", completadas);
    console.log("Prioritarias:", prioritarias);

    document.getElementById("totalPendientes").textContent = pendientes;
    document.getElementById("totalCompletadas").textContent = completadas;
    document.getElementById("totalPrioritarias").textContent = prioritarias;

}

// MOSTRAR PROGRESO DE TAREAS
function mostrarProgreso() {

    let total = gestor.tareas.length;
    let completadas = 0;
    let alta = 0;
    let media = 0;
    let baja = 0;

    gestor.tareas.forEach(function (tarea) {

        if (tarea.completada === true) {
            completadas++;
        }

        // Contar prioridades de tareas pendientes
        if (tarea.completada === false) {

            if (tarea.prioridad === "alta") {
                alta++;
            }

            if (tarea.prioridad === "media") {
                media++;
            }

            if (tarea.prioridad === "baja") {
                baja++;
            }
        }
    });

    // CALCULAR PORCENTAJE
    let porcentaje = 0;

    if (total > 0) {
        porcentaje = Math.round((completadas / total) * 100);
    }

    // ACTUALIZAR HTML
    document.getElementById("textoProgreso").textContent =
        completadas + " de " + total + " tareas completadas";

    document.getElementById("porcentajeProgreso").textContent =
        porcentaje + "%";

    document.getElementById("progresoCompletado").style.width =
        porcentaje + "%";

    document.getElementById("prioridadAlta").textContent = alta;
    document.getElementById("prioridadMedia").textContent = media;
    document.getElementById("prioridadBaja").textContent = baja;
}

let fechaMenu = document.getElementById("fechaMenu");

if (fechaMenu) {
    let hoy = new Date();

    fechaMenu.textContent = hoy.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// MOSTRAR DATOS AL CARGAR LA PAGINA
mostrarTareas();
