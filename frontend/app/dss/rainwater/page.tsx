"use client";

import Calculator from "./components/calculator";
import MapComponent from "./components/map";

const Rainwater: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen p-4 gap-4 bg-gray-100">
      <div className="md:w-1/2 w-full h-full flex items-stretch group mx-10">
        <Calculator />
      </div>
      <div className="md:w-1/2 w-full h-[60vh] flex items-stretch group">
        <MapComponent />
      </div>
    </div>
  );
};

export default Rainwater;