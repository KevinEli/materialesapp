import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { fireDefault as firebase } from "../../firebase";
import DataTable from 'react-data-table-component';
import { Button, Tooltip, Modal, ModalHeader, ModalBody, ModalFooter, Container } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons'
import { paginationOptions, paginationPerPage, paginationRowsPerPageOptions, fixedHeaderScrollHeight }
    from '../../components/DataTableConfig';
import LoadSpinner from '../../components/LoadSpinner';
import ToastMessage from '../../components/ToastMessage';



const OrderEdit = (prop) => {

    const history = useHistory();
    const getId = prop.match.params.id;

    /* HOOKS */
    const [loading, setLoading] = useState(false);
    const [mensajePanelCargar, setMensajePanelCargar] = useState("");
    const [modalMostrar, setModalMostrar] = useState(false);
    const [modalMostrarCliente, setModalMostrarCliente] = useState(false);
    const mensajeVacio = { show: false, icon: "white", title: "", message: "", position: "10%" }
    const [mensaje, setMensaje] = useState(mensajeVacio);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggle = () => setTooltipOpen(!tooltipOpen);
    const closeMensaje = () => { setTimeout(() => { setMensaje(mensajeVacio) }, 3000); };

    const formEncabezadoOrden = {
        Id: 0,
        Numero_Orden: '',
        Fecha_Orden: '',
        Cliente_Id: 0,
        Nombre_Cliente: '',
        Estado_Orden: 'registrada',
        Total_Orden: 0,
        Detalle: {}
    };

    const formDetalleOrden = {
        Id: 0,
        Detalle_Id: 0,
        Codigo_Producto: '',
        Nombre_Producto: 0,
        Cantidad: '',
        Precio: 0,
        Monto: 0
    };

    const encabezadoProducto = {
        Id: 0,
        Codigo_Producto: '',
        Cantidad_Existencia: 0,
        Nombre_Producto: '',
        Descripcion_Producto: '',
        Precio: 0
    };

    const clienteInit = {
        Id: 0,
        Nombre_Cliente: '',
        Direccion_Cliente: '',
        Telefono_Cliente: ''
    };

    // Hooks Principales  Encabezado y Detalle
    const [ordenEncabezado, setOrdenEncabezado] = useState([formEncabezadoOrden]);

    const [ordenDetalle, setOrdenDetalle] = useState([]);


    // Hook para controlar los eventos de registro de detalle en el grid
    const [detalle, setDetalle] = useState([formDetalleOrden]);

    const [dataProducto, setDataProducto] = useState([encabezadoProducto]);

    const [dataCliente, setDataCliente] = useState([clienteInit]);
    /* FIN HOOKS */



    /* Eventos Handle o onChanged de controles */

    const handleInputChange = event => {
        const { name, value } = event.target;
        setOrdenEncabezado({ ...ordenEncabezado, [name]: value });
    };

    const handleInputDetalleChange = event => {
        const { name, value } = event.target;
        setDetalle({ ...detalle, [name]: value });
    };

    const listSelection = () => {

        if (!detalle.Nombre_Producto || !detalle.Codigo_Producto) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "Defina el nombre y código del producto que desea agregar", position: "50%" });
            closeMensaje();
            return;
        }

        if (!detalle.Cantidad) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "Defina la cantidad del producto", position: "50%" });
            closeMensaje();
            return;
        }

        if (!detalle.Detalle_Id) {
            if (ordenDetalle.length > 0) {
                var maxIndex = Math.max(...ordenDetalle.map(item => item.Detalle_Id));
                detalle.Detalle_Id = maxIndex + 1;
            }
            else {
                detalle.Detalle_Id = 1;
            }

        }
        detalle.Monto = detalle.Precio * detalle.Cantidad;

        if (ordenDetalle.filter(index => index.Id === detalle.Id).length > 0) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "El producto ya se encuentra en el detalle", position: "50%" });
            closeMensaje();
            return;
        }

        setOrdenDetalle(
            ordenDetalle.includes(detalle)
                ? ordenDetalle.filter(index => index !== detalle)
                : [...ordenDetalle, detalle]
        );
        setDetalle([formDetalleOrden]);
    }

    /* Fin de Eventos Handle o onChanged de controles */



    /* Acciones Detalles(Grid, Botones, Eventos) */

    const columns = [
        {
            name: 'Detalle Id',
            selector: 'Detalle_Id',
            sortable: true,
            width: '150px'
        },
        {
            name: 'Codigo Producto',
            selector: 'Codigo_Producto',
            sortable: true,
            left: true,
            width: '150px'
        },
        {
            name: 'Nombre Producto',
            selector: 'Nombre_Producto',
            sortable: true,
            left: true,
            width: '300px'
        },
        {
            name: 'Cantidad',
            selector: 'Cantidad',
            sortable: true,
            right: true,
            width: '100px'
        },
        {
            name: 'Precio Unitario',
            selector: 'Precio',
            sortable: true,
            right: true,
            width: '100px'
        },
        {
            name: 'Monto Total',
            selector: 'Monto',
            sortable: true,
            right: true,
            width: '150px'
        },
        {
            name: 'Eliminar',
            button: true,
            cell: (row) => <Button className="btn btn-danger" onClick={() => eliminarDetalleOrden(row, "Eliminar")}><FontAwesomeIcon icon={faTrash} /></Button>
        }
    ];


    const abrirCerrarModalMostrar = () => { setModalMostrar(!modalMostrar); };
    const abrirCerrarModalMostrarCliente = () => { setModalMostrarCliente(!modalMostrarCliente); };

    const eliminarDetalleOrden = (row) => {
        if (window.confirm(`Estás seguro que deseas eliminar el detalle ${row && row.Detalle_Id}?`)) {
            setOrdenDetalle(ordenDetalle.filter(filtro => filtro.Detalle_Id !== row.Detalle_Id));
        }

    }
    /* Fin Acciones Detalles(Grid, Botones, Eventos) */



    /* Acciones Encabezado(Botones, Eventos) */

    const updateOrder = (e) => {
        e.preventDefault();

        if (!ordenEncabezado.Numero_Orden) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "Defina el número de la orden", position: "10%" });
            closeMensaje();
            return;
        }
        if (!ordenEncabezado.Nombre_Cliente) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "Defina el nombre del cliente", position: "10%" });
            closeMensaje();
            return;
        }

        if (ordenDetalle.length === 0) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "Defina al menos un producto detalle", position: "10%" });
            closeMensaje();
            return;
        }

        ordenEncabezado.Detalle = ordenDetalle;
        var sumaOrden = 0;
        for (var i = 0; i < ordenDetalle.length; i++) {
            sumaOrden += ordenDetalle[i].Monto;
        }
        ordenEncabezado.Total_Orden = sumaOrden;
        var dateorden = new Date();
        ordenEncabezado.Fecha_Orden = padLeft(dateorden.getMonth())
            + "/" + padLeft(dateorden.getDay())
            + "/" + padLeft(dateorden.getFullYear());

        setMensajePanelCargar("Procesando Registro, Por Favor Espere");
        setLoading(true);

        if (getId !== "0") {
            firebase.child(`orden/${ordenEncabezado.Id}`).set(
                ordenEncabezado,
                error => {
                    if (error) {
                        setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la actualización", position: "10%" });
                        closeMensaje();
                    }
                    else {
                        setLoading(false);
                        setMensaje({ show: true, icon: "success", title: "Información", message: "Orden Actualizada Correctamente", position: "10%" });
                        closeMensaje();
                        setTimeout(() => history.push('/order'), 1100);
                    }
                });
        }
        else {
            firebase.child("orden").push(ordenEncabezado,
                error => {
                    if (error) {
                        setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando el registro", position: "10%" });
                        closeMensaje();
                    }
                    else {
                        setLoading(false);
                        setMensaje({ show: true, icon: "success", title: "Información", message: "Orden Registrada Correctamente", position: "10%" });
                        closeMensaje();
                        setTimeout(() => history.push('/order'), 1100);
                    }
                });
        }

    };

    const padLeft = (n) => {
        return ("00" + n).slice(-2);
    }

    const agregarProducto = (row) => {

        if (row.Cantidad_Existencia <= 0) {
            setMensaje({ show: true, icon: "warning", title: "Advertencia", message: "El producto no posee existencia", position: "50%" });
            closeMensaje();
            return;
        }

        setDetalle({
            ...detalle,
            'Id': row.Id,
            'Codigo_Producto': row.Codigo_Producto,
            'Nombre_Producto': row.Nombre_Producto,
            'Precio': row.Precio
        });
        abrirCerrarModalMostrar();
    }

    const agregarCliente = (row) => {

        setOrdenEncabezado({
            ...ordenEncabezado,
            'Cliente_Id': row.Id,
            'Nombre_Cliente': row.Nombre_Cliente,
        });
        abrirCerrarModalMostrarCliente();
    }

    const obtenerProductos = () => {
        firebase.child("producto").on("value", (producto) => {
            if (producto.val() !== null) {
                var list = [];

                producto.forEach(function (data) {
                    var item = {
                        Id: data.key,
                        Codigo_Producto: data.val().Codigo_Producto,
                        Cantidad_Existencia: data.val().Cantidad_Existencia,
                        Nombre_Producto: data.val().Nombre_Producto,
                        Descripcion_Producto: data.val().Descripcion_Producto,
                        Precio: data.val().Precio
                    }
                    list.push(item);
                });

                setDataProducto(list);
            } else {
                setDataProducto(encabezadoProducto);
            }

        });
    };

    const obtenerClientes = () => {
        setLoading(true);
        firebase.child("cliente").on("value", (cliente) => {
            if (cliente.val() !== null) {
                var list = [];
                cliente.forEach(function (data) {
                    var item = {
                        Id: data.key,
                        Nombre_Cliente: data.val().Nombre_Cliente,
                        Direccion_Cliente: data.val().Direccion_Cliente
                    }
                    list.push(item);
                });

                setDataCliente(list);
            } else {
                setDataCliente(clienteInit);
            }
        });
    };
    /* FIN Acciones Encabezado(Botones, Eventos) */

    useEffect(() => {

        const obtenerInformacionOrden = () => {
            setLoading(true);
            firebase.child("orden").orderByKey().equalTo(getId).on("value", (orden) => {
                if (orden.val() !== null) {
                    var listDetalle = [];
                    orden.forEach(function (data) {
                        var item = {
                            Id: data.key,
                            Numero_Orden: data.val().Numero_Orden,
                            Fecha_Orden: data.val().Fecha_Orden,
                            Cliente_Id: data.val().Cliente_Id,
                            Nombre_Cliente: data.val().Nombre_Cliente,
                            Estado_Orden: data.val().Estado_Orden,
                            Total_Orden: data.val().Total_Orden,
                        }

                        data.val().Detalle.forEach(function (det) {
                            var itemDetalle = {
                                Id: det.Id,
                                Detalle_Id: det.Detalle_Id,
                                Codigo_Producto: det.Codigo_Producto,
                                Nombre_Producto: det.Nombre_Producto,
                                Monto: det.Monto,
                                Cantidad: det.Cantidad,
                                Precio: det.Precio
                            }
                            listDetalle.push(itemDetalle);
                        });
                        setOrdenDetalle(listDetalle);
                        setOrdenEncabezado(item);
                    });
                } else {
                    setOrdenEncabezado(formEncabezadoOrden);
                }
                setTimeout(() => { setLoading(false) }, 200);
            });
        };

        obtenerInformacionOrden();
        obtenerProductos();
        obtenerClientes();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps



    return (
        <div>
            {loading ? <LoadSpinner Mensaje={mensajePanelCargar} /> : ""}
            <ToastMessage message={mensaje.message} title={mensaje.title} show={mensaje.show} icon={mensaje.icon} position={mensaje.position} />
            <Container>
                <div className="">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item text-primary"><a href="/#" onClick={ev => { ev.preventDefault(); history.push(`/order`) }} style={{ "cursor": "pointer" }}>Ordenes</a></li>
                            <li className="breadcrumb-item active" aria-current="page">Registro o Actualización de Ordenes</li>
                        </ol>
                    </nav>
                    <h4 className="text-primary">Registro o Actualización de Ordenes</h4>
                </div>
                <form>
                    <div className="row">
                        <div className="col-sm mb-1">
                            <Button variant="primary" type="submit" className="btn-primary_override float-right" onClick={updateOrder}>
                                <FontAwesomeIcon icon={faPlusCircle} /> {getId === "0" ? "Guardar" : "Actualizar"}
                            </Button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm mb-1">
                            <label>Número de la Orden</label>
                            <input type="text" className="form-control" autoComplete="off" name="Numero_Orden" value={ordenEncabezado.Numero_Orden || ""} onChange={handleInputChange} />
                        </div>
                        <div className="col-sm mb-1">
                            <label htmlFor="inputState">Estado Orden</label>
                            <select id="inputState" className="form-control" name="Estado_Orden" value={ordenEncabezado.Estado_Orden || ""} onChange={handleInputChange}>
                                <option value="Registrada">Registrada</option>
                                <option value="Aprobada">Aprobada</option>
                                <option value="Entregada">Entregada</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm mb-3">
                            <label>Nombre del Cliente</label>
                            <input type="hidden" className="form-control" name="Cliente_Id" value={ordenEncabezado.Cliente_Id || ""} onChange={handleInputChange} />
                            <input type="text" className="form-control" autoComplete="off" name="Nombre_Cliente" value={ordenEncabezado.Nombre_Cliente || ""} onChange={handleInputChange} disabled='disabled' />
                        </div>
                        <div className="col-sm-1 mb-3">
                            <Button className="btn-primary_override float-right" onClick={() => abrirCerrarModalMostrarCliente()} style={{ "marginTop": "28px" }}>
                                <FontAwesomeIcon icon={faSearch} />
                            </Button>
                        </div>
                    </div>

                    <fieldset className="form-group fieldset-custom">
                        <div className="row">
                            <legend className="col-form-label col-sm pt-1 text-primary">Detalles de Productos</legend>
                        </div>
                        <div className="row">
                            <div className="col-sm-1 mb-1">
                                <Button className="btn-primary_override float-right" id={"btnSearch"} onClick={() => abrirCerrarModalMostrar()} style={{ "marginTop": "28px" }}>
                                    <FontAwesomeIcon icon={faSearch} />
                                </Button>
                                <Tooltip
                                    placement={"right"}
                                    isOpen={tooltipOpen}
                                    target={"btnSearch"}
                                    toggle={toggle}>
                                    Buscar
                            </Tooltip>
                            </div>
                            <div className="col-sm mb-1">
                                <label htmlFor="codigo_Producto">Código Producto</label>
                                <input id="codigo_Producto" type="text" autoComplete="off" className="form-control" name="Codigo_Producto" value={detalle.Codigo_Producto || ""} onChange={handleInputDetalleChange} disabled='disabled' />
                            </div>
                            <div className="col-sm mb-1">
                                <label htmlFor="nombre_Producto">Nombre Producto</label>
                                <input id="nombre_Producto" type="text" autoComplete="off" className="form-control" name="Nombre_Producto" value={detalle.Nombre_Producto || ""} onChange={handleInputDetalleChange} disabled='disabled' />
                            </div>
                            <div className="col-sm mb-1">
                                <label htmlFor="precio">Precio</label>
                                <input id="precio" type="number" autoComplete="off" className="form-control" name="Precio" value={detalle.Precio || ""} onChange={handleInputDetalleChange} disabled='disabled' />
                            </div>
                            <div className="col-sm mb-1">
                                <label htmlFor="cantidad">Cantidad</label>
                                <input id="cantidad" type="number" autoComplete="off" className="form-control" name="Cantidad" value={detalle.Cantidad || ""} onChange={handleInputDetalleChange} />
                            </div>

                        </div>
                        <div className="form-group float-right mt-2">
                            <Button className="btn btn-success" id={"btnAdd"} onClick={() => listSelection()}>
                                <FontAwesomeIcon icon={faPlusCircle} />
                            </Button>
                            <Tooltip
                                placement={"right"}
                                isOpen={tooltipOpen}
                                target={"btnAdd"}
                                toggle={toggle}>
                                Agregar
                            </Tooltip>
                        </div>
                        <div className="table-responsive">
                            <DataTable
                                columns={columns}
                                data={ordenDetalle}
                                pagination
                                paginationComponentOptions={paginationOptions}
                                fixedHeader
                                fixedHeaderScrollHeight={fixedHeaderScrollHeight}
                                noHeader={true}
                                paginationPerPage={paginationPerPage}
                                paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                                noDataComponent={paginationOptions.noDataComponent}
                            />
                        </div>
                        <Modal isOpen={modalMostrar} className="modal-dialog modal-lg" >
                            <ModalHeader>
                                Productos Registrados
                            </ModalHeader>
                            <ModalBody>
                                <div className="table-responsive detalle-orden">
                                    <table className='table table-striped' aria-labelledby="tabelLabel">
                                        <thead>
                                            <tr>
                                                <th>Código</th>
                                                <th>Nombre</th>
                                                <th>Descripción</th>
                                                <th>Existencia</th>
                                                <th>Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataProducto.map((data, i) =>
                                                <tr key={i}>
                                                    <td>{data.Codigo_Producto}</td>
                                                    <td>{data.Nombre_Producto}</td>
                                                    <td>{data.Descripcion_Producto}</td>
                                                    <td>{data.Cantidad_Existencia}</td>
                                                    <td>{data.Precio}</td>
                                                    <td>
                                                        <button className="btn-primary_override" onClick={() => agregarProducto(data)}> <FontAwesomeIcon icon={faPlusCircle} /></button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <button className="btn btn-secondary" onClick={() => abrirCerrarModalMostrar()}>Cerrar</button>
                            </ModalFooter>
                        </Modal>
                        <Modal isOpen={modalMostrarCliente} className="modal-dialog modal-lg" >
                            <ModalHeader>
                                Clientes Registrados
                            </ModalHeader>
                            <ModalBody>
                                <div className="table-responsive detalle-orden">
                                    <table className='table table-striped' aria-labelledby="tabelLabel">
                                        <thead>
                                            <tr>
                                                <th>Nombre_Cliente</th>
                                                <th>Dirección</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataCliente.map((data, i) =>
                                                <tr key={i}>
                                                    <td>{data.Nombre_Cliente}</td>
                                                    <td>{data.Direccion_Cliente}</td>
                                                    <td>
                                                        <button className="btn-primary_override" onClick={() => agregarCliente(data)}> <FontAwesomeIcon icon={faPlusCircle} /></button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <button className="btn btn-secondary" onClick={() => abrirCerrarModalMostrarCliente()}>Cerrar</button>
                            </ModalFooter>
                        </Modal>
                    </fieldset>
                </form>
            </Container>
        </div>
    );
}

export default OrderEdit;