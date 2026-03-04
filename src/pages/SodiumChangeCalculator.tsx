import React, { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BlockMath } from "react-katex";
import { Config } from "../AppConfig";

type CalculationMethod = "nguyen-kurtz" | "barsoum-levine";

type DynamicCard = {
    id: number;
    type: "infusate" | "non-infusate";
    na: number;
    k: number;
    volume: number;
    activePreset: string | null;
};

type Preset = {
    name: string;
    na: number;
    k: number;
};

const infusatePresets: Preset[] = [
    { name: "NS", na: 154, k: 0 },
    { name: "1/2NS", na: 77, k: 0 },
    { name: "3%Na", na: 513, k: 0 },
    { name: "8.4%NaHCO3", na: 1000, k: 0 },
    { name: "LR", na: 130, k: 4 },
];

const nonInfusatePresets: Preset[] = [
    { name: "1g NaCl", na: 17, k: 0 },
    { name: "2g NaCl", na: 34, k: 0 },
    { name: "650mg NaHCO3", na: 7.7, k: 0 },
    { name: "10meq KCl", na: 0, k: 10 },
    { name: "20meq KCl", na: 0, k: 20 },
    { name: "40meq KCl", na: 0, k: 40 },
];

const createEmptyCard = (id: number): DynamicCard => ({
    id,
    type: "infusate",
    na: 0,
    k: 0,
    volume: 0,
    activePreset: null,
});

