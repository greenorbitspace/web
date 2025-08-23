import { motion } from "framer-motion";

export default function InteractiveMapPreview({ title, description, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer bg-gradient-to-br from-indigo-600 to-blue-500 p-6 rounded-2xl shadow-lg text-white"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm opacity-80 mt-2">{description}</p>
      <p className="mt-4 text-sm font-medium">Click to explore →</p>
    </motion.div>
  );
}