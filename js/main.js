
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


// ELEMENTOS DEL HTML
const formulario = document.getElementById("formularioTarea");
const nombreTarea = document.getElementById("nombreTarea");
const fechaTarea = document.getElementById("fechaTarea");
const prioridadTarea = document.getElementById("prioridadTarea");
const listaTareas = document.getElementById("listaTareas");

const tareasPendientes = document.getElementById("tareasPendientes");
const numeroTareas = document.getElementById("numeroTareas");

const gestor = new GestorTareas();


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

    // Comprobar que la fecha sea obligatoria
    if (fecha === "") {
        alert("Debes seleccionar una fecha");
        return false;
    }
    // Obtener la fecha de hoy
    let hoy = new Date();

    let fechaActual = hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

    // Comprobar que la fecha no sea anterior a hoy
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


// MOSTRAR TAREAS EN TAREAS.HTML
function mostrarTareas() {

    if (listaTareas) {

        listaTareas.innerHTML = "";

        gestor.tareas.forEach(function (tarea) {

            let li = document.createElement("li");

            li.textContent = tarea.nombre;

            if (tarea.fecha !== "") {
                li.textContent += " - " + tarea.fecha;
            }

            if (tarea.prioridad) {
                li.textContent += " - Prioridad: " + tarea.prioridad;
            }


            // BOTON COMPLETAR
            let botonCompletar = document.createElement("button");
            botonCompletar.textContent = "Completar";

            if (tarea.completada === true) {
                li.style.textDecoration = "line-through";
                botonCompletar.disabled = true;
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

                let nuevoNombre = prompt("Introduce el nuevo nombre:", tarea.nombre);

                if (nuevoNombre === null) {
                    return;
                }

                let nuevaFecha = prompt("Introduce la nueva fecha (AAAA-MM-DD):", tarea.fecha);

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


            // AÑADIR TAREA A LA LISTA
            listaTareas.appendChild(li);

        });
    }
}


// MOSTRAR TAREAS PENDIENTES EN INDEX.HTML
function mostrarTareasPendientes() {

    if (tareasPendientes) {

        tareasPendientes.innerHTML = "";

        gestor.tareas.forEach(function (tarea) {

            if (tarea.completada === false) {

                let li = document.createElement("li");

                li.textContent = tarea.nombre;

                tareasPendientes.appendChild(li);
            }
        });
    }
}


// CONTAR TAREAS PENDIENTES
function contarTareasPendientes() {

    if (numeroTareas) {

        let contador = 0;

        gestor.tareas.forEach(function (tarea) {

            if (tarea.completada === false) {
                contador++;
            }
        });

        numeroTareas.textContent = contador;
    }
}


// MOSTRAR DATOS AL CARGAR LA PAGINA
mostrarTareas();
mostrarTareasPendientes();
contarTareasPendientes();
