// DATOS GUARDADOS EN LOCALSTORAGE
const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
const eventos = JSON.parse(localStorage.getItem("eventos")) || [];

// ELEMENTOS DE INDEX.HTML
const tareasPendientes = document.getElementById("tareasPendientes");
const numeroTareas = document.getElementById("numeroTareas");
const eventosProximos = document.getElementById("eventosProximos");
const numeroEventos = document.getElementById("numeroEventos");

// MOSTRAR TAREAS PENDIENTES
function mostrarTareasPendientes() {
    if (tareasPendientes) {
        tareasPendientes.innerHTML = "";

        tareas.forEach(function (tarea) {
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

        tareas.forEach(function (tarea) {
            if (tarea.completada === false) {
                contador++;
            }
        });

        numeroTareas.textContent = contador;
    }
}

// MOSTRAR PROXIMOS EVENTOS
function mostrarEventosProximos() {
    if (eventosProximos) {
        eventosProximos.innerHTML = "";

        let hoy = new Date();

        let fechaActual = hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
            String(hoy.getDate()).padStart(2, "0");

        eventos.forEach(function (evento) {
            if (evento.fecha >= fechaActual) {
                let li = document.createElement("li");

                li.textContent = evento.nombre + " - " + evento.fecha;

                eventosProximos.appendChild(li);
            }
        });
    }
}

// CONTAR PROXIMOS EVENTOS
function contarEventos() {
    if (numeroEventos) {
        let contador = 0;

        let hoy = new Date();

        let fechaActual = hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
            String(hoy.getDate()).padStart(2, "0");

        eventos.forEach(function (evento) {
            if (evento.fecha >= fechaActual) {
                contador++;
            }
        });

        numeroEventos.textContent = contador;
    }
}

// MOSTRAR DATOS AL CARGAR LA PAGINA
mostrarTareasPendientes();
contarTareasPendientes();
mostrarEventosProximos();
contarEventos();