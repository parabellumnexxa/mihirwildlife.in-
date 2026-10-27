import React from "react";

// Safe line-by-line render for headings — guarantees 100% visibility on all devices and scroll systems
export const RevealLines = ({ lines = [], className = "", testId }) => {
  return (
    <span data-testid={testId} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </span>
  );
};

// Safe wrapper that guarantees visibility with clean layout
export const Reveal = ({ children, className = "", testId }) => (
  <div data-testid={testId} className={className}>
    {children}
  </div>
);

// Safe heading lines in view — always visible, no blank spaces on any page
export const RevealLinesInView = ({ lines = [], className = "", testId }) => (
  <span data-testid={testId} className={className}>
    {lines.map((line, i) => (
      <span key={i} className="block">
        {line}
      </span>
    ))}
  </span>
);