const SodiumChangeCalculator: React.FC = () => {
    const [method, setMethod] = useState<CalculationMethod>("nguyen-kurtz");
    const [tbw, setTbw] = useState<number>(37.5);
    const [naInitial, setNaInitial] = useState<number>(125);

    const [inputCards, setInputCards] = useState<DynamicCard[]>([createEmptyCard(1)]);
    const [outputCards, setOutputCards] = useState<DynamicCard[]>([createEmptyCard(1)]);
    const [nextInputId, setNextInputId] = useState<number>(2);
    const [nextOutputId, setNextOutputId] = useState<number>(2);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    const addInputCard = useCallback(() => {
        setInputCards((prev) => [...prev, createEmptyCard(nextInputId)]);
        setNextInputId((prev) => prev + 1);
    }, [nextInputId]);

    const addOutputCard = useCallback(() => {
        setOutputCards((prev) => [...prev, createEmptyCard(nextOutputId)]);
        setNextOutputId((prev) => prev + 1);
    }, [nextOutputId]);

    const removeInputCard = useCallback((id: number) => {
        setInputCards((prev) => prev.filter((card) => card.id !== id));
    }, []);

    const removeOutputCard = useCallback((id: number) => {
        setOutputCards((prev) => prev.filter((card) => card.id !== id));
    }, []);

    const updateCard = useCallback(
        (
            setCards: React.Dispatch<React.SetStateAction<DynamicCard[]>>,
            id: number,
            field: "na" | "k" | "volume",
            value: number
        ) => {
            setCards((prev) =>
                prev.map((card) =>
                    card.id === id
                        ? {
                            ...card,
                            [field]: value,
                            activePreset: field === "na" || field === "k" ? null : card.activePreset,
                        }
                        : card
                )
            );
        },
        []
    );

    const toggleCardType = useCallback(
        (
            setCards: React.Dispatch<React.SetStateAction<DynamicCard[]>>,
            id: number,
            isNonInfusate: boolean
        ) => {
            setCards((prev) =>
                prev.map((card) =>
                    card.id === id
                        ? {
                            ...card,
                            type: isNonInfusate ? "non-infusate" : "infusate",
                            activePreset: isNonInfusate ? null : card.activePreset,
                        }
                        : card
                )
            );
        },
        []
    );

    const applyPreset = useCallback(
        (
            setCards: React.Dispatch<React.SetStateAction<DynamicCard[]>>,
            id: number,
            preset: Preset
        ) => {
            setCards((prev) =>
                prev.map((card) =>
                    card.id === id
                        ? { ...card, na: preset.na, k: preset.k, activePreset: preset.name }
                        : card
                )
            );
        },
        []
    );

    const results = useMemo(() => {
        const calculateElectrolyteAndVolume = (cards: DynamicCard[]) =>
            cards.reduce(
                (acc, card) => {
                    if (card.type === "infusate") {
                        const volumeL = card.volume / 1000;
                        acc.electrolyte_mass_balance += (card.na + card.k) * volumeL;
                        acc.volume += volumeL;
                    } else {
                        acc.electrolyte_mass_balance += card.na + card.k;
                    }
                    return acc;
                },
                { electrolyte_mass_balance: 0, volume: 0 }
            );

        const inputTotals = calculateElectrolyteAndVolume(inputCards);
        const outputTotals = calculateElectrolyteAndVolume(outputCards);

        const eInitial =
            method === "nguyen-kurtz" ? (naInitial + 23.8) * tbw : naInitial * tbw;
        const eDelta =
            method === "nguyen-kurtz"
                ? 1.03 * (inputTotals.electrolyte_mass_balance - outputTotals.electrolyte_mass_balance)
                : inputTotals.electrolyte_mass_balance - outputTotals.electrolyte_mass_balance;
        const vDelta = inputTotals.volume - outputTotals.volume;

        const denominator = tbw + vDelta;
        if (denominator === 0) {
            return { naFinal: Number.NaN, naChange: Number.NaN };
        }

        const naFinalCore = (eInitial + eDelta) / denominator;
        const naFinal =
            method === "nguyen-kurtz" ? naFinalCore - 23.8 : naFinalCore;
        const naChange = naFinal - naInitial;

        return { naFinal, naChange };
    }, [inputCards, method, naInitial, outputCards, tbw]);

    const formatResult = (value: number): string =>
        Number.isFinite(value) ? value.toFixed(1) : "N/A";

    return (
        <div className="container my-2">
            <Helmet>
                <title>Sodium Change Calculator - {Config.Title}</title>
            </Helmet>

            <h3 className="my-3">Sodium Change Calculator</h3>
            <div className="card mb-3 sticky-results border-secondary shadow-sm">
                <div className="card-body">
                    <p className="mb-1">
                        <strong>Final Sodium:</strong> {formatResult(results.naFinal)} meq/L
                    </p>
                    <p className="mb-0">
                        <strong>ΔNa:</strong> {formatResult(results.naChange)} meq/L
                    </p>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label d-block mb-2">Calculation Method</label>
                <div className="btn-group" role="group" aria-label="Calculation method">
                    <button
                        type="button"
                        className={`btn ${method === "nguyen-kurtz" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setMethod("nguyen-kurtz")}
                    >
                        Nguyen-Kurtz
                    </button>
                    <button
                        type="button"
                        className={`btn ${method === "barsoum-levine" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setMethod("barsoum-levine")}
                    >
                        Barsoum-Levine
                    </button>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-6 mb-3 mb-md-0">
                    <label htmlFor="tbw" className="form-label">
                        Total Body Water
                    </label>
                    <div className="d-flex align-items-center">
                        <input
                            id="tbwSlider"
                            type="range"
                            className="form-range me-2 px-1"
                            min={20}
                            max={60}
                            step={0.1}
                            value={tbw}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setTbw(Number.isNaN(value) ? 20 : value);
                            }}
                        />
                        <div className="input-group" style={{ maxWidth: "130px" }}>
                            <input
                                id="tbw"
                                type="number"
                                className="form-control text-center"
                                min={20}
                                max={60}
                                step={0.1}
                                value={tbw}
                                onFocus={handleFocus}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (Number.isNaN(value)) {
                                        setTbw(20);
                                        return;
                                    }
                                    setTbw(Math.min(60, Math.max(20, value)));
                                }}
                            />
                            <span className="input-group-text">L</span>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <label htmlFor="naInitial" className="form-label">
                        Plasma Na
                    </label>
                    <div className="d-flex align-items-center">
                        <input
                            id="naInitialSlider"
                            type="range"
                            className="form-range me-2 px-1"
                            min={115}
                            max={135}
                            step={1}
                            value={naInitial}
                            onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                setNaInitial(Number.isNaN(value) ? 115 : value);
                            }}
                        />
                        <div className="input-group" style={{ maxWidth: "140px" }}>
                            <input
                                id="naInitial"
                                type="number"
                                className="form-control text-center"
                                min={115}
                                max={135}
                                step={1}
                                value={naInitial}
                                onFocus={handleFocus}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (Number.isNaN(value)) {
                                        setNaInitial(115);
                                        return;
                                    }
                                    setNaInitial(Math.min(135, Math.max(115, value)));
                                }}
                            />
                            <span className="input-group-text">meq/L</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-4" />

            <div className="row">
                <div className="col-12 col-md-6 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Inputs</h5>
                        <button className="btn btn-sm btn-primary" type="button" onClick={addInputCard}>
                            Add
                        </button>
                    </div>
                    {inputCards.map((card) => (
                        <div className="card mb-3" key={`input-${card.id}`}>
                            <div className="card-header d-flex justify-content-between align-items-center bg-secondary text-light">
                                <span>Input {card.id}</span>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeInputCard(card.id)}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="form-check form-switch mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={`input-type-${card.id}`}
                                        checked={card.type === "non-infusate"}
                                        onChange={(e) =>
                                            toggleCardType(setInputCards, card.id, e.target.checked)
                                        }
                                    />
                                    <label className="form-check-label" htmlFor={`input-type-${card.id}`}>
                                        {card.type === "infusate" ? "Fluid" : "Non-fluid"}
                                    </label>
                                </div>
                                <div className="mb-3">
                                    {(card.type === "infusate" ? infusatePresets : nonInfusatePresets).map((preset) => (
                                        <button
                                            key={`input-${card.id}-${preset.name}`}
                                            type="button"
                                            className={`btn btn-sm me-2 mb-2 ${card.activePreset === preset.name ? "btn-primary" : "btn-outline-secondary"}`}
                                            onClick={() => applyPreset(setInputCards, card.id, preset)}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Na</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            step={1}
                                            value={card.na}
                                            onFocus={handleFocus}
                                            onChange={(e) =>
                                                updateCard(
                                                    setInputCards,
                                                    card.id,
                                                    "na",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                        <span className="input-group-text">
                                            {card.type === "infusate" ? "meq/L" : "meq"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">K</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            step={1}
                                            value={card.k}
                                            onFocus={handleFocus}
                                            onChange={(e) =>
                                                updateCard(
                                                    setInputCards,
                                                    card.id,
                                                    "k",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                        <span className="input-group-text">
                                            {card.type === "infusate" ? "meq/L" : "meq"}
                                        </span>
                                    </div>
                                </div>
                                {card.type === "infusate" && (
                                    <div>
                                        <label className="form-label">Volume</label>
                                        <div className="d-flex align-items-center">
                                            <input
                                                id={`input-volume-slider-${card.id}`}
                                                type="range"
                                                className="form-range me-2 px-1"
                                                min={0}
                                                max={2000}
                                                step={100}
                                                value={card.volume}
                                                onChange={(e) =>
                                                    updateCard(
                                                        setInputCards,
                                                        card.id,
                                                        "volume",
                                                        parseInt(e.target.value, 10) || 0
                                                    )
                                                }
                                            />
                                            <div className="input-group" style={{ maxWidth: "140px" }}>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    min={0}
                                                    max={2000}
                                                    step={100}
                                                    value={card.volume}
                                                    onFocus={handleFocus}
                                                    onChange={(e) =>
                                                        updateCard(
                                                            setInputCards,
                                                            card.id,
                                                            "volume",
                                                            Math.min(2000, Math.max(0, parseInt(e.target.value, 10) || 0))
                                                        )
                                                    }
                                                />
                                                <span className="input-group-text">mL</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-12 col-md-6 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">Outputs</h5>
                        <button className="btn btn-sm btn-primary" type="button" onClick={addOutputCard}>
                            Add
                        </button>
                    </div>
                    {outputCards.map((card) => (
                        <div className="card mb-3" key={`output-${card.id}`}>
                            <div className="card-header d-flex justify-content-between align-items-center bg-secondary text-light">
                                <span>Output {card.id}</span>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeOutputCard(card.id)}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="form-check form-switch mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={`output-type-${card.id}`}
                                        checked={card.type === "non-infusate"}
                                        onChange={(e) =>
                                            toggleCardType(setOutputCards, card.id, e.target.checked)
                                        }
                                    />
                                    <label className="form-check-label" htmlFor={`output-type-${card.id}`}>
                                        {card.type === "infusate" ? "Fluid" : "Non-fluid"}
                                    </label>
                                </div>
                                <div className="mb-3">
                                    {(card.type === "infusate" ? infusatePresets : nonInfusatePresets).map((preset) => (
                                        <button
                                            key={`output-${card.id}-${preset.name}`}
                                            type="button"
                                            className={`btn btn-sm me-2 mb-2 ${card.activePreset === preset.name ? "btn-primary" : "btn-outline-secondary"}`}
                                            onClick={() => applyPreset(setOutputCards, card.id, preset)}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">Na</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            step={1}
                                            value={card.na}
                                            onFocus={handleFocus}
                                            onChange={(e) =>
                                                updateCard(
                                                    setOutputCards,
                                                    card.id,
                                                    "na",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                        <span className="input-group-text">
                                            {card.type === "infusate" ? "meq/L" : "meq"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label">K</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            step={1}
                                            value={card.k}
                                            onFocus={handleFocus}
                                            onChange={(e) =>
                                                updateCard(
                                                    setOutputCards,
                                                    card.id,
                                                    "k",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                        <span className="input-group-text">
                                            {card.type === "infusate" ? "meq/L" : "meq"}
                                        </span>
                                    </div>
                                </div>
                                {card.type === "infusate" && (
                                    <div>
                                        <label className="form-label">Volume</label>
                                        <div className="d-flex align-items-center">
                                            <input
                                                id={`output-volume-slider-${card.id}`}
                                                type="range"
                                                className="form-range me-2 px-1"
                                                min={0}
                                                max={2000}
                                                step={100}
                                                value={card.volume}
                                                onChange={(e) =>
                                                    updateCard(
                                                        setOutputCards,
                                                        card.id,
                                                        "volume",
                                                        parseInt(e.target.value, 10) || 0
                                                    )
                                                }
                                            />
                                            <div className="input-group" style={{ maxWidth: "140px" }}>
                                                <input
                                                    type="number"
                                                    className="form-control text-center"
                                                    min={0}
                                                    max={2000}
                                                    step={100}
                                                    value={card.volume}
                                                    onFocus={handleFocus}
                                                    onChange={(e) =>
                                                        updateCard(
                                                            setOutputCards,
                                                            card.id,
                                                            "volume",
                                                            Math.min(2000, Math.max(0, parseInt(e.target.value, 10) || 0))
                                                        )
                                                    }
                                                />
                                                <span className="input-group-text">mL</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
                aria-hidden={true}
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="referencesModalLabel">
                                Reference Equations
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <h6>
                                <a
                                    href="https://pubmed.ncbi.nlm.nih.gov/16221198/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Nguyen-Kurtz
                                </a>
                            </h6>
                            <BlockMath
                                math={`Na_{2} = \\frac{(Na_{1} + 23.8) \\cdot TBW + 1.03 \\cdot E_{MB}}{TBW + V_{\\Delta}} - 23.8`}
                            />

                            <hr />

                            <h6>Barsoum-Levine</h6>
                            <BlockMath
                                math={`Na_{2} = \\frac{(Na_{1}) \\cdot TBW + E_{MB}}{TBW + V_{\\Delta}}`}
                            />

                            <hr />

                            <p className="small mb-0">
                                Legends: <br />
                                Na<sub>1</sub> = initial plasma sodium (meq/L)
                                <br />
                                TBW = total body water (L)
                                <br />
                                E<sub>MB</sub> = E<sub>input</sub> - E<sub>output</sub>
                                <br />
                                E<sub>input</sub> = Σ[(Na + K) × input volume (L)]
                                <br />
                                E<sub>output</sub> = Σ[(Na + K) × output volume (L)]
                                <br />
                                V<sub>Δ</sub> = net volume change (L)
                                <br />
                                Na<sub>2</sub> = predicted final plasma sodium (meq/L)
                                <br />
                                Na<sub>change</sub> = Na<sub>2</sub> - Na<sub>1</sub>
                            </p>
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

export default SodiumChangeCalculator;
