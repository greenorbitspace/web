import React from "react";
import { useNavigate } from "@astrojs/react";

// Props: text, link, icon, bgColor, hoverColor, textColor
const CTA = ({ text, link, Icon, bgColor = "bg-green-600", hoverColor = "hover:bg-green-700", textColor = "text-white" }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`${bgColor} ${hoverColor} ${textColor} px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200`}
      onClick={() => navigate(link)}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {text}
    </button>
  );
};

export default CTA;