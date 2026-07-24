import { useMemo, useState } from "react";
import "./InteractiveGridPattern.css";

/** Magic UI–style interactive squares; styled for the CMS auth shell. */
export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className = "",
}) {
  const [horizontal, vertical] = squares;
  const [hoveredSquare, setHoveredSquare] = useState(null);

  const cells = useMemo(
    () => Array.from({ length: horizontal * vertical }, (_, index) => index),
    [horizontal, vertical],
  );

  const svgW = width * horizontal;
  const svgH = height * vertical;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      className={`interactive-grid ${className}`.trim()}
      aria-hidden="true"
    >
      {cells.map((index) => {
        const x = (index % horizontal) * width;
        const y = Math.floor(index / horizontal) * height;
        const hovered = hoveredSquare === index;
        return (
          <rect
            key={index}
            x={x + 0.5}
            y={y + 0.5}
            width={width - 1}
            height={height - 1}
            rx={1}
            className={[
              "interactive-grid__cell",
              hovered ? "interactive-grid__cell--hovered" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onMouseEnter={() => setHoveredSquare(index)}
            onMouseLeave={() => setHoveredSquare(null)}
          />
        );
      })}
    </svg>
  );
}
