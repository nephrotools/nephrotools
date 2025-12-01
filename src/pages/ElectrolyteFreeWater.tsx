import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Config } from "../AppConfig";
import { BlockMath } from "react-katex";


const ElectrolyteFreeWater: React.FC = () => {
    const [calculationMode, setCalculationMode] = useState<string>("Nguyen–Kurtz");
    const [urineNa, setUrineNa] = useState<number>(0);
    const [urineK, setUrineK] = useState<number>(0);
    const [serumNa, setSerumNa] = useState<number>(140);
    const [urineVolume, setUrineVolume] = useState<number>(0);
    const [clearance, setClearance] = useState<number>(0);

    // Calculate the electrolyte-free water clearance
    const calculateClearance = () => {
        if (serumNa === 0) {
            setClearance(0); // Handle invalid input case
            return;
        }

        let newClearance = 0;

        if (calculationMode === "Traditional") {
            const step1 = urineNa + urineK;
            const step2 = step1 / serumNa;
            const step3 = 1 - step2;
            newClearance = urineVolume * step3;
        } else if (calculationMode === "Nguyen–Kurtz") {
            const step1 = (urineNa + urineK) * 1.03;
            const step2 = serumNa + 23.8;
            const step3 = step1 / step2;
            const step4 = 1 - step3;
            newClearance = urineVolume * step4;
        }

        setClearance(Math.round(newClearance));
    };

    // Recalculate whenever inputs change
    useEffect(() => {
        calculateClearance();
    }, [urineNa, urineK, serumNa, urineVolume, calculationMode]);

    // Handler to select input content on focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="container mt-2">
            <Helmet>
                <title>Electrolyte Free Water Clearance - {Config.Title}</title>
            </Helmet>
            <h3 className="text-center">Electrolyte Free Water Clearance Calculator</h3>
            <div className="d-flex justify-content-center my-3">
                <div className="btn-group" role="group">
                    <input
                        type="radio"
                        className="btn-check"
                        name="calculationMode"
                        id="traditional"
                        value="Traditional"
                        autoComplete="off"
                        onChange={() => setCalculationMode("Traditional")}
                        checked={calculationMode === "Traditional"}
                    />
                    <label className="btn btn-outline-primary" htmlFor="traditional">
                        Traditional
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="calculationMode"
                        id="nguyenKurtz"
                        value="Nguyen–Kurtz"
                        autoComplete="off"
                        onChange={() => setCalculationMode("Nguyen–Kurtz")}
                        checked={calculationMode === "Nguyen–Kurtz"}
                    />
                    <label className="btn btn-outline-primary" htmlFor="nguyenKurtz">
                        Nguyen–Kurtz
                    </label>
                </div>
            </div>
            <form className="mt-4">
                <div className="mb-3">
                    <label htmlFor="urineNa" className="form-label">
                        Urine Na (mEq/L)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="urineNa"
                        value={urineNa}
                        step="0.01"
                        min="0"
                        onFocus={handleFocus}
                        onChange={(e) => setUrineNa(parseFloat(e.target.value))}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="urineK" className="form-label">
                        Urine K (mEq/L)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="urineK"
                        value={urineK}
                        step="0.01"
                        min="0"
                        onFocus={handleFocus}
                        onChange={(e) => setUrineK(parseFloat(e.target.value))}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="serumNa" className="form-label">
                        Serum Na (mEq/L)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="serumNa"
                        value={serumNa}
                        step="0.01"
                        min="0"
                        onFocus={handleFocus}
                        onChange={(e) => setSerumNa(parseFloat(e.target.value))}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="urineVolume" className="form-label">
                        Urine Volume (ml)
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="urineVolume"
                        value={urineVolume}
                        min="0"
                        onFocus={handleFocus}
                        onChange={(e) => setUrineVolume(parseInt(e.target.value))}
                    />
                </div>
            </form>
            <h4>
                <p>
                    Electrolyte Free Water Clearance:{" "}
                    <strong>{clearance} ml</strong>
                </p>
            </h4>

            {/* Reference Button */}
            <div className="text-center mt-5">
                <button
                    className="btn btn-success"
                    data-bs-toggle="modal"
                    data-bs-target="#referencesModal"
                >
                    References
                </button>
            </div>

            {/* Modal */}
            <div
                className="modal fade"
                id="referencesModal"
                tabIndex={-1}
                aria-labelledby="referencesModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="referencesModalLabel">
                                References
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <ol>
                                <li>
                                    <a
                                        href="https://pubmed.ncbi.nlm.nih.gov/15383402/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Nguyen–Kurtz Modified Electrolyte Free Water:
                                    </a>
                                    <BlockMath math="\text{EFWC} = V \left(1 - \frac{1.03 * \text{Urine}[\text{Na} + \text{K}]}{\text{Plasma}[\text{Na}]+23.8}\right)" />
                                </li>
                                <li>
                                    Traditional Electrolyte Free Water Calculation:
                                    <BlockMath math="\text{EFWC} = V \left(1 - \frac{\text{Urine}[\text{Na} + \text{K}]}{\text{Plasma}[\text{Na}]}\right)" />
                                </li>
                            </ol>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectrolyteFreeWater;
