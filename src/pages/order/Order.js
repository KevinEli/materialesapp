import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import {fireDefault as firebase} from "../../firebase";
import DataTable from 'react-data-table-component';
import { Button, Container } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import FilterComponent from '../../components/InputBusquedaDT';
import LoadSpinner from '../../components/LoadSpinner';
import { paginationOptions, paginationPerPage, paginationRowsPerPageOptions, fixedHeaderScrollHeight }
    from '../../components/DataTableConfig';
import ToastMessage from '../../components/ToastMessage';


const Order = () => {
    const encabezadoOrden = {
        Id: 0,
        Numero_Orden: '',
        Fecha_Orden: 0,
        Nombre_Cliente: '',
        Estado_Orden: '',
        Total_Orden: 0
    };

    const [dataOrden, setDataOrden] = useState([encabezadoOrden]);
    const [loading, setLoading] = useState(false);
    const mensajeVacio = { show: false, icon: "white", title: "", message: "", position: "10%" }
    const [mensaje, setMensaje] = useState(mensajeVacio);
    const history = useHistory();
    const closeMensaje = () => { setTimeout(() => { setMensaje(mensajeVacio) }, 3000); };

    const accionesOrdenes = (row, accion) => {

        if (accion) {
            switch (accion) {
                case "nuevo":
                    history.push(`/orderEdit/${0}`);
                    break;
                case "editar":
                    history.push(`/orderEdit/${row.Id}`);
                    break;
                case "eliminar":
                    eliminarOrden(row);
                    break;
                default:
                    break;
            }
        }
    }

    const columns = [
        {
            name: 'Número Orden',
            selector: 'Numero_Orden',
            sortable: true
        },
        {
            name: 'Fecha Orden',
            selector: 'Fecha_Orden',
            sortable: true,
            left: true,
        },
        {
            name: 'Nombre Cliente',
            selector: 'Nombre_Cliente',
            sortable: true,
            width: '200px',
            left: true,
        },
        {
            name: 'Estado',
            selector: 'Estado_Orden',
            sortable: true,
            width: '100px',
            left: true,
        },
        {
            name: 'Monto Total',
            selector: 'Total_Orden',
            sortable: true,
            width: '100px',
            right: true,
        },
        {
            name: 'Editar',
            button: true,
            cell: (row) => <Button className="btn btn-success" onClick={() => accionesOrdenes(row, "editar")}><FontAwesomeIcon icon={faPen} /></Button>
        },
        {
            name: 'Eliminar',
            button: true,
            cell: (row) => <Button className="btn btn-danger" onClick={() => accionesOrdenes(row, "eliminar")}><FontAwesomeIcon icon={faTrash} /></Button>
        },
    ];

    //Funciones y Hooks para el campo de Filtro
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const filteredItems = (filterText === '') ? dataOrden : dataOrden.filter(item => (item.Numero_Orden && item.Numero_Orden.toString().toLowerCase().includes(filterText.toLowerCase())));
    
    const subHeaderComponentMemo = React.useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };
        return <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} placeholder={"Núm. Orden"} />;
    }, [filterText, resetPaginationToggle]);

    //Funciones del CRUD
    const obtenerOrdenes = () => {
        setLoading(true);
       firebase.child("orden").on("value", (orden) => {
            if (orden.val() !== null) {
                var list = [];
                
                orden.forEach (function (data) {
                    var item = {
                      Id: data.key,
                      Numero_Orden: data.val ().Numero_Orden,
                      Fecha_Orden: data.val ().Fecha_Orden,
                      Nombre_Cliente: data.val ().Nombre_Cliente,
                      Estado_Orden: data.val ().Estado_Orden,
                      Total_Orden:data.val ().Total_Orden,
                    }
                    list.push (item);
                  });

                setDataOrden(list);
            } else {
                setDataOrden(encabezadoOrden);
            }
            setTimeout(() => { setLoading(false) }, 200);
            
        });
    };

    
    const eliminarOrden = (row) => {
        if (window.confirm(`Estás seguro que deseas eliminar la Orden ${row && row.Numero_Orden}?`)) {
            firebase.child(`orden/${row.Id}`).remove(
                error => {
                    if (error) {
                    setMensaje({ show: true, icon: "danger", title: "Error", message: "Ocurrió un problema procesando la eliminación", position: "10%" });
                    closeMensaje();
                    }
                });
        }
    }

    useEffect(() => {
        obtenerOrdenes();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps


    return (
        <div>
            {loading ? <LoadSpinner Mensaje="Cargando, Por Favor Espere" /> : ""}
            <ToastMessage message={mensaje.message} title={mensaje.title} show={mensaje.show} icon={mensaje.icon} position={mensaje.position} />
            <Container>
                <div className="">
                    <h3 className="text-primary">Lista de Ordenes</h3>
                    <hr></hr>
                    <button className="btn btn-success mt-3" onClick={() => accionesOrdenes(0, "nuevo")}><FontAwesomeIcon icon={faPlus} /> Registrar</button>
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
            </Container>
        </div>
    );
}


export default Order;