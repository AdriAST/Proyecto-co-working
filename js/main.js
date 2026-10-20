
class Tarea {
    constructor(id, nombre, fecha) {
        this.id = id;
        this.nombre = nombre;
        this.fecha = fecha;
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
const listaTareas = document.getElementById("listaTareas");

const gestor = new GestorTareas();


formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let nombre = nombreTarea.value.trim();
    let fecha = fechaTarea.value;

    if (nombre !== "") {
        let tarea = new Tarea(Date.now(), nombre, fecha);

        gestor.agregarTarea(tarea);
        mostrarTareas();

        formulario.reset();
    }
});

function mostrarTareas() {
    listaTareas.innerHTML = "";

    gestor.tareas.forEach(function(tarea) {
        let li = document.createElement("li");

        li.textContent = tarea.nombre;

        if (tarea.fecha !== "") {
            li.textContent += " - " + tarea.fecha;
        }

        listaTareas.appendChild(li);
    });

    mostrarTareas();
}
