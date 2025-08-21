import React from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const OrbitImpactSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  width = 700,
  height = 500,
  metrics = [],
}) => {
  return (
    <div className="relative mx-auto" style={{ width, height }}>
      {/* Slider */}
      <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={beforeImage} alt={beforeLabel} />}
        itemTwo={<ReactCompareSliderImage src={afterImage} alt={afterLabel} />}
        handle={
          <div
            className="bg-green-500 w-2 h-full cursor-ew-resize rounded-full shadow-lg"
          />
        }
      />

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {beforeLabel}
      </div>
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
        {afterLabel}
      </div>

      {/* Metrics Overlay */}
      {metrics.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          {metrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="font-bold">{metric.value}</div>
              <div className="text-sm">{metric.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrbitImpactSlider;