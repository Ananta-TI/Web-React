import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Award, Folder, ScanText, Palette } from 'lucide-react';

const GooeyNav = ({
  items,
  isDarkMode,
  onNavigate,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = element => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, ${isDarkMode ? 'white' : 'black'})`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    // Extract only text, ignore icons/dropdowns inside the element
    textRef.current.innerText = element.childNodes[0].innerText || element.innerText;
  };

  const handleClick = (e, index, item) => {
    const buttonEl = e.currentTarget;
    
    // Action Logic
    if (item.isDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setIsDropdownOpen(false);
      onNavigate(item.link);
    }

    // Animation Logic
    if (activeIndex === index) return;
    setActiveIndex(index);
    updateEffectPosition(buttonEl);
    
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    // Find the actual button inside the li to measure
    const activeBtn = navRef.current.querySelectorAll('button.nav-btn')[activeIndex];
    if (activeBtn) {
      updateEffectPosition(activeBtn);
      textRef.current?.classList.add('active');
    }
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveBtn = navRef.current?.querySelectorAll('button.nav-btn')[activeIndex];
      if (currentActiveBtn) {
        updateEffectPosition(currentActiveBtn);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  // CSS Dynamic Variables based on Theme
  const gooeyBg = isDarkMode ? '#000000' : '#ffffff';
  const gooeyPill = isDarkMode ? '#ffffff' : '#000000';
  const gooeyBlend = isDarkMode ? 'lighten' : 'darken';
  const textInactive = isDarkMode ? '#a1a1aa' : '#52525b'; // zinc-400 : zinc-600
  const textActive = isDarkMode ? '#000000' : '#ffffff';

  return (
    <>
      <style>
        {`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
            font-size: 0.875rem; /* text-sm */
            font-weight: 700; /* font-bold */
            text-transform: uppercase;
            letter-spacing: 0.1em; /* tracking-widest */
          }
          .effect.text {
            color: ${textInactive};
            transition: color 0.3s ease;
          }
          .effect.text.active {
            color: ${textActive};
          }
          .effect.filter {
            filter: blur(7px) contrast(100) blur(0);
            mix-blend-mode: ${gooeyBlend};
          }
          .effect.filter::before {
            content: "";
            position: absolute;
            inset: -75px;
            z-index: -2;
            background: ${gooeyBg};
          }
          .effect.filter::after {
            content: "";
            position: absolute;
            inset: 0;
            background: ${gooeyPill};
            transform: scale(0);
            opacity: 0;
            z-index: -1;
            border-radius: 9999px;
          }
          .effect.active::after {
            animation: pill 0.3s ease both;
          }
          @keyframes pill {
            to { transform: scale(1); opacity: 1; }
          }
          .particle, .point {
            display: block;
            opacity: 0;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            transform-origin: center;
          }
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          @keyframes particle {
            0% { transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y))); opacity: 1; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
            70% { transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)); opacity: 1; animation-timing-function: ease; }
            85% { transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y))); opacity: 1; }
            100% { transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)); opacity: 1; }
          }
          @keyframes point {
            0% { transform: scale(0); opacity: 0; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
            25% { transform: scale(calc(var(--scale) * 0.25)); }
            38% { opacity: 1; }
            65% { transform: scale(var(--scale)); opacity: 1; animation-timing-function: ease; }
            85% { transform: scale(var(--scale)); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          button.nav-btn.active {
            color: ${textActive};
            text-shadow: none;
          }
          button.nav-btn.active::after {
            opacity: 1;
            transform: scale(1);
          }
          button.nav-btn::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background: ${gooeyPill};
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }
        `}
      </style>
      <div className="relative" ref={containerRef}>
        <nav className="flex relative items-center justify-center" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-4 md:gap-8 list-none p-0 m-0 relative z-[3] items-center"
            style={{ color: textInactive }}
          >
            {items.map((item, index) => (
              <li key={index} className="relative">
                <button
                  onClick={e => handleClick(e, index, item)}
                  className={`nav-btn cursor-none cursor-target outline-none py-2 px-4 rounded-full relative transition-colors duration-300 ease flex items-center gap-1 text-sm font-bold uppercase tracking-widest ${
                    activeIndex === index ? 'active' : ''
                  }`}
                >
                  {item.label}
                  {item.isDropdown && (
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`} />
                  )}
                </button>

                {/* Dropdown Showcase */}
                <AnimatePresence>
                  {item.isDropdown && isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-[120%] left-1/2 -translate-x-1/2 mt-2 w-48 py-2 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg ${
                        isDarkMode ? "bg-zinc-800/90 border border-zinc-700/50" : "bg-white/90 border border-gray-200/50"
                      }`}
                    >
                      {/* Mapping dinamis dari props subItems */}
                      {item.subItems?.map((sub) => (
                        <button
                          key={sub.name}
                          onClick={() => {
                            onNavigate(sub.link);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between w-full text-left px-5 py-3 text-sm font-bold tracking-wider cursor-none cursor-target transition-colors ${
                            isDarkMode 
                              ? "text-zinc-300 hover:bg-zinc-700/50 hover:text-white" 
                              : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                          }`}
                        >
                          <span>{sub.name}</span>
                          {sub.icon}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;