

let datosDisponibles = true;
let tareas = cargarTareas();
let idEdicion = null;

const formulario = document.getElementById("formularioTarea");
const seccion = document.getElementById("seccionFormulario");
const botonNuevo = document.getElementById("botonNuevaTarea");
const nombre = document.getElementById("nombreTarea");
const fecha = document.getElementById("fechaTarea");
const prioridad = document.getElementById("prioridadTarea");
const filtro = document.getElementById("filtroTareas");

// ABRIR Y CERRAR EL FORMULARIO

function abrirFormulario() {
    seccion.hidden = false;
    botonNuevo.setAttribute("aria-expanded", "true");
}

function cerrarFormulario() {
    idEdicion = null;
    formulario.reset();
    seccion.hidden = true;
    botonNuevo.setAttribute("aria-expanded", "false");
}

botonNuevo.addEventListener("click", function () {
    if (!seccion.hidden) {
        cerrarFormulario();
        return;
    }

    idEdicion = null;
    formulario.reset();
    fecha.value = fechaHoy();
    document.getElementById("tituloFormulario").textContent = "Nueva tarea";
    abrirFormulario();
});

document.getElementById("cancelarTarea").addEventListener("click", cerrarFormulario);
formulario.addEventListener("submit", guardarTarea);
filtro.addEventListener("change", mostrarTareas);

// EDITAR Y ELIMINAR

function editarTarea(tarea) {
    idEdicion = tarea.id;
    nombre.value = tarea.nombre;
    fecha.value = tarea.fecha;
    prioridad.value = tarea.prioridad;
    document.getElementById("tituloFormulario").textContent = "Editar tarea";
    abrirFormulario();
}

function eliminarTarea(tarea) {
    const confirmado = confirm('¿Eliminar la tarea "' + tarea.nombre + '"?');

    if (!confirmado) {
        return;
    }

    const nuevosDatos = tareas.filter(function (dato) {
        return dato.id !== tarea.id;
    });

    if (guardarTareas(nuevosDatos)) {
        if (idEdicion === tarea.id) {
            cerrarFormulario();
        }

        mostrarTareas();
    }
}

// GUARDAR EL FORMULARIO: CREACIÓN O EDICIÓN

function guardarTarea(eventoFormulario) {
    eventoFormulario.preventDefault();

    const prioridadCorrecta = prioridad.value === "alta" || prioridad.value === "media" || prioridad.value === "baja";

    if (nombre.value.trim() === "" || !fechaValida(fecha.value) || !prioridadCorrecta) {
        mostrarAviso("Introduce un nombre, una fecha real y una prioridad válida.");
        return;
    }

    // Permito fechas pasadas para poder editar tareas vencidas.

    let id = idEdicion;

    if (id === null) {
        id = nuevoIdTarea();
    }

    let completada = false;

    if (idEdicion !== null) {
        const anterior = tareas.find(function (tarea) {
            return tarea.id === idEdicion;
        });

        completada = anterior.completada;
    }

    const tarea = {
        id: id,
        nombre: nombre.value.trim(),
        fecha: fecha.value,
        prioridad: prioridad.value,
        completada: completada
    };

    const nuevosDatos = tareas.slice();

    if (idEdicion === null) {
        nuevosDatos.push(tarea);
    } else {
        for (let i = 0; i < nuevosDatos.length; i++) {
            if (nuevosDatos[i].id === idEdicion) {
                nuevosDatos[i] = tarea;
                break;
            }
        }
    }

    if (guardarTareas(nuevosDatos)) {
        cerrarFormulario();
        mostrarTareas();
    }
}

function cambiarEstadoTarea(tarea) {
    const copia = {
        id: tarea.id,
        nombre: tarea.nombre,
        fecha: tarea.fecha,
        prioridad: tarea.prioridad,
        completada: !tarea.completada
    };

    const nuevasTareas = tareas.slice();

    for (let i = 0; i < nuevasTareas.length; i++) {
        if (nuevasTareas[i].id === tarea.id) {
            nuevasTareas[i] = copia;
            break;
        }
    }

    if (guardarTareas(nuevasTareas)) {
        mostrarTareas();
    }
}

// MOSTRAR LAS TAREAS

function mostrarTareas() {
    const lista = document.getElementById("listaTareas");
    lista.innerHTML = "";
    const ordenadas = tareas.slice();

    ordenadas.sort(function (a, b) {
        if (a.fecha < b.fecha) {
            return -1;
        }

        if (a.fecha > b.fecha) {
            return 1;
        }

        return 0;
    });

    ordenadas.forEach(function (tarea) {
        if (filtro.value === "pendientes" && tarea.completada) {
            return;
        }

        if (filtro.value === "completadas" && !tarea.completada) {
            return;
        }

        const fila = document.createElement("li");
        const informacion = document.createElement("div");
        informacion.className = "informacion";

        const titulo = document.createElement("strong");
        titulo.textContent = tarea.nombre;

        const fechaTarea = document.createElement("small");
        fechaTarea.textContent = formatoFecha(tarea.fecha);

        const etiqueta = document.createElement("span");
        etiqueta.className = "prioridad " + tarea.prioridad;
        etiqueta.textContent = tarea.prioridad;

        informacion.appendChild(titulo);
        informacion.appendChild(fechaTarea);
        fila.appendChild(informacion);
        fila.appendChild(etiqueta);

        if (tarea.completada) {
            fila.className = "tareaCompletada";
        }

        const acciones = document.createElement("div");
        acciones.className = "acciones";

        const botonCompletar = document.createElement("button");
        botonCompletar.type = "button";
        botonCompletar.className = "secundario";
        botonCompletar.textContent = "Completar";

        if (tarea.completada) {
            botonCompletar.textContent = "Reabrir";
        }

        botonCompletar.addEventListener("click", function () {
            cambiarEstadoTarea(tarea);
        });

        acciones.appendChild(botonCompletar);

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "secundario";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", function () {
            editarTarea(tarea);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "borrar";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function () {
            eliminarTarea(tarea);
        });

        acciones.appendChild(botonEditar);
        acciones.appendChild(botonEliminar);
        fila.appendChild(acciones);
        lista.appendChild(fila);
    });

    if (lista.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No hay tareas para este filtro.";
        lista.appendChild(aviso);
    }

    contarTareas();
    mostrarProgreso();
}

