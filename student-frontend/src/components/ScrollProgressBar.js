import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "framer-motion";
import React from "react";

export default function ScrollProgressBar({
  type = "circle",
  position = "bottom-right",
  color = "#3b82f6",
  strokeSize = 2,
  showPercentage = false,
}) {
  const { scrollYProgress } = useScroll();

  const scrollPercentage = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const [percentage, setPercentage] = React.useState(0);

  useMotionValueEvent(scrollPercentage, "change", (latest) => {
    setPercentage(Math.round(latest));
  });

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
  };

  if (type === "bar") {
    return (
      <div
        className="fixed start-0 end-0 top-0 pointer-events-none z-50"
        style={{ height: `${strokeSize + 2}px` }}
      >
        <span
          className="h-full w-full block transition-all duration-300"
          style={{
            backgroundColor: color,
            width: `${percentage}%`,
          }}
        ></span>
      </div>
    );
  }

  return (
    <div
      className={`fixed flex items-center justify-center z-50 pointer-events-none ${positionClasses[position]}`}
    >
      {percentage > 0 && (
        <>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="rgba(200, 200, 200, 0.2)"
              strokeWidth={strokeSize}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              pathLength="1"
              stroke={color}
              fill="none"
              strokeDashoffset="0"
              strokeWidth={strokeSize}
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          {showPercentage && (
            <span className="text-sm absolute font-semibold" style={{ color }}>
              {percentage}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
