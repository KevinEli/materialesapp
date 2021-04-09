import React, { useState, useEffect } from 'react';
import { fireDefault as firebase } from "../../firebase";
import DataTable from 'react-data-table-component';
import { Button, Container, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBars, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import FilterComponent from '../../components/InputBusquedaDT';
import LoadSpinner from '../../components/LoadSpinner';
import { paginationOptions, paginationPerPage, paginationRowsPerPageOptions, fixedHeaderScrollHeight }
    from '../../components/DataTableConfig';
import ToastMessage from '../../components/ToastMessage';


const Product = () => {

    const encabezadoProducto = {
        Id: 0,
        Codigo_Producto: '',
        Cantidad_Existencia: 0,
        Nombre_Producto: '',
        Descripcion_Producto: '',
        Precio: 0
    };

    const [dataProducto, setDataProducto] = useState([encabezadoProducto]);
    const [dataShowProducto, setDataShowProducto] = useState([encabezadoProducto]);
    const [dataProductoForm, setDataProductoForm] = useState(encabezadoProducto);
    const [modalMostrar, setModalMostrar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [editar, setEditar] = useState(false);
    const [loading, setLoading] = useState(false);
    const mensajeVacio = { show: false, icon: "white", title: "", message: "", position: "10%" }
    const [mensaje, setMensaje] = useState(mensajeVacio);

    const closeMensaje = () => { setTimeout(() => { setMensaje(mensajeVacio) }, 3000); };

    const accionesProducto = (row, accion) => {

        if (accion) {
            switch (accion) {
                case "ver":
                    setDataShowProducto(row);
                    abrirCerrarModalMostrar();
                    break;
                case "editar":
                    setDataProductoForm(row);
                    setEditar(true);
                    setModalInsertar(!modalInsertar);
                    break;
                case "eliminar":
                    eliminarProducto(row);
                    break;
                default:
                    break;
            }
        }
    }

    const columns = [
        {
            name: 'Cód Producto',
            selector: 'Codigo_Producto',
            sortable: true
        },
        {
            name: 'Existencia',
            selector: 'Cantidad_Existencia',
            sortable: true,
            left: true,
        },
        {
            name: 'Nombre Producto',
            selector: 'Nombre_Producto',
            sortable: true,
            width: '200px',
            left: true,
        },
        {
            name: 'Descripción Producto',
            selector: 'Descripcion_Producto',
            sortable: true,
            width: '300px',
            left: true,
        },
        {
            name: 'Ver',
            button: true,
            cell: (row) => <Button className="btn btn-primary" onClick={() => accionesProducto(row, "ver")}><FontAwesomeIcon icon={faBars} /></Button>
        },
        {
            name: 'Editar',
            button: true,
            cell: (row) => <Button className="btn btn-success" onClick={() => accionesProducto(row, "editar")}><FontAwesomeIcon icon={faPen} /></Button>
        },
        {
            name: 'Eliminar',
            button: true,
            cell: (row) => <Button className="btn btn-danger" onClick={() => accionesProducto(row, "eliminar")}><FontAwesomeIcon icon={faTrash} /></Button>
        },
    ];

    const abrirCerrarModalMostrar = () => { setModalMostrar(!modalMostrar); };
    const abrirCerrarModalInsertar = () => {
        setEditar(false);
        setDataProductoForm(encabezadoProducto);
        setModalInsertar(!modalInsertar);
    };

    //Funciones y Hooks para el campo de Filtro
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const filteredItems = (filterText === '') ? dataProducto : dataProducto.filter(item => (item.Codigo_Producto && item.Codigo_Producto.toString().toLowerCase().includes(filterText.toLowerCase())));

    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };
        return <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} placeholder={"Cód. Producto"} />;
    }, [filterText, resetPaginationToggle]);


    //Funciones Handle
    const handleFormProductoChange = event => {
        const { name, value } = event.target;
        setDataProductoForm({ ...dataProductoForm, [name]: value });
    };

    //Funciones del CRUD
    const obtenerProductos = () => {
        setLoading(true);
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
            setTimeout(() => { setLoading(false) }, 200);

        });
    };

    const guardarProducto = () => {
        if (!dataProductoForm.Codigo_Producto || !dataProductoForm.Nombre_Producto) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina un código y un nombre para el producto", position: "10%" });
            closeMensaje();
            return;
        }
        firebase.child("producto").push(dataProductoForm,
            error => {
                if (error) {
                    setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando el registro", position: "10%" });
                    closeMensaje();
                }
            });

        abrirCerrarModalInsertar();
    };

    const actualizarProducto = () => {

        if (!validacionForm()) return;

        firebase.child(`producto/${dataProductoForm.Id}`).set(
            dataProductoForm,
            error => {
                if (error) {
                    setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la actualización", position: "10%" });
                    closeMensaje();
                }
            });

        abrirCerrarModalInsertar();
    };

    const validacionForm = () => {
        if (!dataProductoForm.Id) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "No es posible actualizar el producto, Id no encontrado", position: "10%" });
            closeMensaje();
            return false;
        }
        if (!dataProductoForm.Codigo_Producto || !dataProductoForm.Nombre_Producto) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina un código y un nombre para el producto", position: "10%" });
            closeMensaje();
            return false;
        }
        if (!dataProductoForm.Precio) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina precio del producto", position: "10%" });
            closeMensaje();
            return false;
        }
        if (dataProductoForm.Precio <= 0) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "El precio del producto debe ser mayor a cero", position: "10%" });
            closeMensaje();
            return false;
        }
        if (!dataProductoForm.Cantidad_Existencia) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina la cantidad del producto", position: "10%" });
            closeMensaje();
            return false;
        }
        if (dataProductoForm.Cantidad_Existencia <= 0) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "la cantidad del producto debe ser mayor a cero", position: "10%" });
            closeMensaje();
            return false;
        }

        return true;
    }

    const eliminarProducto = (row) => {
        if (window.confirm(`Estás seguro que deseas eliminar el producto ${row && row.Codigo_Producto}?`)) {
            firebase.child(`producto/${row.Id}`).remove(
                error => {
                    if (error) {
                        setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la eliminación", position: "10%" });
                        closeMensaje();
                    }
                });
        }
    }

    useEffect(() => {
        obtenerProductos();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div>
            {loading ? <LoadSpinner Mensaje="Cargando, Por Favor Espere" /> : ""}
            <ToastMessage message={mensaje.message} title={mensaje.title} show={mensaje.show} icon={mensaje.icon} position={mensaje.position} />
            <Container>
                <div className="">
                    <h3 className="text-primary">Lista de Productos</h3>
                    <hr></hr>
                    <button className="btn btn-success mt-3" onClick={() => abrirCerrarModalInsertar()}><FontAwesomeIcon icon={faPlus} /> Registrar</button>
                </div>
                <div className="table-responsive">
                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        pagination
                        paginationResetDefaultPage={resetPaginationToggle}
                        subHeader
                        subHeaderComponent={subHeaderComponentMemo}
                        persistTableHeadpaginationComponentOptions={paginationOptions}
                        fixedHeader
                        fixedHeaderScrollHeight={fixedHeaderScrollHeight}
                        noHeader={true}
                        paginationPerPage={paginationPerPage}
                        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
                        noDataComponent={paginationOptions.noDataComponent}
                    />
                </div>
                <Modal isOpen={modalMostrar} className="modal-dialog modal-lg">
                    <ModalHeader>
                        Producto N° {dataShowProducto && dataShowProducto.Codigo_Producto}
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive">
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
                                    <tr>
                                        <td>{dataShowProducto.Codigo_Producto}</td>
                                        <td>{dataShowProducto.Nombre_Producto}</td>
                                        <td>{dataShowProducto.Descripcion_Producto}</td>
                                        <td>{dataShowProducto.Cantidad_Existencia}</td>
                                        <td>{dataShowProducto.Precio}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-secondary" onClick={() => abrirCerrarModalMostrar()}>Cerrar</button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={modalInsertar}>
                    <ModalHeader>{!editar ? "Insertar" : "Actualizar"} Producto</ModalHeader>
                    <ModalBody>
                        <div className="form-group">
                            <label>Código Producto: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Codigo_Producto" value={dataProductoForm && dataProductoForm.Codigo_Producto} onChange={handleFormProductoChange} />
                            <br />
                            <label>Nombre del Producto: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Nombre_Producto" value={dataProductoForm && dataProductoForm.Nombre_Producto} onChange={handleFormProductoChange} />
                            <br />
                            <label>Descripción del Producto: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Descripcion_Producto" value={dataProductoForm && dataProductoForm.Descripcion_Producto} onChange={handleFormProductoChange} />
                            <br />
                            <label>Cantidad de Existencia: </label>
                            <br />
                            <input type="number" className="form-control" autoComplete="off" name="Cantidad_Existencia" value={dataProductoForm && dataProductoForm.Cantidad_Existencia} onChange={handleFormProductoChange} />
                            <label>Precio: </label>
                            <br />
                            <input type="number" className="form-control" autoComplete="off" name="Precio" value={dataProductoForm && dataProductoForm.Precio} onChange={handleFormProductoChange} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-primary" onClick={() => !editar ? guardarProducto() : actualizarProducto()}>{!editar ? "Guardar" : "Actualizar"}</button>{"   "}
                        <button className="btn btn-danger" onClick={() => abrirCerrarModalInsertar()}>Cancelar</button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
}


export default Product;