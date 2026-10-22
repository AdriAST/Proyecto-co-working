class Evento {
    constructor(id, nombre, fecha, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.fecha = fecha;
        this.descripcion = descripcion;
    }
}

class GestorEventos {
    constructor() {
        this.eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    }

    agregarEvento(evento) {
        this.eventos.push(evento);
        this.guardarEventos();
    }

    guardarEventos() {
        localStorage.setItem("eventos", JSON.stringify(this.eventos));
    }
}

// ELEMENTOS DEL HTML DE EVENTOS
const formularioEvento = document.getElementById("formularioEvento");
const nombreEvento = document.getElementById("nombreEvento");
const fechaEvento = document.getElementById("fechaEvento");
const descripcionEvento = document.getElementById("descripcionEvento");
const listaEventos = document.getElementById("listaEventos");

const gestorEventos = new GestorEventos();

// VALIDAR EVENTOS
function validarEvento(nombre, fecha) {
    if (nombre.trim() === "") {
        alert("El nombre del evento es obligatorio");
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

// CREAR EVENTOS
if (formularioEvento) {
    formularioEvento.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let nombre = nombreEvento.value.trim();
        let fecha = fechaEvento.value;
        let descripcion = descripcionEvento.value.trim();

        if (!validarEvento(nombre, fecha)) {
            return;
        }

        let nuevoEvento = new Evento(
            Date.now(),
            nombre,
            fecha,
            descripcion
        );

        gestorEventos.agregarEvento(nuevoEvento);

        mostrarEventos();

        formularioEvento.reset();
    });
}

// MOSTRAR EVENTOS
function mostrarEventos() {
    if (listaEventos) {
        listaEventos.innerHTML = "";

        gestorEventos.eventos.forEach(function (evento) {
            let li = document.createElement("li");

            li.textContent = evento.nombre + " - " + evento.fecha;

            if (evento.descripcion !== "") {
                li.textContent += " - " + evento.descripcion;
            }

            // BOTON ELIMINAR
            let botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";

            botonEliminar.addEventListener("click", function () {
                gestorEventos.eventos = gestorEventos.eventos.filter(
                    function (eventoGuardado) {
                        return eventoGuardado.id !== evento.id;
                    }
                );

                gestorEventos.guardarEventos();

                mostrarEventos();
            });

            li.appendChild(botonEliminar);

            // BOTON EDITAR
            let botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";

            botonEditar.addEventListener("click", function () {
                let nuevoNombre = prompt(
                    "Introduce el nuevo nombre:",
                    evento.nombre
                );

                if (nuevoNombre === null) {
                    return;
                }

                let nuevaFecha = prompt(
                    "Introduce la nueva fecha (AAAA-MM-DD):",
                    evento.fecha
                );

                if (nuevaFecha === null) {
                    return;
                }

                let nuevaDescripcion = prompt(
                    "Introduce la nueva descripción:",
                    evento.descripcion
                );

                if (nuevaDescripcion === null) {
                    return;
                }

                if (!validarEvento(nuevoNombre, nuevaFecha)) {
                    return;
                }

                evento.nombre = nuevoNombre.trim();
                evento.fecha = nuevaFecha;
                evento.descripcion = nuevaDescripcion.trim();

                gestorEventos.guardarEventos();

                mostrarEventos();
            });

            li.appendChild(botonEditar);

            listaEventos.appendChild(li);
        });
    }
}

// MOSTRAR DATOS AL CARGAR LA PAGINA
mostrarEventos();