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


const Client = () => {

    const clienteInit = {
        Id: 0,
        Nombre_Cliente: '',
        Direccion_Cliente: '',
        Telefono_Cliente: ''
    };

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

    const [ordenEncabezado, setOrdenEncabezado] = useState([formEncabezadoOrden]);
    const [dataCliente, setDataCliente] = useState([clienteInit]);
    const [dataShowCliente, setDataShowCliente] = useState([clienteInit]);
    const [dataClienteForm, setDataClienteForm] = useState(clienteInit);
    const [modalMostrar, setModalMostrar] = useState(false);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [editar, setEditar] = useState(false);
    const [loading, setLoading] = useState(false);
    const mensajeVacio = { show: false, icon: "white", title: "", message: "", position: "10%" }
    const [mensaje, setMensaje] = useState(mensajeVacio);

    const closeMensaje = () => { setTimeout(() => { setMensaje(mensajeVacio) }, 3000); };

    const accionesCliente = (row, accion) => {

        if (accion) {
            switch (accion) {
                case "ver":
                    setDataShowCliente(row);
                    obtenerInformacionOrden(row);
                    abrirCerrarModalMostrar();
                    break;
                case "editar":
                    setDataClienteForm(row);
                    setEditar(true);
                    setModalInsertar(!modalInsertar);
                    break;
                case "eliminar":
                    eliminarCliente(row);
                    break;
                default:
                    break;
            }
        }
    }

    const columns = [
        {
            name: 'Nombre Cliente',
            selector: 'Nombre_Cliente',
            sortable: true,
            width: '200px',
            left: true,
        },
        {
            name: 'Dirección Cliente',
            selector: 'Direccion_Cliente',
            sortable: true,
            width: '300px',
            left: true,
        },
        {
            name: 'Teléfono',
            selector: 'Telefono_Cliente',
            sortable: true
        },
        {
            name: 'Ver',
            button: true,
            cell: (row) => <Button className="btn btn-primary" onClick={() => accionesCliente(row, "ver")}><FontAwesomeIcon icon={faBars} /></Button>
        },
        {
            name: 'Editar',
            button: true,
            cell: (row) => <Button className="btn btn-success" onClick={() => accionesCliente(row, "editar")}><FontAwesomeIcon icon={faPen} /></Button>
        },
        {
            name: 'Eliminar',
            button: true,
            cell: (row) => <Button className="btn btn-danger" onClick={() => accionesCliente(row, "eliminar")}><FontAwesomeIcon icon={faTrash} /></Button>
        },
    ];

    const abrirCerrarModalMostrar = () => { setModalMostrar(!modalMostrar); };
    const abrirCerrarModalInsertar = () => {
        setEditar(false);
        setDataClienteForm(clienteInit);
        setModalInsertar(!modalInsertar);
    };

    //Funciones y Hooks para el campo de Filtro
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const filteredItems = (filterText === '') ? dataCliente : dataCliente.filter(item => (item.Nombre_Cliente && item.Nombre_Cliente.toString().toLowerCase().includes(filterText.toLowerCase())));

    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };
        return <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} placeholder={"Nombre Cliente"} />;
    }, [filterText, resetPaginationToggle]);


    //Funciones Handle
    const handleFormClienteChange = event => {
        const { name, value } = event.target;
        setDataClienteForm({ ...dataClienteForm, [name]: value });
    };

    //Funciones del CRUD
    const obtenerClientes = () => {
        setLoading(true);
        firebase.child("cliente").on("value", (cliente) => {
            if (cliente.val() !== null) {
                var list = [];
                cliente.forEach(function (data) {
                    var item = {
                        Id: data.key,
                        Nombre_Cliente: data.val().Nombre_Cliente,
                        Direccion_Cliente: data.val().Direccion_Cliente,
                        Telefono_Cliente: data.val().Telefono_Cliente,
                    }
                    list.push(item);
                });

                setDataCliente(list);
            } else {
                setDataCliente(clienteInit);
            }
            setTimeout(() => { setLoading(false) }, 200);

        });
    };

    const guardarCliente = () => {
        if (!dataClienteForm.Direccion_Cliente || !dataClienteForm.Nombre_Cliente) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina un nombre y una dirección para el cliente", position: "10%" });
            closeMensaje();
            return;
        }
        firebase.child("cliente").push(dataClienteForm,
            error => {
                if (error) {
                    setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando el registro", position: "10%" });
                    closeMensaje();
                }
            });

        abrirCerrarModalInsertar();
    };

    const actualizarCliente = () => {

        if (!validacionForm()) return;

        firebase.child(`cliente/${dataClienteForm.Id}`).set(
            dataClienteForm,
            error => {
                if (error) {
                    setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la actualización", position: "10%" });
                    closeMensaje();
                }
            });

        abrirCerrarModalInsertar();
    };

    const validacionForm = () => {
        if (!dataClienteForm.Id) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "No es posible actualizar el cliente, Id no encontrado", position: "10%" });
            closeMensaje();
            return false;
        }
        if (!dataClienteForm.Direccion_Cliente || !dataClienteForm.Nombre_Cliente) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina un nombre y una dirección para el cliente", position: "10%" });
            closeMensaje();
            return false;
        }

        return true;
    }

    const eliminarCliente = (row) => {
        if (window.confirm(`Estás seguro que deseas eliminar el cliente ${row && row.Nombre_Cliente}?`)) {
            firebase.child(`cliente/${row.Id}`).remove(
                error => {
                    if (error) {
                        setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la eliminación", position: "10%" });
                        closeMensaje();
                    }
                });
        }
    }
    const obtenerInformacionOrden = (row) => {
        setLoading(true);
        firebase.child("orden").orderByChild("Cliente_Id").equalTo(row.Id).on("value", (orden) => {
            if (orden.val() !== null) {
                var list = [];
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
                    list.push(item);
                });
                setOrdenEncabezado(list);
            } else {
                var itemVacio = {
                    Id: '',
                    Numero_Orden: '',
                    Fecha_Orden: '',
                    Cliente_Id: '',
                    Nombre_Cliente: 'Sin Ordenes Creadas',
                    Estado_Orden: '',
                    Total_Orden: '',
                }
                setOrdenEncabezado([itemVacio]);
            }
            setTimeout(() => { setLoading(false) }, 200);
        });
    };

    useEffect(() => {
        obtenerClientes();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div>
            {loading ? <LoadSpinner Mensaje="Cargando, Por Favor Espere" /> : ""}
            <ToastMessage message={mensaje.message} title={mensaje.title} show={mensaje.show} icon={mensaje.icon} position={mensaje.position} />
            <Container>
                <div className="">
                    <h3 className="text-primary">Lista de Clientes</h3>
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
                        Ordenes del Cliente  {dataShowCliente && dataShowCliente.Nombre_Cliente}
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive detalle-orden">
                            <table className='table table-striped' aria-labelledby="tabelLabel">
                                <thead>
                                    <tr>
                                        <th>Número Orden</th>
                                        <th>Fecha Orden</th>
                                        <th>Nombre Cliente</th>
                                        <th>Estado</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordenEncabezado.map((data, i) =>
                                        <tr key={i}>
                                            <td>{data.Numero_Orden}</td>
                                            <td>{data.Fecha_Orden}</td>
                                            <td>{data.Nombre_Cliente}</td>
                                            <td>{data.Estado_Orden}</td>
                                            <td>{data.Total_Orden}</td>
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

                <Modal isOpen={modalInsertar}>
                    <ModalHeader>{!editar ? "Insertar" : "Actualizar"} Cliente</ModalHeader>
                    <ModalBody>
                        <div className="form-group">
                            <label>Nombre del Cliente: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Nombre_Cliente" value={dataClienteForm && dataClienteForm.Nombre_Cliente} onChange={handleFormClienteChange} />
                            <br />
                            <label>Dirección: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Direccion_Cliente" value={dataClienteForm && dataClienteForm.Direccion_Cliente} onChange={handleFormClienteChange} />
                            <br />
                            <label>Teléfono: </label>
                            <br />
                            <input type="text" className="form-control" autoComplete="off" name="Telefono_Cliente" value={dataClienteForm && dataClienteForm.Telefono_Cliente} onChange={handleFormClienteChange} />
                            <br />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-primary" onClick={() => !editar ? guardarCliente() : actualizarCliente()}>{!editar ? "Guardar" : "Actualizar"}</button>{"   "}
                        <button className="btn btn-danger" onClick={() => abrirCerrarModalInsertar()}>Cancelar</button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
}


export default Client;