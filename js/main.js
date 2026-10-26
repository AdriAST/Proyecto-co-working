const categorias = ["Alimentación", "Transporte", "Ocio", "Hogar", "Otros"];

// DATOS DEL RESUMEN

const tareas = cargarTareas();
const eventos = cargarEventos();
const gastos = cargarGastos();

// TAREAS PENDIENTES

function mostrarTareasPendientes() {
    const lista = document.getElementById("tareasPendientes");
    const pendientes = tareas.filter(function (tarea) {
        return !tarea.completada;
    });

    pendientes.sort(function (a, b) {
        if (a.fecha < b.fecha) {
            return -1;
        }

        if (a.fecha > b.fecha) {
            return 1;
        }

        return 0;
    });

    document.getElementById("numeroTareas").textContent = pendientes.length;

    pendientes.slice(0, 5).forEach(function (tarea) {
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
        lista.appendChild(fila);
    });

    if (lista.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No tienes tareas pendientes.";
        lista.appendChild(aviso);
    }
}

// PRÓXIMOS EVENTOS

function mostrarEventosProximos() {
    const lista = document.getElementById("eventosProximos");
    const hoy = fechaHoy();
    const proximos = eventos.filter(function (evento) {
        return evento.fecha >= hoy;
    });

    proximos.sort(function (a, b) {
        if (a.fecha < b.fecha) {
            return -1;
        }

        if (a.fecha > b.fecha) {
            return 1;
        }

        return 0;
    });

    document.getElementById("numeroEventos").textContent = proximos.length;

    proximos.slice(0, 3).forEach(function (evento) {
        lista.appendChild(crearFilaEvento(evento));
    });

    if (lista.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No tienes próximos eventos.";
        lista.appendChild(aviso);
    }
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

// GASTOS DEL MES

function mostrarGastosMes() {
    let total = 0;
    const mesActual = fechaHoy().substring(0, 7);

    gastos.forEach(function (gasto) {
        if (gasto.fecha.substring(0, 7) === mesActual) {
            total += Math.round(gasto.cantidad * 100);
        }
    });

    document.getElementById("gastosMesInicio").textContent = mostrarEuros(total / 100);
}

function mostrarEuros(cantidad) {
    return cantidad.toFixed(2).replace(".", ",") + " €";
}

// PROGRESO

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

// RECUPERAR LOS DATOS

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
        mostrarAviso("No se pueden leer los datos de tareas. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
}

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
        mostrarAviso("No se pueden leer los datos de eventos. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
}

function cargarGastos() {
    try {
        const texto = localStorage.getItem("gastos");
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

            if (!Number.isFinite(dato.cantidad) || dato.cantidad <= 0 || categorias.indexOf(dato.categoria) === -1) {
                throw new Error("Gasto incorrecto");
            }
        }

        return lista;
    } catch (error) {
        mostrarAviso("No se pueden leer los datos de gastos. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
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

document.getElementById("fechaHoy").textContent = formatoFecha(fechaHoy());
mostrarTareasPendientes();
mostrarEventosProximos();
mostrarGastosMes();
mostrarProgreso();
