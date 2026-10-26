
/* CLASE GASTO */

class Gasto {
    constructor(id, nombre, cantidad, categoria, fecha) {
        this.id = id;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.categoria = categoria;
        this.fecha = fecha;
    }
}


/* GESTOR DE GASTOS */

class GestorGastos {
    constructor() {
        this.gastos = JSON.parse(localStorage.getItem("gastos")) || [];
    }

    agregarGasto(gasto) {
        this.gastos.push(gasto);
        this.guardarGastos();
    }

    guardarGastos() {
        localStorage.setItem("gastos", JSON.stringify(this.gastos));
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.guardarGastos();
    }

    editarGasto(id, nombre, cantidad, categoria, fecha) {
        let gasto = this.gastos.find(gasto => gasto.id === id);

        if (gasto) {
            gasto.nombre = nombre;
            gasto.cantidad = cantidad;
            gasto.categoria = categoria;
            gasto.fecha = fecha;

            this.guardarGastos();
        }
    }
}


/* CREAR GESTOR */

const gestorGastos = new GestorGastos();


/* VALIDAR GASTO */

function validarGasto(nombre, cantidad, categoria, fecha) {

    if (nombre.trim() === "") {
        alert("El nombre del gasto es obligatorio");
        return false;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("La cantidad debe ser mayor que 0");
        return false;
    }

    if (categoria === "") {
        alert("Selecciona una categoría");
        return false;
    }

    if (fecha === "") {
        alert("Selecciona una fecha");
        return false;
    }

    return true;
}


/* CREAR GASTO */

const formularioGasto = document.getElementById("formularioGasto");

formularioGasto.addEventListener("submit", function(evento) {

    evento.preventDefault();

    let nombre = document.getElementById("nombreGasto").value;
    let cantidad = Number(document.getElementById("cantidadGasto").value);
    let categoria = document.getElementById("categoriaGasto").value;
    let fecha = document.getElementById("fechaGasto").value;

    if (validarGasto(nombre, cantidad, categoria, fecha)) {

        let gasto = new Gasto(
            Date.now(),
            nombre.trim(),
            cantidad,
            categoria,
            fecha
        );

        gestorGastos.agregarGasto(gasto);

        mostrarGastos();

        formularioGasto.reset();
    }
});


/* MOSTRAR GASTOS */

function mostrarGastos() {

    const listaGastos = document.getElementById("listaGastos");

    listaGastos.innerHTML = "";

    gestorGastos.gastos.forEach(function(gasto) {

        let li = document.createElement("li");

        li.textContent = gasto.nombre + " - " +
            Number(gasto.cantidad).toFixed(2) + " € - " +
            gasto.categoria + " - " +
            gasto.fecha;

        /* BOTON ELIMINAR */

        let botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", function() {

            gestorGastos.eliminarGasto(gasto.id);

            mostrarGastos();
        });

        /* BOTON EDITAR */

        let botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";

        botonEditar.addEventListener("click", function() {

            let nuevoNombre = prompt("Nombre del gasto:", gasto.nombre);

            if (nuevoNombre === null) {
                return;
            }

            let nuevaCantidad = prompt("Cantidad:", gasto.cantidad);

            if (nuevaCantidad === null) {
                return;
            }

            let nuevaCategoria = prompt("Categoría:", gasto.categoria);

            if (nuevaCategoria === null) {
                return;
            }

            let nuevaFecha = prompt("Fecha (AAAA-MM-DD):", gasto.fecha);

            if (nuevaFecha === null) {
                return;
            }

            let cantidadNumero = Number(nuevaCantidad);

            if (validarGasto(
                nuevoNombre,
                cantidadNumero,
                nuevaCategoria,
                nuevaFecha
            )) {

                gestorGastos.editarGasto(
                    gasto.id,
                    nuevoNombre.trim(),
                    cantidadNumero,
                    nuevaCategoria,
                    nuevaFecha
                );

                mostrarGastos();
            }
        });

        li.appendChild(botonEliminar);
        li.appendChild(botonEditar);

        listaGastos.appendChild(li);
    });
}


/* MOSTRAR GASTOS AL CARGAR LA PAGINA */

mostrarGastos();


/* MOSTRAR Y OCULTAR FORMULARIO */

const botonNuevoGasto = document.getElementById("botonNuevoGasto");
const seccionFormularioGasto = document.getElementById("seccionFormularioGasto");

botonNuevoGasto.addEventListener("click", function() {
    seccionFormularioGasto.hidden = !seccionFormularioGasto.hidden;
});


/* CALCULAR ESTADISTICAS */

function contarGastos() {

    let total = 0;
    let totalMes = 0;

    let hoy = new Date();
    let mesActual = hoy.getMonth() + 1;
    let anioActual = hoy.getFullYear();

    gestorGastos.gastos.forEach(function(gasto) {

        let cantidad = Number(gasto.cantidad);
        total += cantidad;

        let partesFecha = gasto.fecha.split("-");
        let anio = Number(partesFecha[0]);
        let mes = Number(partesFecha[1]);

        if (mes === mesActual && anio === anioActual) {
            totalMes += cantidad;
        }
    });

    document.getElementById("totalGastado").textContent =
        total.toFixed(2) + " €";

    document.getElementById("gastosEsteMes").textContent =
        totalMes.toFixed(2) + " €";

    document.getElementById("numeroGastos").textContent =
        gestorGastos.gastos.length;
}


/* MOSTRAR GASTOS POR CATEGORIA */

function mostrarCategoriasGastos() {

    const lista = document.getElementById("listaCategoriasGastos");

    lista.innerHTML = "";

    let categorias = {
        "Alimentación": 0,
        "Transporte": 0,
        "Ocio": 0,
        "Hogar": 0,
        "Otros": 0
    };

    gestorGastos.gastos.forEach(function(gasto) {

        if (categorias[gasto.categoria] !== undefined) {
            categorias[gasto.categoria] += Number(gasto.cantidad);
        }
    });

    for (let categoria in categorias) {

        let li = document.createElement("li");

        let nombre = document.createElement("span");
        nombre.textContent = categoria;

        let cantidad = document.createElement("strong");
        cantidad.textContent = categorias[categoria].toFixed(2) + " €";

        li.appendChild(nombre);
        li.appendChild(cantidad);

        lista.appendChild(li);
    }
}


/* ACTUALIZAR RESUMEN DESPUES DE CADA CAMBIO */

const mostrarGastosOriginal = mostrarGastos;

mostrarGastos = function() {
    mostrarGastosOriginal();
    contarGastos();
    mostrarCategoriasGastos();
};

mostrarGastos();

