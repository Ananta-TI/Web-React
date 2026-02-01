import React from 'react';
import { motion } from 'framer-motion';

const MergedShape = ({
  fill = "#ffffff",
  startAnimation = false,
  style: containerStyle,
  ...props
}) => {
  const drawables = [
    { type: 'div', left: 0, top: 20, width: 60, height: 280, borderRadius: "32px", dir: "bt" }, 
    { type: 'svg', left: 60, top: 38, viewBox: "0 0 32 32", path: "M 0 0 C 0 23.872 5.76 32 32 32 H 0 Z" },
    { type: 'div', left: 60, top: 70, width: 80, height: 50, dir: "lr" }, 
    { type: 'svg', left: 60, top: 120, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 140, top: 70, width: 60, height: 230, borderRadius: "0 32px 32px 32px", dir: "tb" },
    { type: 'svg', left: 108, top: 120, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" },
    { type: 'div', left: 70, top: 0, width: 330, height: 50, borderRadius: "32px", dir: "lr" },
    { type: 'div', left: 220, top: 50, width: 60, height: 280, borderRadius: "0 0 32px 32px", dir: "tb" },
    { type: 'svg', left: 188, top: 50, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" },
    { type: 'div', left: 300, top: 70, width: 60, height: 230, borderRadius: "32px 0 32px 32px", dir: "bt" },
    { type: 'svg', left: 280, top: 50, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 360, top: 70, width: 80, height: 60, dir: "lr" },
    { type: 'svg', left: 360, top: 130, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 440, top: 70, width: 60, height: 230, borderRadius: "0 32px 32px 32px", dir: "tb" },
    { type: 'svg', left: 408, top: 130, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" },
    { type: 'div', left: 370, top: 180, width: 60, height: 60, borderRadius: "32px", dir: "scale" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, 
        transition: {delayChildren: 1, staggerChildren: 0.12 }
     }
  };

  const getVariants = (dir) => {
    switch (dir) {
      case "bt": return { hidden: { scaleY: 0, originY: 1 }, visible: { scaleY: 1 } };
      case "tb": return { hidden: { scaleY: 0, originY: 0 }, visible: { scaleY: 1 } };
      case "lr": return { hidden: { scaleX: 0, originX: 0 }, visible: { scaleX: 1 } };
      case "scale": return { hidden: { scale: 0 }, visible: { scale: 1 } };
      default: return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={startAnimation ? "visible" : "hidden"}
      style={{ position: "relative", width: 500, height: 330, ...containerStyle }}
      {...props}
    >
      {drawables.map((item, i) => (
        item.type === 'div' ? (
          <motion.div
            key={i}
            variants={getVariants(item.dir)}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute", backgroundColor: fill, left: item.left, top: item.top,
              width: item.width, height: item.height, borderRadius: item.borderRadius,
            }}
          />
        ) : (
          <motion.svg
            key={i}
            variants={getVariants('opacity')}
            style={{ position: "absolute", left: item.left, top: item.top, width: 32, height: 32 }}
            viewBox={item.viewBox}
          >
            <motion.path d={item.path} fill={fill} style={{ transition: 'fill 0.5s ease' }} />
          </motion.svg>
        )
      ))}
    </motion.div>
  );
};

export default MergedShape;