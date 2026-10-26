const categorias = ["Alimentación", "Transporte", "Ocio", "Hogar", "Otros"];

// DATOS Y ELEMENTOS DE LA PÁGINA

let datosDisponibles = true;
let gastos = cargarGastos();
let idEdicion = null;

const formulario = document.getElementById("formularioGasto");
const seccion = document.getElementById("seccionFormularioGasto");
const botonNuevo = document.getElementById("botonNuevoGasto");
const nombre = document.getElementById("nombreGasto");
const cantidad = document.getElementById("cantidadGasto");
const categoria = document.getElementById("categoriaGasto");
const fecha = document.getElementById("fechaGasto");

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
    document.getElementById("tituloFormulario").textContent = "Nuevo gasto";
    abrirFormulario();
});

document.getElementById("cancelarGasto").addEventListener("click", cerrarFormulario);
formulario.addEventListener("submit", guardarGasto);

// EDITAR Y ELIMINAR

function editarGasto(gasto) {
    idEdicion = gasto.id;
    nombre.value = gasto.nombre;
    cantidad.value = gasto.cantidad;
    categoria.value = gasto.categoria;
    fecha.value = gasto.fecha;
    document.getElementById("tituloFormulario").textContent = "Editar gasto";
    abrirFormulario();
}

function eliminarGasto(gasto) {
    const confirmado = confirm('¿Eliminar el gasto "' + gasto.nombre + '"?');

    if (!confirmado) {
        return;
    }

    const nuevosDatos = gastos.filter(function (dato) {
        return dato.id !== gasto.id;
    });

    if (guardarGastos(nuevosDatos)) {
        if (idEdicion === gasto.id) {
            cerrarFormulario();
        }

        mostrarGastos();
    }
}

// GUARDAR EL FORMULARIO: CREACIÓN O EDICIÓN

function guardarGasto(eventoFormulario) {
    eventoFormulario.preventDefault();
    const importe = Number(cantidad.value);
    const centimos = Math.round(importe * 100);


    const cantidadCorrecta = Number.isFinite(importe) && importe > 0 && importe <= 999999999.99;
    const decimalesCorrectos = Math.abs(importe * 100 - centimos) <= 0.0001;
    const categoriaCorrecta = categorias.indexOf(categoria.value) !== -1;

    if (nombre.value.trim() === "" || !fechaValida(fecha.value) || !cantidadCorrecta || !decimalesCorrectos || !categoriaCorrecta) {
        mostrarAviso("Revisa el concepto, la fecha, la categoría y el importe (positivo y con un máximo de dos decimales).");
        return;
    }

    let id = idEdicion;

    if (id === null) {
        id = nuevoIdGasto();
    }

    const gasto = {
        id: id,
        nombre: nombre.value.trim(),
        cantidad: centimos / 100,
        categoria: categoria.value,
        fecha: fecha.value
    };

    const nuevosDatos = gastos.slice();

    if (idEdicion === null) {
        nuevosDatos.push(gasto);
    } else {
        for (let i = 0; i < nuevosDatos.length; i++) {
            if (nuevosDatos[i].id === idEdicion) {
                nuevosDatos[i] = gasto;
                break;
            }
        }
    }

    if (guardarGastos(nuevosDatos)) {
        cerrarFormulario();
        mostrarGastos();
    }
}

// MOSTRAR LOS GASTOS

function mostrarGastos() {
    const lista = document.getElementById("listaGastos");
    lista.innerHTML = "";
    const ordenados = gastos.slice();

    ordenados.sort(function (a, b) {
        if (a.fecha < b.fecha) {
            return -1;
        }

        if (a.fecha > b.fecha) {
            return 1;
        }

        return 0;
    });

    ordenados.forEach(function (gasto) {
        const fila = document.createElement("li");
        const informacion = document.createElement("div");
        informacion.className = "informacion";

        const titulo = document.createElement("strong");
        titulo.textContent = gasto.nombre;

        const fechaGasto = document.createElement("small");
        fechaGasto.textContent = formatoFecha(gasto.fecha) + " · " + gasto.categoria;

        const importe = document.createElement("strong");
        importe.className = "importe";
        importe.textContent = mostrarEuros(Math.round(gasto.cantidad * 100) / 100);

        informacion.appendChild(titulo);
        informacion.appendChild(fechaGasto);
        fila.appendChild(informacion);
        fila.appendChild(importe);

        const acciones = document.createElement("div");
        acciones.className = "acciones";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "secundario";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", function () {
            editarGasto(gasto);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "borrar";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function () {
            eliminarGasto(gasto);
        });

        acciones.appendChild(botonEditar);
        acciones.appendChild(botonEliminar);
        fila.appendChild(acciones);
        lista.appendChild(fila);
    });

    if (lista.children.length === 0) {
        const aviso = document.createElement("li");
        aviso.className = "vacio";
        aviso.textContent = "No hay gastos guardados.";
        lista.appendChild(aviso);
    }

    contarGastos();
    mostrarCategoriasGastos();
}

// TOTALES Y CATEGORÍAS

function contarGastos() {
    let total = 0;
    let totalMes = 0;
    const mesActual = fechaHoy().substring(0, 7);

    gastos.forEach(function (gasto) {
        const centimos = Math.round(gasto.cantidad * 100);
        total += centimos;

        if (gasto.fecha.substring(0, 7) === mesActual) {
            totalMes += centimos;
        }
    });

    document.getElementById("totalGastado").textContent = mostrarEuros(total / 100);
    document.getElementById("gastosEsteMes").textContent = mostrarEuros(totalMes / 100);
    document.getElementById("numeroGastos").textContent = gastos.length;
}

function mostrarCategoriasGastos() {
    const lista = document.getElementById("listaCategoriasGastos");
    lista.innerHTML = "";

    categorias.forEach(function (categoria) {
        let total = 0;

        gastos.forEach(function (gasto) {
            if (gasto.categoria === categoria) {
                total += Math.round(gasto.cantidad * 100);
            }
        });

        const fila = document.createElement("li");
        const nombreCategoria = document.createElement("span");
        nombreCategoria.textContent = categoria;

        const importe = document.createElement("strong");
        importe.textContent = mostrarEuros(total / 100);

        fila.appendChild(nombreCategoria);
        fila.appendChild(importe);
        lista.appendChild(fila);
    });
}

function mostrarEuros(cantidad) {
    return cantidad.toFixed(2).replace(".", ",") + " €";
}

// ALMACENAMIENTO

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
        datosDisponibles = false;
        mostrarAviso("No se pueden leer los datos de gastos. Se conservan sin sobrescribir. Revisa el almacenamiento del navegador.");
        return [];
    }
}

function guardarGastos(nuevosDatos) {
    if (!datosDisponibles) {
        mostrarAviso("Primero debes revisar los datos de gastos en el almacenamiento del navegador.");
        return false;
    }

    try {
        localStorage.setItem("gastos", JSON.stringify(nuevosDatos));
        gastos = nuevosDatos;
        document.getElementById("mensaje").hidden = true;
        return true;
    } catch (error) {
        mostrarAviso("No se han guardado los cambios. Comprueba el espacio y los permisos del navegador.");
        return false;
    }
}

function nuevoIdGasto() {
    let id = Date.now();

    gastos.forEach(function (dato) {
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

mostrarGastos();
