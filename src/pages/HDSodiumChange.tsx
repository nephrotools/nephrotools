import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Config } from "../AppConfig";
import { BlockMath } from "react-katex";

const HemodialysisSodiumChangeCalculator: React.FC = () => {
    const [bloodFlowRate, setBloodFlowRate] = useState<number>(200); // mL/min
    const [duration, setDuration] = useState<number>(120); // min
    const [dialysateNa, setDialysateNa] = useState<number>(130); // mEq/L
    const [d5wVolumeMl, setD5wVolumeMl] = useState<number>(0); // mL
    const [serumNa, setSerumNa] = useState<number>(120); // mEq/L
    const [tbw, setTbw] = useState<number>(35.0); // L

    const [predictedPostNa, setPredictedPostNa] = useState<string>("0.00");
    const [predictedDeltaNa, setPredictedDeltaNa] = useState<string>("0.00");

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    }, []);

    const calculateResults = useCallback(() => {
        const Na_s = serumNa; // serum Na (mEq/L)
        const TBW = tbw; // L
        const Qb = bloodFlowRate; // mL/min
        const t = duration; // min
        const Na_d = dialysateNa; // mEq/L
        const D5W_L = d5wVolumeMl / 1000; // convert mL → L

        // 1. Baseline Na content (mEq)
        const baselineNaContent = Na_s * TBW;

        // 2. Net Na transfer across the dialyzer (mEq)
        const dialyzerVolumeL = (Qb * t) / 1000; // (mL/min * min) / 1000 = L
        const netNaFromDialysate = dialyzerVolumeL * (Na_d - Na_s);

        // 3. New Na content (mEq): (1) + (2)
        const newNaContent = baselineNaContent + netNaFromDialysate;

        // 4. New water content (L): TBW + D5W
        const newWaterContent = TBW + D5W_L;

        if (newWaterContent <= 0) {
            setPredictedPostNa("NaN");
            setPredictedDeltaNa("NaN");
            return;
        }

        // Post-HD Na and ΔNa
        const postHdNa = newNaContent / newWaterContent; // mEq/L
        const deltaNa = postHdNa - Na_s; // mEq/L

        setPredictedPostNa(postHdNa.toFixed(1));
        setPredictedDeltaNa(deltaNa.toFixed(1));
    }, [serumNa, tbw, bloodFlowRate, duration, dialysateNa, d5wVolumeMl]);

    useEffect(() => {
        calculateResults();
    }, [calculateResults]);

    return (
        <div className="container mt-2">
            <Helmet>
                <title>HD Hyponatremia Calculator - {Config.Title}</title>
            </Helmet>

            <h3 className="my-3">HD Sodium Change Calculator</h3>

            <div className="row">
                {/* Sticky Results Box */}
                <div className="col-md-4 mb-2 py-3 sticky-results border-bottom border-secondary shadow-sm">
                    <p className="my-1">Pre-HD Na: {serumNa} mEq/L</p>
                    <p className="my-1">Post-HD Na: {predictedPostNa} mEq/L</p>
                    <p className="my-1">
                        <strong>Expected ΔNa: {predictedDeltaNa} mEq/L</strong>
                    </p>
                </div>

                {/* Inputs */}
                <div className="col-md-8">
                    {/* Blood Flow Rate */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                            <label htmlFor="bloodFlowRate" className="form-label mb-0">
                                Blood Flow Rate (mL/min)
                            </label>
                            <div>
                                {[200, 250, 300, 350, 400].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2 mb-1"
                                        onClick={() => setBloodFlowRate(val)}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="bloodFlowRateSlider"
                                className="form-range me-3 px-3"
                                min={150}
                                max={800}
                                step={10}
                                value={bloodFlowRate}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setBloodFlowRate(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="bloodFlowRate"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                value={bloodFlowRate}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setBloodFlowRate(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* Duration */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                            <label htmlFor="duration" className="form-label mb-0">
                                Duration (min)
                            </label>
                            <div>
                                {[60, 120, 180, 240].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2 mb-1"
                                        onClick={() => setDuration(val)}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="durationSlider"
                                className="form-range me-3 px-3"
                                min={60}
                                max={240}
                                step={5}
                                value={duration}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setDuration(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="duration"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                value={duration}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setDuration(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* Dialysate Na */}
                    <div className="mb-3">
                        <label htmlFor="dialysateNa" className="form-label">
                            Dialysate Na (mEq/L)
                        </label>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="dialysateNaSlider"
                                className="form-range me-3 px-3"
                                min={130}
                                max={145}
                                step={1}
                                value={dialysateNa}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setDialysateNa(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="dialysateNa"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                value={dialysateNa}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setDialysateNa(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* D5W Volume */}
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                            <label htmlFor="d5wVolume" className="form-label mb-0">
                                D5W Volume (mL)
                            </label>
                            <div>
                                {[250, 500, 750, 1000].map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2 mb-1"
                                        onClick={() => setD5wVolumeMl(val)}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="d5wVolumeSlider"
                                className="form-range me-3 px-3"
                                min={0}
                                max={3000}
                                step={50}
                                value={d5wVolumeMl}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setD5wVolumeMl(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="d5wVolume"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                value={d5wVolumeMl}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setD5wVolumeMl(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* Serum Na */}
                    <div className="mb-3">
                        <label htmlFor="serumNa" className="form-label">
                            Serum Na (mEq/L)
                        </label>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="serumNaSlider"
                                className="form-range me-3 px-3"
                                min={110}
                                max={150}
                                step={1}
                                value={serumNa}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setSerumNa(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="serumNa"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                value={serumNa}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    setSerumNa(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>

                    <hr />

                    {/* TBW */}
                    <div className="mb-3">
                        <label htmlFor="tbw" className="form-label">
                            Total Body Water (TBW) (L)
                        </label>
                        <div className="d-flex align-items-center">
                            <input
                                type="range"
                                id="tbwSlider"
                                className="form-range me-3 px-3"
                                min={20}
                                max={80}
                                step={0.1}
                                value={tbw}
                                onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    setTbw(Number.isNaN(v) ? 0 : v);
                                }}
                            />
                            <input
                                type="number"
                                id="tbw"
                                className="form-control text-center"
                                style={{ width: "100px" }}
                                step={0.1}
                                value={tbw}
                                onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    setTbw(Number.isNaN(v) ? 0 : v);
                                }}
                                onFocus={handleFocus}
                            />
                        </div>
                    </div>
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
                aria-hidden={true}
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
                            <BlockMath
                                math={`
                  \\text{Post-HD }[\\text{Na}] =
                `}
                            />
                            <BlockMath
                                math={`
                  \\frac{
                    [\\text{Na}]_s \\cdot \\text{TBW}
                    +
                    \\left(
                      Q_b \\cdot t
                    \\right)
                    \\cdot
                    \\big( [\\text{Na}]_d - [\\text{Na}]_s \\big)
                  }{
                    \\text{TBW} + \\text{D5W}
                  }
                `}
                            />
                            <hr />

                            <p className="small">
                                [Na]<sub>s</sub> = serum sodium (mEq/L)
                                <br />
                                [Na]<sub>d</sub> = dialysate sodium (mEq/L)
                                <br />
                                Q<sub>b</sub> = blood flow rate L/min (mL/min ÷ 1000)
                                <br />
                                t = dialysis duration (min)
                                <br />
                                TBW = total body water (L)
                                <br />
                                D5W = D5W volume in liters (D5W mL ÷ 1000)
                                <br />
                            </p>

                            <hr />
                            <p className="small">
                                A deliberate decision was made to use the blood flow rate rather
                                than the plasma flow rate to provide an additional margin of
                                safety against overcorrection. It is acknowledged, however, that
                                the plasma flow rate would offer greater physiological accuracy.
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

export default HemodialysisSodiumChangeCalculator;
