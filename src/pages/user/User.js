import React, { useState, useEffect } from 'react';
import { fireAuth as firebaseAuth } from "../../firebase";
import { Container } from "reactstrap";
import { useHistory } from 'react-router-dom';
import LoadSpinner from '../../components/LoadSpinner';
import ToastMessage from '../../components/ToastMessage';

const User = () => {
    const user_init = {
        Id: 0,
        Correo: '',
        Contrasena: '',
        ConfirmaContrasena: '',
        Fecha: ''
    };

    const user_pwd = {
        ActualizaContrasena: ''
    };
    const history = useHistory();
    const userLog = firebaseAuth.currentUser;
    const [dataUserForm, setDataUserForm] = useState(user_init);
    const [dataUserPwd, setDataUserPwd] = useState(user_pwd);
    const [loading, setLoading] = useState(false);
    const mensajeVacio = { show: false, icon: "white", title: "", message: "", position: "10%" }
    const [mensaje, setMensaje] = useState(mensajeVacio);

    const closeMensaje = () => { setTimeout(() => { setMensaje(mensajeVacio) }, 3000); };


    //Funciones Handle
    const handleFormUserChange = event => {
        const { name, value } = event.target;
        setDataUserForm({ ...dataUserForm, [name]: value });
    };
    const handleFormPasswordChange = event => {
        const { name, value } = event.target;
        setDataUserPwd({ ...dataUserPwd, [name]: value });
    };

    //Funciones del CRUD
    const guardarUsuario = () => {
        if (!validacionForm()) return;

        setLoading(true)
        firebaseAuth.createUserWithEmailAndPassword(dataUserForm.Correo, dataUserForm.Contrasena)
            .then(() => {
                setMensaje({ show: true, icon: "success", title: "Información", message: "Registrado Correctamente", position: "10%" });
                closeMensaje();
            })
            .catch((err) => {
                setMensaje({ show: true, icon: "danger", title: "Error", message: `Ocurrió un problema procesando el registro: ${err}`, position: "10%" });
                closeMensaje();
            })

        setLoading(false)
    };

    const actualizaPwdUsuario = () => {
        if (!dataUserPwd.ActualizaContrasena) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina la nueva contraseña", position: "10%" });
            closeMensaje();
            return false;
        }

        setLoading(true)
        userLog.updatePassword(dataUserPwd.ActualizaContrasena)
            .then(() => {
                setMensaje({ show: true, icon: "success", title: "Información", message: "Contraseña Actualizada Correctamente", position: "10%" });
                closeMensaje();
            })
            .catch((err) => {
                setMensaje({ show: true, icon: "danger", title: "Error", message: `Ocurrió un problema procesando la actualización: ${err}`, position: "10%" });
                closeMensaje();
            })

        setLoading(false)
    };

    const validacionForm = () => {

        if (!dataUserForm.Correo || !dataUserForm.Contrasena) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "Por Favor defina un correo y una contraseña", position: "10%" });
            closeMensaje();
            return false;
        }
        if (dataUserForm.Contrasena.length < 6) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "la contraseña debe tener 6 o mas carácteres", position: "10%" });
            closeMensaje();
            return false;
        }

        if (dataUserForm.ConfirmaContrasena !== dataUserForm.Contrasena) {
            setMensaje({ show: true, icon: "danger", title: "Error", message: "la contraseña y la confirmación de contraseña no coinciden", position: "10%" });
            closeMensaje();
            return false;
        }

        return true;
    }

    useEffect(() => {
        if (!userLog) {
            history.push("/");
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {loading ? <LoadSpinner Mensaje="Cargando, Por Favor Espere" /> : ""}
            <ToastMessage message={mensaje.message} title={mensaje.title} show={mensaje.show} icon={mensaje.icon} position={mensaje.position} />
            <Container>
                <div className='row'>
                    <div className='col-lg-7'>
                        <h3 className="text-primary">Registro de Usuarios</h3>
                        <hr></hr>
                        <div className="form-group ">
                            <label>Correo: </label>
                            <br />
                            <input type="email" className="form-control" autoComplete="off" name="Correo" value={dataUserForm && dataUserForm.Correo} onChange={handleFormUserChange} required />
                            <br />
                            <label>Contraseña: </label>
                            <br />
                            <input type="password" className="form-control" autoComplete="off" name="Contrasena" value={dataUserForm && dataUserForm.Contrasena} onChange={handleFormUserChange} />
                            <br />
                            <label>Confirme Contraseña: </label>
                            <br />
                            <input type="password" className="form-control" autoComplete="off" name="ConfirmaContrasena" value={dataUserForm && dataUserForm.ConfirmaContrasena} onChange={handleFormUserChange} />
                            <br />
                        </div>
                        <div className="float-right">
                            <button className="btn btn-primary" type="submit" onClick={guardarUsuario}>Guardar</button>
                        </div>
                    </div>
                    <div className='col-lg'>
                        <h3 className="text-primary">Información Usuarios Actual</h3>
                        <hr></hr>
                        <label>Correo: &nbsp;</label>
                        <label className="text-primary">{(userLog !== null) ? userLog.email : ""}</label>
                        <br />
                        <label>Correo Verificado: &nbsp;</label>
                        <label className="text-primary">{(userLog !== null) ? userLog.emailVerified === true ? "Si" : "No" : ""} </label>
                        <br />
                        <div >
                            <div className="row">
                                <div className="col-md-6">
                                    <label>Actualizar Contraseña: </label>
                                    <br />
                                    <input type="password" className="form-control" autoComplete="off" name="ActualizaContrasena" onChange={handleFormPasswordChange} />
                                    <br />
                                </div>

                                <div className="col-md-6 mt-4 float-right">
                                    <button className="btn btn-primary" onClick={actualizaPwdUsuario}>Guardar</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}


export default User;