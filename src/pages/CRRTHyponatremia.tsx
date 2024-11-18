import React, { useState, useEffect } from "react";

interface Fluid {
    id: number;
    fluidNa: number;
    fluidRate: number;
}

const HyponatremiaCalculator: React.FC = () => {
    const [targetNa, setTargetNa] = useState<number>(130);
    const [dilutingSolutionNa, setDilutingSolutionNa] = useState<string>("0");
    const [customDilutingSolutionNa, setCustomDilutingSolutionNa] = useState<number>(0);
    const [dialysateNa, setDialysateNa] = useState<number>(140);
    const [dialysateRate, setDialysateRate] = useState<number>(2);
    const [fluids, setFluids] = useState<Fluid[]>([]);
    const [nextFluidId, setNextFluidId] = useState<number>(1);

    const [dilutingSolutionRate, setDilutingSolutionRate] = useState<string>("0");
    const [totalRate, setTotalRate] = useState<string>("0");

    // Add Fluid
    const addFluid = () => {
        setFluids([
            ...fluids,
            { fluidNa: 140, fluidRate: 0, id: nextFluidId },
        ]);
        setNextFluidId(nextFluidId + 1);
    };

    // Remove Fluid
    const removeFluid = (id: number) => {
        setFluids(fluids.filter((fluid) => fluid.id !== id));
    };

    // Handle Fluid Na and Rate Change
    const handleFluidChange = (id: number, field: "fluidNa" | "fluidRate", value: number) => {
        setFluids(
            fluids.map((fluid) =>
                fluid.id === id ? { ...fluid, [field]: value } : fluid
            )
        );
    };

    // Calculate Results
    const calculateResults = () => {
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
    };

    // Trigger calculation on every state change
    useEffect(() => {
        calculateResults();
    }, [targetNa, dilutingSolutionNa, customDilutingSolutionNa, dialysateNa, dialysateRate, fluids]);

    // Focus handler to select content
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    return (
        <div className="container mt-2">
            <h3 className="my-3">CRRT Hyponatremia Calculator</h3>
            <div className="row">
                <div className="col-md-4 results-section sticky-results">
                    <p><strong>Diluting Solution Rate:</strong> {dilutingSolutionRate} L/hr</p>
                    <p><strong>Total Rate:</strong> {totalRate} L/hr</p>
                </div>
                <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="targetNa" className="form-label">Target Na (meq/L)</label>
                        <input
                            type="number"
                            id="targetNa"
                            className="form-control mt-2"
                            value={targetNa}
                            onChange={(e) => setTargetNa(parseInt(e.target.value))}
                            onFocus={handleFocus}
                        />
                    </div>

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

                    <div className="mb-3">
                        <label htmlFor="dialysateNa" className="form-label">Dialysate Na (meq/L)</label>
                        <input
                            type="number"
                            id="dialysateNa"
                            className="form-control"
                            value={dialysateNa}
                            onChange={(e) => setDialysateNa(parseInt(e.target.value))}
                            onFocus={handleFocus}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="dialysateRate" className="form-label">Dialysate Rate (L/hr)</label>
                        <input
                            type="number"
                            id="dialysateRate"
                            className="form-control mt-2"
                            value={dialysateRate}
                            onChange={(e) => setDialysateRate(parseFloat(e.target.value))}
                            onFocus={handleFocus}
                        />
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
                                    <label>Fluid Na (meq/L)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={fluid.fluidNa}
                                        onChange={(e) => handleFluidChange(fluid.id, "fluidNa", parseInt(e.target.value))}
                                        onFocus={handleFocus}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Fluid Rate (L/hr)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={fluid.fluidRate}
                                        onChange={(e) => handleFluidChange(fluid.id, "fluidRate", parseFloat(e.target.value))}
                                        onFocus={handleFocus}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HyponatremiaCalculator;
