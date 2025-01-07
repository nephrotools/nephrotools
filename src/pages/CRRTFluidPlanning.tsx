import React, { useState, useCallback } from "react";
import "./CRRTFluidPlanning.css";
import { Helmet } from "react-helmet-async";
import { Config } from "../AppConfig";

type FluidPreset = {
    Na: number;
    K: number;
    HCO3: number;
    Ca: number;
    Mg: number;
};

const predefinedFluids: Record<string, FluidPreset> = {
    "BGK 4/2.5": { Na: 140, K: 4, HCO3: 32, Ca: 2.5, Mg: 1.5 },
    "B22GK 4/0": { Na: 140, K: 4, HCO3: 22, Ca: 0, Mg: 1.5 },
    "BGK 2/0": { Na: 140, K: 2, HCO3: 32, Ca: 0, Mg: 1.0 },
    "BGK 2/3.5": { Na: 140, K: 2, HCO3: 32, Ca: 3.5, Mg: 1.0 },
    "BGK 0/2.5": { Na: 140, K: 0, HCO3: 32, Ca: 2.5, Mg: 1.5 },
    "NaHCO3 1 meq/mL": { Na: 1000, K: 0, HCO3: 1000, Ca: 0, Mg: 0 },
    "NaHCO3 150 meq/L": { Na: 150, K: 0, HCO3: 150, Ca: 0, Mg: 0 },
    "D5W": { Na: 0, K: 0, HCO3: 0, Ca: 0, Mg: 0 },
};

const CRRTFluidPlanning: React.FC = () => {
    const [fluids, setFluids] = useState<
        {
            id: number;
            rate: number;
            electrolytes: FluidPreset;
            activePreset: string | null;
        }[]
    >([{ id: 1, rate: 0, electrolytes: { Na: 0, K: 0, HCO3: 0, Ca: 0, Mg: 0 }, activePreset: null }]);

    const [nextId, setNextId] = useState<number>(2);

    const addFluidCard = useCallback(() => {
        setFluids((prevFluids) => [
            ...prevFluids,
            {
                id: nextId,
                rate: 0,
                electrolytes: { Na: 0, K: 0, HCO3: 0, Ca: 0, Mg: 0 },
                activePreset: null,
            },
        ]);
        setNextId((prevNextId) => prevNextId + 1);
    }, [nextId]);

    const removeFluidCard = useCallback((id: number) => {
        setFluids((prevFluids) => prevFluids.filter((fluid) => fluid.id !== id));
    }, []);

    const updateFluidRate = useCallback((id: number, rate: number) => {
        setFluids((prevFluids) =>
            prevFluids.map((fluid) => (fluid.id === id ? { ...fluid, rate } : fluid))
        );
    }, []);

    const updateElectrolyte = useCallback((id: number, electrolyte: keyof FluidPreset, value: number) => {
        setFluids((prevFluids) =>
            prevFluids.map((fluid) =>
                fluid.id === id
                    ? {
                        ...fluid,
                        electrolytes: { ...fluid.electrolytes, [electrolyte]: value },
                        activePreset: null,
                    }
                    : fluid
            )
        );
    }, []);

    const applyPreset = useCallback((id: number, preset: string) => {
        const fluidValues = predefinedFluids[preset as keyof typeof predefinedFluids];
        setFluids((prevFluids) =>
            prevFluids.map((fluid) =>
                fluid.id === id
                    ? {
                        ...fluid,
                        electrolytes: { ...fluidValues },
                        activePreset: preset,
                    }
                    : fluid
            )
        );
    }, []);

    const calculateResults = useCallback(() => {
        let totalRate = 0;
        const weightedSums: FluidPreset = { Na: 0, K: 0, HCO3: 0, Ca: 0, Mg: 0 };

        fluids.forEach((fluid) => {
            totalRate += fluid.rate;
            Object.keys(weightedSums).forEach((key) => {
                const electrolyte = key as keyof FluidPreset;
                weightedSums[electrolyte] += fluid.electrolytes[electrolyte] * fluid.rate;
            });
        });

        return {
            totalRate: totalRate.toFixed(1),
            finalConcentrations: Object.keys(weightedSums).reduce((acc, key) => {
                const electrolyte = key as keyof FluidPreset;
                acc[electrolyte] = totalRate ? (weightedSums[electrolyte] / totalRate).toFixed(1) : "0";
                return acc;
            }, {} as Record<keyof FluidPreset, string>),
        };
    }, [fluids]);

    const { totalRate, finalConcentrations } = calculateResults();

    return (
        <div className="container my-2">
            <Helmet>
                <title>CRRT Fluid Planning - {Config.Title}</title>
            </Helmet>

            <h3 className="my-3">CRRT Fluid Planning</h3>
            <div className="row">
                <div className="col-md-4 py-1 mb-1 sticky-results border-bottom border-secondary shadow-sm">
                    <div>
                        <p className="my-0"><strong>Total Rate:</strong> {totalRate} L/hr</p>
                        <p className="my-0"><strong>Final Concentrations:</strong></p>
                        <div className="row">
                            <div className="col-6">
                                <ul className="mb-0">
                                    <li><strong>Na:</strong> {finalConcentrations.Na} mEq/L</li>
                                    <li><strong>K:</strong> {finalConcentrations.K} mEq/L</li>
                                    <li><strong>HCO3:</strong> {finalConcentrations.HCO3} mEq/L</li>
                                </ul>
                            </div>
                            <div className="col-6">
                                <ul className="mb-0">
                                    <li><strong>Ca:</strong> {finalConcentrations.Ca} mEq/L</li>
                                    <li><strong>Mg:</strong> {finalConcentrations.Mg} mEq/L</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8 my-1">
                    {fluids.map((fluid) => (
                        <div className="card mb-3" key={fluid.id}>
                            <div className="card-header d-flex justify-content-between bg-secondary text-light">
                                <span>Fluid {fluid.id}</span>
                                <button className="btn btn-danger btn-sm" onClick={() => removeFluidCard(fluid.id)}>
                                    Remove
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Fluid Presets</label>
                                    <div>
                                        {Object.keys(predefinedFluids).map((preset) => (
                                            <button
                                                type="button"
                                                key={preset}
                                                className={`btn btn-sm me-2 mb-1 ${fluid.activePreset === preset ? "btn-primary" : "btn-secondary"
                                                    }`}
                                                onClick={() => applyPreset(fluid.id, preset)}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {Object.keys(predefinedFluids["BGK 4/2.5"]).map((electrolyte) => (
                                    <div className="mb-3" key={electrolyte}>
                                        <label className="form-label">{electrolyte} (mEq/L)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={fluid.electrolytes[electrolyte as keyof FluidPreset]}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                                updateElectrolyte(
                                                    fluid.id,
                                                    electrolyte as keyof FluidPreset,
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                                <div className="mb-3">
                                    <label className="form-label">Fluid Rate (L/hr)</label>
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="range"
                                            className="form-range me-3 px-3"
                                            min="0"
                                            max="6"
                                            step="0.1"
                                            value={fluid.rate}
                                            onChange={(e) => updateFluidRate(fluid.id, parseFloat(e.target.value))}
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            step="0.1"
                                            value={fluid.rate}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => updateFluidRate(fluid.id, parseFloat(e.target.value))}
                                            style={{ width: "100px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="btn btn-primary mt-3" onClick={addFluidCard}>
                        Add Fluid
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CRRTFluidPlanning;
