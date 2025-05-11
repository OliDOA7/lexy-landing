
import Link from 'next/link';

const AppLogo = () => {
  // Icon dimensions and properties for viewBox
  const iconWidth = 38;
  const iconHeight = 38;
  const iconRadius = iconWidth * 0.25; // Corner radius for the icon

  // Text positioning and sizes for viewBox
  const textLexyX = iconWidth + 10; // Start Lexy text to the right of icon
  const textLexySize = 28;
  const textPoweredBySize = 9;
  
  // Overall SVG viewBox dimensions
  const svgViewBoxWidth = 145; // Defines the coordinate system for the drawing
  const svgViewBoxHeight = 50;  // Defines the coordinate system for the drawing

  // Calculate vertical alignment to center the "Lexy" text and icon body within the viewBox
  const lexyTextYBaseline = svgViewBoxHeight / 2 + textLexySize / 3; // Approximate optical center
  const iconYOffset = lexyTextYBaseline - iconHeight / 2 - 2; // Align icon center with Lexy's optical center, adjust for baseline
  const poweredByTextY = lexyTextYBaseline + textLexySize / 2 + textPoweredBySize / 2 - 2;


  return (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
      <svg
        width={350} 
        height={500}
        viewBox={`0 0 ${svgViewBoxWidth} ${svgViewBoxHeight}`} // Internal coordinate system
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Lexy powered by HOW2 Studio"
        preserveAspectRatio="xMidYMid meet" // Ensures aspect ratio is maintained and logo fits
      >
        {/* Icon Group */}
        <g transform={`translate(0, ${iconYOffset})`}>
          <defs>
            <clipPath id="lexyIconClip">
              {/* Approximated path for the speech bubble/pin icon shape */}
              <path d={`M${iconRadius} 0 
                         H${iconWidth - iconRadius} 
                         A${iconRadius} ${iconRadius} 0 0 1 ${iconWidth} ${iconRadius} 
                         V${iconHeight - iconRadius} 
                         A${iconRadius} ${iconRadius} 0 0 1 ${iconWidth - iconRadius} ${iconHeight} 
                         H${iconWidth * 0.45} 
                         L${iconWidth * 0.2} ${iconHeight + iconHeight * 0.15} 
                         L${iconWidth * 0.3} ${iconHeight} 
                         H${iconRadius} 
                         A${iconRadius} ${iconRadius} 0 0 1 0 ${iconHeight - iconRadius} 
                         V${iconRadius} 
                         A${iconRadius} ${iconRadius} 0 0 1 ${iconRadius} 0 Z`} />
            </clipPath>
          </defs>
          
          {/* Apply clipping to the group of colored parts for the sharp diagonal effect */}
          <g clipPath="url(#lexyIconClip)">
            {/* Purple part (covers top-left half of the bounding box) */}
            <path d={`M0,0 L${iconWidth},0 L0,${iconHeight} Z`} fill="hsl(var(--primary))" />
            {/* Orange part (covers bottom-right half of the bounding box) */}
            <path d={`M${iconWidth},0 L${iconWidth},${iconHeight} L0,${iconHeight} Z`} fill="hsl(var(--secondary))" />
          </g>
        </g>

        {/* Text "Lexy" */}
        <text
          x={textLexyX}
          y={lexyTextYBaseline} 
          fontFamily="var(--font-sans, Arial, Helvetica, sans-serif)"
          fontSize={textLexySize}
          fontWeight="bold"
          fill="hsl(var(--primary-foreground))"
        >
          Lexy
        </text>

        {/* Text "powered by HOW2 STUDIO" */}
        <text
          x={textLexyX + 32} // Moved 32 pixels to the right
          y={poweredByTextY} 
          fontFamily="var(--font-sans, Arial, Helvetica, sans-serif)"
          fontSize={textPoweredBySize}
          fill="hsl(var(--primary-foreground))"
        >
          powered by <tspan fontWeight="bold" fill="hsl(var(--secondary))">HOW2</tspan> <tspan fontWeight="bold" fill="hsl(var(--accent))">STUDIO</tspan>
        </text>
      </svg>
    </Link>
  );
};

export default AppLogo;
    
