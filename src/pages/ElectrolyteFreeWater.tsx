import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Config } from "../AppConfig";
import { BlockMath } from "react-katex";

type CalculationMode = "Traditional" | "Nguyen-Kurtz";

const ElectrolyteFreeWater: React.FC = () => {
    const [calculationMode, setCalculationMode] = useState<CalculationMode>("Nguyen-Kurtz");
    const [urineNa, setUrineNa] = useState<number>(0);
    const [urineK, setUrineK] = useState<number>(0);
    const [serumNa, setSerumNa] = useState<number>(140);
    const [urineVolume, setUrineVolume] = useState<number>(0);

    const clearance = useMemo(() => {
        if (serumNa === 0) {
            return 0;
        }

        if (calculationMode === "Traditional") {
            const electrolyteRatio = (urineNa + urineK) / serumNa;
            return Math.round(urineVolume * (1 - electrolyteRatio));
        }

        const electrolyteRatio = ((urineNa + urineK) * 1.03) / (serumNa + 23.8);
        return Math.round(urineVolume * (1 - electrolyteRatio));
    }, [calculationMode, serumNa, urineK, urineNa, urineVolume]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const parseNumber = (value: string) => {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    return (
        <div className="container calculator-page compact-calculator mt-2">
            <Helmet>
                <title>Electrolyte Free Water Clearance - {Config.Title}</title>
            </Helmet>

            <h3 className="my-3">Electrolyte Free Water Clearance Calculator</h3>

            <div className="card mb-3 sticky-results border-secondary shadow-sm" aria-live="polite">
                <div className="card-body">
                    <p className="mb-1">
                        <strong>Electrolyte Free Water Clearance:</strong>
                    </p>
                    <p className="mb-0 fs-5">
                        <strong>{clearance} mL</strong>
                    </p>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <div className="mb-4">
                        <label className="form-label d-block mb-2">Calculation Method</label>
                        <div className="btn-group" role="group" aria-label="Calculation method">
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
                                value="Nguyen-Kurtz"
                                autoComplete="off"
                                onChange={() => setCalculationMode("Nguyen-Kurtz")}
                                checked={calculationMode === "Nguyen-Kurtz"}
                            />
                            <label className="btn btn-outline-primary" htmlFor="nguyenKurtz">
                                Nguyen-Kurtz
                            </label>
                        </div>
                    </div>

                    <form>
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
                                onChange={(e) => setUrineNa(parseNumber(e.target.value))}
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
                                onChange={(e) => setUrineK(parseNumber(e.target.value))}
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
                                onChange={(e) => setSerumNa(parseNumber(e.target.value))}
                            />
                        </div>
                        <div>
                            <label htmlFor="urineVolume" className="form-label">
                                Urine Volume (mL)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                id="urineVolume"
                                value={urineVolume}
                                min="0"
                                onFocus={handleFocus}
                                onChange={(e) => setUrineVolume(parseNumber(e.target.value))}
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="text-center mt-4">
                <button
                    className="btn btn-success"
                    data-bs-toggle="modal"
                    data-bs-target="#referencesModal"
                >
                    References
                </button>
            </div>

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
                                        Nguyen-Kurtz Modified Electrolyte Free Water:
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
