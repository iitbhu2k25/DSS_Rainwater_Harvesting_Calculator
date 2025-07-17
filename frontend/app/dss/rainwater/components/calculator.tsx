"use client";

import React, { useEffect, useState } from "react";
import { MultiSelect } from "@/app/dss/basic/components/Multiselect";

interface LocationItem {
  id: number;
  name: string;
}

interface District extends LocationItem {
  stateId: number;
}

interface SubDistrict extends LocationItem {
  districtId: number;
  districtName: string;
}

export default function Calculator() {
  const [roofType, setRoofType] = useState("");
  const [roofSurface, setRoofSurface] = useState("");
  const [area, setArea] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [personCount, setPersonCount] = useState("5");
  const [waterDemand, setWaterDemand] = useState("20");
  const [volume, setVolume] = useState<number | null>(null);
  const [dryDays, setDryDays] = useState<number | null>(null);

  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSubDistricts, setSelectedSubDistricts] = useState<string[]>([]);
  const [selectionsLocked, setSelectionsLocked] = useState<boolean>(false);

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
    const Cr = roofType === "slope" ? 0.95 : roofType === "flats" ? 0.8 : 0;
    let A = parseFloat(area);
    const R = parseFloat(rainfall);
    let Ce;
    const numPeople = parseFloat(personCount);
    const demandPerPerson = parseFloat(waterDemand);

    switch (roofSurface) {
      case "roof-conventional":
        Ce = 0.75;
        break;
      case "roof-inclined":
        Ce = 0.9;
        break;
      case "concrete-paving":
        Ce = 0.65;
        break;
      case "gravel":
        Ce = 0.6;
        break;
      case "brick":
        Ce = 0.7;
        break;
      default:
        Ce = 0.75;
        break;
    }

    if (!A || !R || !Cr) {
      setVolume(null);
      setDryDays(null);
      return;
    }

    if (areaUnit === "ft2") {
      A = A * 0.092903;
    }

    const V = A * R * Cr * Ce * 0.001;
    setVolume(V);

    if (numPeople && demandPerPerson) {
      const r = (V * 1000) / (numPeople * demandPerPerson);
      setDryDays(r);
    } else {
      setDryDays(null);
    }
  };

  useEffect(() => {
    const fetchStates = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:9000/api/basic/");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const stateData: LocationItem[] = data.map((state: any) => ({
          id: state.state_code,
          name: state.state_name,
        }));
        setStates(stateData);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async (): Promise<void> => {
        try {
          const response = await fetch(
            "http://localhost:9000/api/basic/district/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ state_code: selectedState }),
            }
          );
          const data = await response.json();
          const districtData: LocationItem[] = data.map((district: any) => ({
            id: district.district_code,
            name: district.district_name,
          }));
          const mappedDistricts: District[] = districtData.map((district) => ({
            ...district,
            stateId: parseInt(selectedState),
          }));
          const sortedDistricts = [...mappedDistricts].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setDistricts(sortedDistricts);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
    setSelectedSubDistricts([]);
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubDistricts = async (): Promise<void> => {
        try {
          const response = await fetch(
            "http://localhost:9000/api/basic/subdistrict/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ district_code: [selectedDistrict] }),
            }
          );
          const data = await response.json();
          const districtMap = new Map(
            districts.map((district) => [district.id.toString(), district.name])
          );
          const subDistrictData: SubDistrict[] = data.map((subDistrict: any) => {
            const districtId = subDistrict.district_code.toString();
            return {
              id: subDistrict.subdistrict_code,
              name: subDistrict.subdistrict_name,
              districtId: subDistrict.district_code,
              districtName: districtMap.get(districtId) || "",
            };
          });
          const sortedSubDistricts = subDistrictData.sort(
            (a, b) =>
              a.districtName.localeCompare(b.districtName) ||
              a.name.localeCompare(b.name)
          );
          setSubDistricts(sortedSubDistricts);
          setSelectedSubDistricts([]);
        } catch (error) {
          console.error("Error fetching sub-districts:", error);
        }
      };
      fetchSubDistricts();
    } else {
      setSubDistricts([]);
      setSelectedSubDistricts([]);
    }
  }, [selectedDistrict]);

  const formatSubDistrictDisplay = (subDistrict: SubDistrict): string => {
    return subDistrict.name;
  };

  const handleSubDistrictsChange = (newSelectedSubDistricts: string[]) => {
    setSelectedSubDistricts(newSelectedSubDistricts);
  };

  return (
    <div className="w-full h-full rounded-lg shadow-md border-2 border-gray-200 group-hover:border-blue-500 transition-colors duration-200 p-4 space-y-4 bg-white">
      <h1 className="text-2xl font-bold text-center">
        Rainwater Harvesting Calculator
      </h1>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block font-medium">State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block font-medium">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
            disabled={!selectedState}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <MultiSelect
        items={subDistricts}
        selectedItems={selectedSubDistricts}
        onSelectionChange={
          selectionsLocked
            ? () => {}
            : (newValue) => {
                setSelectedSubDistricts(newValue);
                handleSubDistrictsChange(newValue);
              }
        }
        label="Sub-District"
        placeholder="--Choose Sub-Districts--"
        disabled={selectedDistrict === "" || selectionsLocked}
        displayPattern={formatSubDistrictDisplay}
        showGroupHeaders={true}
        groupHeaderFormat="District: {groupName}"
      />

      <div className="flex flex-wrap gap-4">
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
        <div className="flex-1 min-w-[120px]">
          <label className="block font-medium">Rainfall per year (mm)</label>
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

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
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
        <div className="flex-1 min-w-[200px]">
          <label className="block font-medium">Roof Surface</label>
          <select
            value={roofSurface}
            onChange={(e) => setRoofSurface(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="">Select Roof Surface</option>
            <option value="roof-conventional">Conventional Roof</option>
            <option value="roof-inclined">Inclined Roof</option>
            <option value="concrete-paving">Concrete / Kota Paving</option>
            <option value="gravel">Gravel</option>
            <option value="brick">Brick Paving</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Household Users</label>
          <select
            value={personCount}
            onChange={(e) => setPersonCount(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md cursor-pointer"
          >
            <option value="5">5</option>
            <option value="5.5">5.5</option>
            <option value="6">6</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-medium">Per Person Demand (L/day)</label>
          <input
            type="number"
            value={waterDemand}
            onChange={(e) => setWaterDemand(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            min={1}
          />
        </div>
      </div>

      <div className="flex w-full justify-center">
        <button
          onClick={handleCalculate}
          className="bg-blue-600 w-1/2 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
        >
          Calculate
        </button>
        <button
          onClick={() => {
            setSelectedState("");
            setSelectedDistrict("");
            setSelectedSubDistricts([]);
            setArea("");
            setRainfall("");
            setVolume(null);
            setDryDays(null);
            setRoofType("");
            setRoofSurface("");
          }}
          className="ml-4 px-4 py-2 w-1/2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer"
        >
          Reset
        </button>
      </div>

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