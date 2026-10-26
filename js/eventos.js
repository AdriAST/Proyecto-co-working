// CLASE EVENTO
class Evento {
    constructor(id, nombre, fecha, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.fecha = fecha;
        this.descripcion = descripcion;
    }
}

// GESTOR DE EVENTOS
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

// ELEMENTOS DEL HTML
const formularioEvento = document.getElementById("formularioEvento");
const nombreEvento = document.getElementById("nombreEvento");
const fechaEvento = document.getElementById("fechaEvento");
const descripcionEvento = document.getElementById("descripcionEvento");
const listaEventos = document.getElementById("listaEventos");

const gestorEventos = new GestorEventos();

// MOSTRAR Y OCULTAR FORMULARIO
const botonNuevoEvento = document.getElementById("botonNuevoEvento");
const seccionFormularioEvento = document.getElementById("seccionFormularioEvento");

if (botonNuevoEvento && seccionFormularioEvento) {
    botonNuevoEvento.addEventListener("click", function () {

        if (seccionFormularioEvento.hidden) {
            seccionFormularioEvento.hidden = false;
            botonNuevoEvento.textContent = "Cerrar";
        } else {
            seccionFormularioEvento.hidden = true;
            botonNuevoEvento.textContent = "+ Nuevo evento";
        }

    });
}

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

// RECUADRO DE FECHA
let fecha = document.createElement("div");
fecha.className = "fechaEvento";

let partesFecha = evento.fecha.split("-");

let dia = document.createElement("strong");
dia.textContent = partesFecha[2];

let mes = document.createElement("span");

let nombresMeses = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
];

mes.textContent = nombresMeses[Number(partesFecha[1]) - 1];

fecha.appendChild(dia);
fecha.appendChild(mes);

// INFORMACION DEL EVENTO
let informacion = document.createElement("div");
informacion.className = "informacionEvento";

let nombre = document.createElement("h3");
nombre.textContent = evento.nombre;

let descripcion = document.createElement("p");
descripcion.textContent = evento.descripcion;

informacion.appendChild(nombre);
informacion.appendChild(descripcion);

li.appendChild(fecha);
li.appendChild(informacion);

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
        contarEventos();
        mostrarProximosEventos();
    }
}

// CONTAR EVENTOS
function contarEventos() {

    let proximos = 0;
    let esteMes = 0;
    let total = gestorEventos.eventos.length;

    let hoy = new Date();

    let fechaActual = hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

    let mesActual = fechaActual.substring(0, 7);

    gestorEventos.eventos.forEach(function(evento) {

        // EVENTOS DE HOY O FUTUROS
        if (evento.fecha >= fechaActual) {
            proximos++;
        }

        // EVENTOS DEL MES ACTUAL
        if (evento.fecha.substring(0, 7) === mesActual) {
            esteMes++;
        }

    });

    document.getElementById("totalProximosEventos").textContent = proximos;
    document.getElementById("eventosEsteMes").textContent = esteMes;
    document.getElementById("totalEventos").textContent = total;
}

// MOSTRAR LOS 3 PROXIMOS EVENTOS
function mostrarProximosEventos() {

    let listaProximos = document.getElementById("listaProximosEventos");

    listaProximos.innerHTML = "";

    let hoy = new Date();

    let fechaActual = hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

    // FILTRAR EVENTOS FUTUROS
    let proximos = gestorEventos.eventos.filter(function(evento) {
        return evento.fecha >= fechaActual;
    });

    // ORDENAR POR FECHA
    proximos.sort(function(a, b) {
        return a.fecha.localeCompare(b.fecha);
    });

    // MOSTRAR SOLO LOS 3 PRIMEROS
    proximos.slice(0, 3).forEach(function(evento) {

        let li = document.createElement("li");

// FECHA DEL EVENTO
let fecha = document.createElement("div");
fecha.className = "fechaEvento";

let partesFecha = evento.fecha.split("-");

let dia = document.createElement("strong");
dia.textContent = partesFecha[2];

let mes = document.createElement("span");

let nombresMeses = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
];

mes.textContent = nombresMeses[Number(partesFecha[1]) - 1];

fecha.appendChild(dia);
fecha.appendChild(mes);

// NOMBRE DEL EVENTO
let nombre = document.createElement("p");
nombre.textContent = evento.nombre;

// AÑADIR ELEMENTOS
li.appendChild(fecha);
li.appendChild(nombre);

listaProximos.appendChild(li);
    });

    // SI NO HAY EVENTOS
    if (proximos.length === 0) {
        let li = document.createElement("li");
        li.textContent = "No tienes próximos eventos";
        listaProximos.appendChild(li);
    }
}

// MOSTRAR EVENTOS AL CARGAR LA PAGINA
mostrarEventos();