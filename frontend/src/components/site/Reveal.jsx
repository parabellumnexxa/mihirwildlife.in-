import { motion } from "framer-motion";

// Line-by-line masked reveal for headings
export const RevealLines = ({ lines = [], className = "", delay = 0, testId }) => {
  return (
    <span data-testid={testId} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 1,
              delay: delay + i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// whileInView fade+rise wrapper
export const Reveal = ({ children, className = "", delay = 0, y = 40, testId }) => (
  <motion.div
    data-testid={testId}
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Line-by-line reveal that triggers on scroll into view
export const RevealLinesInView = ({ lines = [], className = "", testId }) => (
  <span data-testid={testId} className={className}>
    {lines.map((line, i) => (
      <span key={i} className="line-mask">
        <motion.span
          className="block"
          initial={{ y: "110%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);
