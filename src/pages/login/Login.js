import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Container } from 'reactstrap';
import { fireAuth as firebaseAuth } from "../../firebase";
import LoadSpinner from '../../components/LoadSpinner';

function Login(props) {

    const userLog = firebaseAuth.currentUser;
    const [form, setForm] = useState({
        Usuario: '',
        Clave: '',
        Mensaje: ''
    });

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    const iniciarSesion = (e) => {
        e.preventDefault();
       
        if (!form.Usuario || !form.Clave) {
            setMensaje("Digite un usuario y una contraseña");
            return;
        }
        setLoading(true);
        firebaseAuth.signInWithEmailAndPassword(form.Usuario, form.Clave)
            .then((userCredential) => {
                setLoading(false);
                props.history.push('/Product');
            })
            .catch(() => {
                setLoading(false);
                setMensaje("Ocurrió un problema consultando las credenciales");
            });
    }

    useEffect(() => {
        if (userLog) {
            props.history.push('/product');
        } 
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {loading ? <LoadSpinner Mensaje="Validando Credenciales de Usuario" /> : ""}
            <Container>
                <Form className="inicioSesion color_special_site">

                    <FormGroup>
                        <Label for="exampleEmail">Usuario</Label>
                        <input
                            type="text"
                            className="form-control"
                            name="Usuario"
                            autoComplete="off"
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="examplePassword">Contraseña</Label>
                        <input
                            type="password"
                            className="form-control"
                            name="Clave"
                            onChange={handleChange} />
                    </FormGroup>

                    <p className="text-white">{mensaje}</p>
                    <br />

                    <Button variant="primary" type="submit" className="btn-primary_override float-right" onClick={iniciarSesion}>
                        Iniciar Sesión
                    </Button>
                  
                </Form>
            </Container>
        </div>
    );
}

export default Login;