// CONTADORES Y PROGRESO

function contarTareas() {
    let pendientes = 0;
    let completadas = 0;
    const prioridades = {
        alta: 0,
        media: 0,
        baja: 0
    };

    tareas.forEach(function (tarea) {
        if (tarea.completada) {
            completadas++;
        } else {
            pendientes++;
            prioridades[tarea.prioridad]++;
        }
    });

    document.getElementById("totalPendientes").textContent = pendientes;
    document.getElementById("totalCompletadas").textContent = completadas;
    document.getElementById("totalPrioritarias").textContent = prioridades.alta;
    document.getElementById("prioridadAlta").textContent = prioridades.alta;
    document.getElementById("prioridadMedia").textContent = prioridades.media;
    document.getElementById("prioridadBaja").textContent = prioridades.baja;
}

function mostrarProgreso() {
    let completadas = 0;

    tareas.forEach(function (tarea) {
        if (tarea.completada) {
            completadas++;
        }
    });

    let porcentaje = 0;

    if (tareas.length > 0) {
        porcentaje = Math.round(completadas / tareas.length * 100);
    }

    document.getElementById("textoProgreso").textContent = completadas + " de " + tareas.length + " tareas completadas";
    document.getElementById("porcentajeProgreso").textContent = porcentaje + "%";
    document.getElementById("barraProgreso").value = porcentaje;
}

// ALMACENAMIENTO

function cargarTareas() {
    try {
        const texto = localStorage.getItem("tareas");
        let lista = [];

        if (texto !== null) {
            lista = JSON.parse(texto);
        }

        if (!Array.isArray(lista)) {
            throw new Error("Formato incorrecto");
        }

        const identificadores = [];

        for (let i = 0; i < lista.length; i++) {
            const dato = lista[i];

            if (!dato || (typeof dato.id !== "number" && typeof dato.id !== "string")) {
                throw new Error("Identificador incorrecto");
            }

            if (typeof dato.id === "number" && !Number.isFinite(dato.id)) {
                throw new Error("Identificador incorrecto");
            }

            if (identificadores.indexOf(dato.id) !== -1) {
                throw new Error("Identificador repetido");
            }

            identificadores.push(dato.id);

            if (typeof dato.nombre !== "string" || dato.nombre.trim() === "" || !fechaValida(dato.fecha)) {
                throw new Error("Datos incorrectos");
            }

            const prioridadCorrecta = dato.prioridad === "alta" || dato.prioridad === "media" || dato.prioridad === "baja";
            if (!prioridadCorrecta || typeof dato.completada !== "boolean") {
                throw new Error("Tarea incorrecta");
            }
        }

        return lista;
    } catch (error) {
        datosDisponibles = false;
        mostrarAviso("No se pueden leer los datos de tareas. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
}

function guardarTareas(nuevosDatos) {
    if (!datosDisponibles) {
        mostrarAviso("Primero debes revisar los datos de tareas en el almacenamiento del navegador.");
        return false;
    }

    try {
        localStorage.setItem("tareas", JSON.stringify(nuevosDatos));
        tareas = nuevosDatos;
        document.getElementById("mensaje").hidden = true;
        return true;
    } catch (error) {
        mostrarAviso("No se han guardado los cambios. Comprueba el espacio y los permisos del navegador.");
        return false;
    }
}

function nuevoIdTarea() {
    let id = Date.now();

    tareas.forEach(function (dato) {
        if (typeof dato.id === "number" && dato.id >= id) {
            id = dato.id + 1;
        }
    });

    return id;
}

// FECHAS

function fechaHoy() {
    const hoy = new Date();
    let mes = hoy.getMonth() + 1;
    let dia = hoy.getDate();

    if (mes < 10) {
        mes = "0" + mes;
    }

    if (dia < 10) {
        dia = "0" + dia;
    }

    return hoy.getFullYear() + "-" + mes + "-" + dia;
}

function fechaValida(fecha) {
    if (typeof fecha !== "string" || fecha.length !== 10) {
        return false;
    }

    const partes = fecha.split("-");

    if (partes.length !== 3 || partes[0].length !== 4 || partes[1].length !== 2 || partes[2].length !== 2) {
        return false;
    }

    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (anio < 1000 || anio > 9999) {
        return false;
    }

    const prueba = new Date(anio, mes - 1, dia);
    return prueba.getFullYear() === anio &&
        prueba.getMonth() === mes - 1 &&
        prueba.getDate() === dia;
}

function formatoFecha(fecha) {
    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// AVISOS

function mostrarAviso(texto) {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = texto;
    mensaje.hidden = false;
}

// CARGA INICIAL

mostrarTareas();
