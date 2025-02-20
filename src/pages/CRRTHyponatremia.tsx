import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Config } from "../AppConfig";
import { BlockMath } from "react-katex";
import 'katex/dist/katex.min.css';

interface Fluid {
    id: number;
    fluidNa: number;
    fluidRate: number;
    selectedPreset: string | null;
}

const HyponatremiaCalculator: React.FC = () => {
    const [targetNa, setTargetNa] = useState<number>(130);
    const [dilutingSolutionNa, setDilutingSolutionNa] = useState<string>("0");
    const [customDilutingSolutionNa, setCustomDilutingSolutionNa] = useState<number>(0);
    const [dialysateNa, setDialysateNa] = useState<number>(140);
    const [dialysateRate, setDialysateRate] = useState<number>(2);
    const [selectedDialysatePreset, setSelectedDialysatePreset] = useState<string | null>(null);
    const [fluids, setFluids] = useState<Fluid[]>([]);
    const [nextFluidId, setNextFluidId] = useState<number>(1);
    const [dilutingSolutionRate, setDilutingSolutionRate] = useState<string>("0");
    const [totalRate, setTotalRate] = useState<string>("0");

    const addFluid = useCallback(() => {
        setFluids((prevFluids) => [
            ...prevFluids,
            { fluidNa: 140, fluidRate: 0, id: nextFluidId, selectedPreset: "Na 140" },
        ]);
        setNextFluidId((prevId) => prevId + 1);
    }, [nextFluidId]);

    const removeFluid = useCallback((id: number) => {
        setFluids((prevFluids) => prevFluids.filter((fluid) => fluid.id !== id));
    }, []);

    const handleFluidChange = useCallback((id: number, field: "fluidNa" | "fluidRate", value: number) => {
        setFluids((prevFluids) =>
            prevFluids.map((fluid) => {
                let preset = null;
                if (field === "fluidNa") {
                    if (value === 140) preset = "Na 140";
                    else if (value === 1000) preset = "NaHCO3 1 meq/mL";
                    else if (value === 150) preset = "NaHCO3 150 meq/L";
                    else if (value === 0) preset = "D5W";
                }
                return fluid.id === id
                    ? { ...fluid, [field]: value, selectedPreset: preset }
                    : fluid;
            })
        );
    }, []);

    const applyPreset = useCallback((id: number, preset: string, value: number) => {
        setFluids((prevFluids) =>
            prevFluids.map((fluid) =>
                fluid.id === id
                    ? { ...fluid, fluidNa: value, selectedPreset: preset }
                    : fluid
            )
        );
    }, []);

    const applyDialysatePreset = useCallback((preset: string, value: number) => {
        setDialysateNa(value);
        setSelectedDialysatePreset(preset);
    }, []);

    const handleDialysateInputChange = useCallback((value: number) => {
        setDialysateNa(value);
        let preset = null;
        if (value === 140) preset = "Na 140";
        else if (value === 1000) preset = "NaHCO3 1 meq/mL";
        else if (value === 150) preset = "NaHCO3 150 meq/L";
        else if (value === 0) preset = "D5W";
        setSelectedDialysatePreset(preset);
    }, []);

    const calculateResults = useCallback(() => {
        const dilutingNa =
            dilutingSolutionNa === "custom" ? customDilutingSolutionNa : parseInt(dilutingSolutionNa);

        let fluidNaSum = 0;
        let fluidRateSum = 0;
        fluids.forEach((fluid) => {
            fluidNaSum += fluid.fluidNa * fluid.fluidRate;
            fluidRateSum += fluid.fluidRate;
        });

        const step1 = dialysateNa * dialysateRate;
        const step2 = fluidNaSum;
        const step3 = (fluidRateSum + dialysateRate) * targetNa;
        const step4 = targetNa - dilutingNa;

        const newDilutingSolutionRate =
            step4 !== 0 ? ((step1 + step2 - step3) / step4).toFixed(3) : "0";
        const newTotalRate = (
            fluidRateSum +
            dialysateRate +
            parseFloat(newDilutingSolutionRate)
        ).toFixed(3);

        setDilutingSolutionRate(newDilutingSolutionRate);
        setTotalRate(newTotalRate);
    }, [targetNa, dilutingSolutionNa, customDilutingSolutionNa, dialysateNa, dialysateRate, fluids]);

    useEffect(() => {
        calculateResults();
    }, [calculateResults]);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    return (
        <div className="container mt-2">
            <Helmet>
                <title>CRRT Hyponatremia - {Config.Title}</title>
            </Helmet>
            <h3 className="my-3">CRRT Hyponatremia Calculator</h3>
            <div className="row">
                <div className="col-md-4 mb-2 py-3 sticky-results border-bottom border-secondary shadow-sm">
                    <p className="my-1">Total Rate: {totalRate} L/hr</p>
                    <p className="my-1">Diluting Solution Na: {dilutingSolutionNa === "custom" ? `${customDilutingSolutionNa}` : dilutingSolutionNa} meq/L</p>
                    <p className="my-1"><strong>Diluting Solution Rate: {dilutingSolutionRate} L/hr</strong></p>
                </div>
                <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="targetNa" className="form-label">Target Na (meq/L)</label>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="targetNaSlider"
                                className="form-range me-3 px-3"
                                min="120"
                                max="150"
                                step="1"
                                value={targetNa}
                                onChange={(e) => setTargetNa(parseInt(e.target.value))}
                            />
                            <input
                                type="number"
                                id="targetNa"
                                className="form-control"
                                value={targetNa}
                                onChange={(e) => setTargetNa(parseInt(e.target.value))}
                                onFocus={handleFocus}
                                style={{ width: "100px" }}
                            />
                        </div>
                    </div>

                    <hr></hr>

                    <div className="mb-3">
                        <label htmlFor="dilutingSolutionNa" className="form-label">Diluting Solution Na (meq/L)</label>
                        <select
                            id="dilutingSolutionNa"
                            className="form-select"
                            value={dilutingSolutionNa}
                            onChange={(e) => setDilutingSolutionNa(e.target.value)}
                        >
                            <option value="0">D5W (0)</option>
                            <option value="77">1/2NS (77)</option>
                            <option value="custom">Custom</option>
                        </select>
                        {dilutingSolutionNa === "custom" && (
                            <input
                                type="number"
                                id="customDilutingSolutionNa"
                                className="form-control mt-2"
                                value={customDilutingSolutionNa}
                                onChange={(e) => setCustomDilutingSolutionNa(parseInt(e.target.value))}
                                onFocus={handleFocus}
                            />
                        )}
                    </div>

                    <hr></hr>

                    <div className="mb-3">
                        <label htmlFor="dialysateNa" className="form-label">Dialysate Na (meq/L)</label>
                        <div className="d-flex flex-wrap">
                            <button
                                className={`btn btn-sm me-2 my-1 ${selectedDialysatePreset === "Na 140" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => applyDialysatePreset("Na 140", 140)}
                            >
                                Na 140
                            </button>
                            <button
                                className={`btn btn-sm me-2 my-1 ${selectedDialysatePreset === "NaHCO3 1 meq/mL" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => applyDialysatePreset("NaHCO3 1 meq/mL", 1000)}
                            >
                                NaHCO3 1 meq/mL
                            </button>
                            <button
                                className={`btn btn-sm me-2 my-1 ${selectedDialysatePreset === "NaHCO3 150 meq/L" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => applyDialysatePreset("NaHCO3 150 meq/L", 150)}
                            >
                                NaHCO3 150 meq/L
                            </button>
                            <button
                                className={`btn btn-sm me-2 my-1 ${selectedDialysatePreset === "D5W" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => applyDialysatePreset("D5W", 0)}
                            >
                                D5W
                            </button>
                        </div>
                        <input
                            type="number"
                            id="dialysateNa"
                            className="form-control mt-2"
                            value={dialysateNa}
                            onChange={(e) => handleDialysateInputChange(parseInt(e.target.value))}
                            onFocus={handleFocus}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="dialysateRate" className="form-label">Dialysate Rate (L/hr)</label>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="dialysateRateSlider"
                                className="form-range me-3 px-3"
                                min="0"
                                max="8"
                                step="0.1"
                                value={dialysateRate}
                                onChange={(e) => setDialysateRate(parseFloat(e.target.value))}
                            />
                            <input
                                type="number"
                                id="dialysateRate"
                                className="form-control text-center"
                                value={dialysateRate}
                                onChange={(e) => setDialysateRate(parseFloat(e.target.value))}
                                onFocus={handleFocus}
                                style={{ width: "100px" }}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <button onClick={addFluid} className="btn btn-primary">Add Fluid</button>
                    </div>

                    {fluids.map((fluid) => (
                        <div key={fluid.id} className="card mb-3">
                            <div className="card-header d-flex justify-content-between bg-secondary text-light">
                                <span>Fluid {fluid.id}</span>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeFluid(fluid.id)}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="mb-1">Fluid Na (meq/L)</label>
                                    <div className="d-flex flex-wrap">
                                        <button
                                            className={`btn btn-sm me-2 ${fluid.selectedPreset === "Na 140" ? "btn-primary" : "btn-secondary"}`}
                                            onClick={() => applyPreset(fluid.id, "Na 140", 140)}
                                        >
                                            Na 140
                                        </button>
                                        <button
                                            className={`btn btn-sm me-2 ${fluid.selectedPreset === "NaHCO3 1 meq/mL" ? "btn-primary" : "btn-secondary"}`}
                                            onClick={() => applyPreset(fluid.id, "NaHCO3 1 meq/mL", 1000)}
                                        >
                                            NaHCO3 1 meq/mL
                                        </button>
                                        <button
                                            className={`btn btn-sm me-2 ${fluid.selectedPreset === "NaHCO3 150 meq/L" ? "btn-primary" : "btn-secondary"}`}
                                            onClick={() => applyPreset(fluid.id, "NaHCO3 150 meq/L", 150)}
                                        >
                                            NaHCO3 150 meq/L
                                        </button>
                                        <button
                                            className={`btn btn-sm me-2 ${fluid.selectedPreset === "D5W" ? "btn-primary" : "btn-secondary"}`}
                                            onClick={() => applyPreset(fluid.id, "D5W", 0)}
                                        >
                                            D5W
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-control mt-2"
                                        value={fluid.fluidNa}
                                        onChange={(e) =>
                                            handleFluidChange(fluid.id, "fluidNa", parseFloat(e.target.value))
                                        }
                                        onFocus={handleFocus}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Fluid Rate (L/hr)</label>
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="range"
                                            className="form-range me-3 px-3"
                                            min="0"
                                            max="8"
                                            step="0.1"
                                            value={fluid.fluidRate}
                                            onChange={(e) =>
                                                handleFluidChange(fluid.id, "fluidRate", parseFloat(e.target.value))
                                            }
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={fluid.fluidRate}
                                            onChange={(e) =>
                                                handleFluidChange(fluid.id, "fluidRate", parseFloat(e.target.value))
                                            }
                                            onFocus={handleFocus}
                                            style={{ width: "100px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


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

                            <BlockMath math="
                                \text{[Na]}_{\text{target}} = 
                                \frac{
                                    \sum \left(\text{[Na]} \cdot \text{Rate}\right)_{\text{all fluids}}
                                }{
                                    \text{Total Fluid Rate}
                                }
                                "
                            />

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

export default HyponatremiaCalculator;
