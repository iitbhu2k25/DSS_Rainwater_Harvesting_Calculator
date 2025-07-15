'use client';

import React, { useState } from 'react';

export default function RainwaterCalculator() {
  const [roofType, setRoofType] = useState('');
  const [area, setArea] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [areaUnit, setAreaUnit] = useState('m2');
  const [n, setN] = useState('5');
  const [q, setQ] = useState('20');
  const [volume, setVolume] = useState<number | null>(null);
  const [dryDays, setDryDays] = useState<number | null>(null);

  const generateOptions = (start: number, end: number, step: number) => {
    const options = [];
    for (let i = start; i <= end; i += step) {
      options.push(i);
    }
    return options;
  };

  const areaOptions = generateOptions(50, 1000, 50);
  const rainfallOptions = generateOptions(50, 2000, 50);

  const handleCalculate = () => {
    const Cr = roofType === 'slope' ? 0.95 : roofType === 'flats' ? 0.8 : 0;
    let A = parseFloat(area);
    const R = parseFloat(rainfall);
    const Ce = 0.95;
    const numPeople = parseFloat(n);
    const demandPerPerson = parseFloat(q);

    if (!A || !R || !Cr) {
      setVolume(null);
      setDryDays(null);
      return;
    }

    if (areaUnit === 'ft2') {
      A = A * 0.092903; // Convert ft² to m²
    }

    const V = A * R * Cr * Ce * 0.001;
    setVolume(V);

    // Calculate dry days: V (in L) = r * n * q → r = V * 1000 / (n * q)
    if (numPeople && demandPerPerson) {
      const r = (V * 1000) / (numPeople * demandPerPerson);
      setDryDays(r);
    } else {
      setDryDays(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 mb-6 bg-white rounded-2xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">Rainwater Harvesting Calculator</h1>

      {/* Area, Area Unit, and Rainfall in one row */}
      <div className="flex flex-wrap gap-4">
        {/* Area */}
        <div className="flex-1 min-w-[120px]">
          <label className="block font-medium">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="">Select Area</option>
            {areaOptions.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        {/* Area Unit */}
        <div className="w-24">
          <label className="block font-medium">Unit</label>
          <select
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="m2">m²</option>
            <option value="ft2">ft²</option>
          </select>
        </div>

        {/* Rainfall */}
        <div className="flex-1 min-w-[120px]">
          <label className="block font-medium">Rainfall (mm)</label>
          <select
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="">Select Rainfall</option>
            {rainfallOptions.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooftop Type Dropdown */}
      <div className="space-y-2">
        <label className="block font-medium">Rooftop Type</label>
        <select
          value={roofType}
          onChange={(e) => setRoofType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
        >
          <option value="">Select Rooftop</option>
          <option value="slope">Slope (0.95)</option>
          <option value="flats">Flats (0.8)</option>
        </select>
      </div>

      {/* People and Demand Inputs */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Household Users</label>
          <select
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="5">5</option>
            <option value="5.5">5.5</option>
            <option value="6">6</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block font-medium">Per Person Demand in L/day</label>
          <input
            type="number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            min={1}
          />
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center">
        <button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
        >
          Calculate
        </button>
      </div>

      {/* Result Display */}
      {volume !== null && (
        <div className="space-y-2 text-center">
          <div className="text-xl font-semibold text-green-700">
            The Volume is {volume.toFixed(1)} m³ ({(volume * 1000).toFixed(0)} L)
          </div>
          {dryDays !== null && (
            <div className="text-md font-medium text-indigo-700">
              Supply for estimated dry days = {dryDays.toFixed(1)} days
            </div>
          )}
        </div>
      )}
    </div>
  );
}
