import React from 'react';
import '../css/Site.css'

const LoadSpinner = (prop) => {
    return (
        <div className="overlay">
            <div className="cv-spinner spinner_principal"></div>
            <div className="cv-spinner spinner_secondary">
                <div className="text-light" id="btnMessageSpinner">{prop.Mensaje}</div>
            </div>
            <div className="cv-spinner spinner_secondary">
                <div className="spinner-grow text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    );
}

export default LoadSpinner;