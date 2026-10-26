// DATOS Y ELEMENTOS DE LA PÁGINA

let datosDisponibles = true;
let eventos = cargarEventos();
let idEdicion = null;

const formulario = document.getElementById("formularioEvento");
const seccion = document.getElementById("seccionFormularioEvento");
const botonNuevo = document.getElementById("botonNuevoEvento");
const nombre = document.getElementById("nombreEvento");
const fecha = document.getElementById("fechaEvento");
const lugar = document.getElementById("lugarEvento");
const descripcion = document.getElementById("descripcionEvento");

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
    document.getElementById("tituloFormulario").textContent = "Nuevo evento";
    abrirFormulario();
});

document.getElementById("cancelarEvento").addEventListener("click", cerrarFormulario);
formulario.addEventListener("submit", guardarEvento);

// EDITAR Y ELIMINAR

function editarEvento(evento) {
    idEdicion = evento.id;
    nombre.value = evento.nombre;
    fecha.value = evento.fecha;
    lugar.value = evento.lugar || "";
    descripcion.value = evento.descripcion || "";
    document.getElementById("tituloFormulario").textContent = "Editar evento";
    abrirFormulario();
}

function eliminarEvento(evento) {
    const confirmado = confirm('¿Eliminar el evento "' + evento.nombre + '"?');

    if (!confirmado) {
        return;
    }

    const nuevosDatos = eventos.filter(function (dato) {
        return dato.id !== evento.id;
    });

    if (guardarEventos(nuevosDatos)) {
        if (idEdicion === evento.id) {
            cerrarFormulario();
        }

        mostrarEventos();
    }
}

// GUARDAR EL FORMULARIO: CREACIÓN O EDICIÓN

function guardarEvento(eventoFormulario) {
    eventoFormulario.preventDefault();

    if (nombre.value.trim() === "" || lugar.value.trim() === "" || !fechaValida(fecha.value)) {
        mostrarAviso("Introduce un título, un lugar y una fecha real.");
        return;
    }

    let id = idEdicion;

    if (id === null) {
        id = nuevoIdEvento();
    }

    const evento = {
        id: id,
        nombre: nombre.value.trim(),
        fecha: fecha.value,
        lugar: lugar.value.trim(),
        descripcion: descripcion.value.trim()
    };

    const nuevosDatos = eventos.slice();

    if (idEdicion === null) {
        nuevosDatos.push(evento);
    } else {
        for (let i = 0; i < nuevosDatos.length; i++) {
            if (nuevosDatos[i].id === idEdicion) {
                nuevosDatos[i] = evento;
                break;
            }
        }
    }

    if (guardarEventos(nuevosDatos)) {
        cerrarFormulario();
        mostrarEventos();
    }
}

// MOSTRAR LOS EVENTOS

function mostrarEventos() {
    const lista = document.getElementById("listaEventos");
    const listaProximos = document.getElementById("listaProximosEventos");
    lista.innerHTML = "";
    listaProximos.innerHTML = "";

    const hoy = fechaHoy();
    let proximos = 0;
    let esteMes = 0;
    const ordenados = eventos.slice();

    ordenados.sort(function (a, b) {
        if (a.fecha < b.fecha) {
            return -1;
        }

        if (a.fecha > b.fecha) {
            return 1;
        }

        return 0;
    });

    ordenados.forEach(function (evento) {
        if (evento.fecha.substring(0, 7) === hoy.substring(0, 7)) {
            esteMes++;
        }

        if (evento.fecha >= hoy) {
            proximos++;

            if (proximos <= 3) {
                listaProximos.appendChild(crearFilaEvento(evento));
            }
        }

        const fila = crearFilaEvento(evento);

        const acciones = document.createElement("div");
        acciones.className = "acciones";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "secundario";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", function () {
            editarEvento(evento);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "borrar";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function () {
            eliminarEvento(evento);
        });

        acciones.appendChild(botonEditar);
        acciones.appendChild(botonEliminar);
        fila.appendChild(acciones);
        lista.appendChild(fila);
    });

    if (lista.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No hay eventos guardados.";
        lista.appendChild(aviso);
    }

    if (listaProximos.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No tienes próximos eventos.";
        listaProximos.appendChild(aviso);
    }

    document.getElementById("totalProximosEventos").textContent = proximos;
    document.getElementById("eventosEsteMes").textContent = esteMes;
    document.getElementById("totalEventos").textContent = eventos.length;
}

function crearFilaEvento(evento) {
    const fila = document.createElement("li");
    const informacion = document.createElement("div");
    informacion.className = "informacion";

    const titulo = document.createElement("strong");
    titulo.textContent = evento.nombre;

    let lugar = evento.lugar;

    if (!lugar) {
        lugar = "Lugar sin indicar";
    }

    const fechaEvento = document.createElement("small");
    fechaEvento.textContent = formatoFecha(evento.fecha) + " · " + lugar;

    informacion.appendChild(titulo);
    informacion.appendChild(fechaEvento);

    if (evento.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.textContent = evento.descripcion;
        informacion.appendChild(descripcion);
    }

    fila.appendChild(informacion);
    return fila;
}

// ALMACENAMIENTO

function cargarEventos() {
    try {
        const texto = localStorage.getItem("eventos");
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

            if (dato.lugar !== undefined && typeof dato.lugar !== "string") {
                throw new Error("Lugar incorrecto");
            }

            if (dato.descripcion !== undefined && typeof dato.descripcion !== "string") {
                throw new Error("Descripción incorrecta");
            }
        }

        return lista;
    } catch (error) {
        datosDisponibles = false;
        mostrarAviso("No se pueden leer los datos de eventos. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
}

function guardarEventos(nuevosDatos) {
    if (!datosDisponibles) {
        mostrarAviso("Primero debes revisar los datos de eventos en el almacenamiento del navegador.");
        return false;
    }

    try {
        localStorage.setItem("eventos", JSON.stringify(nuevosDatos));
        eventos = nuevosDatos;
        document.getElementById("mensaje").hidden = true;
        return true;
    } catch (error) {
        mostrarAviso("No se han guardado los cambios. Comprueba el espacio y los permisos del navegador.");
        return false;
    }
}

function nuevoIdEvento() {
    let id = Date.now();

    eventos.forEach(function (dato) {
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

mostrarEventos();
