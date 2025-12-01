import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center py-3 mt-auto bg-light">
            <div className="container">
                <hr />
                <p className="mb-1 fs-6">
                    Created by <strong>Yuan Heng Chang, MD</strong>
                </p>
                <p className="mb-1 fs-6">
                    GitHub:{' '}
                    <a
                        href="https://github.com/nephrotools/nephrotools"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        nephrotools/nephrotools
                    </a>
                </p>
                <p className="mb-2 fs-6">
                    Last Updated: <strong>11/30/2025</strong>
                </p>
                <p className="text-muted small">
                    <strong>Disclaimer:</strong> This tool is designed for educational purposes only and
                    should not be used as a substitute for professional medical advice, diagnosis, or
                    treatment. It is not intended for clinical use or direct application in patient care.
                    Users should consult appropriate clinical guidelines or medical professionals for
                    patient-specific decisions.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
