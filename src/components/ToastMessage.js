import React, { useState, useEffect } from 'react';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';

const ToastMessage = (props) => {
    const [show, setShow] = useState(false);
    const toggle = () => setShow(!show);
    useEffect(() => {
        setShow(props.show);
    }, [props]);// eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <Toast isOpen={show} style={{ "position": "absolute", "top": props.position, "right": "0", "zIndex": "1060"}}>
                <ToastHeader toggle={toggle} icon={props.icon}>{props.title}</ToastHeader>
                <ToastBody>
                    {props.message}
                </ToastBody>
            </Toast>
        </div>
    );
}

export default ToastMessage;