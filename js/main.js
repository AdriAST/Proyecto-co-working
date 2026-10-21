
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


const formulario = document.getElementById("formularioTarea");
const nombreTarea = document.getElementById("nombreTarea");
const fechaTarea = document.getElementById("fechaTarea");
const prioridadTarea = document.getElementById("prioridadTarea");
const listaTareas = document.getElementById("listaTareas");

const tareasPendientes = document.getElementById("tareasPendientes");
const numeroTareas = document.getElementById("numeroTareas");

const gestor = new GestorTareas();


// CREAR TAREAS
if (formulario) {

    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        let nombre = nombreTarea.value.trim();
        let fecha = fechaTarea.value;
        let prioridad = prioridadTarea.value;

        if (prioridad !== "alta" && prioridad !== "media" && prioridad !== "baja") {
            alert("Debes seleccionar una prioridad válida");
            return;
        }

        let hoy = new Date();
        let fechaActual = hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
            String(hoy.getDate()).padStart(2, "0");

        if (fecha === "") {
            alert("Debes seleccionar una fecha");
            return;
        }

        if (fecha < fechaActual) {
            alert("La fecha no puede ser anterior a hoy");
            return;
        }

        if (nombre === "") {
            alert("El nombre de la tarea es obligatorio");
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

        gestor.tareas.forEach(function(tarea) {
            let li = document.createElement("li");

            li.textContent = tarea.nombre;

            if (tarea.fecha !== "") {
                li.textContent += " - " + tarea.fecha;
            }

            if (tarea.prioridad) {
                li.textContent += " - Prioridad: " + tarea.prioridad;
            }

            listaTareas.appendChild(li);
        });
    }
}


// MOSTRAR TAREAS PENDIENTES EN INDEX.HTML
function mostrarTareasPendientes() {

    if (tareasPendientes) {

        tareasPendientes.innerHTML = "";

        gestor.tareas.forEach(function(tarea) {

            if (tarea.completada === false) {

                let li = document.createElement("li");

                li.textContent = tarea.nombre;

                tareasPendientes.appendChild(li);
            }
        });
    }
}


// MOSTRAR LAS TAREAS AL CARGAR LA PÁGINA
mostrarTareas();
mostrarTareasPendientes();

function contarTareasPendientes() {

    if (numeroTareas) {

        let contador = 0;

        gestor.tareas.forEach(function(tarea) {

            if (tarea.completada === false) {
                contador++;
            }

        });

        numeroTareas.textContent = contador;
    }
}

contarTareasPendientes();