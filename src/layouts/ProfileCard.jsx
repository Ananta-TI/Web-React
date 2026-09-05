import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import "./ProfileCard.css";

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)";

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#525252 0%,#313131 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1300,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (
  value,
  min = 0,
  max = 100
) => Math.min(Math.max(value, min), max);

const round = (
  value,
  precision = 3
) => parseFloat(value.toFixed(precision));

const adjust = (
  value,
  fromMin,
  fromMax,
  toMin,
  toMax
) =>
  round(
    toMin +
      ((toMax - toMin) *
        (value - fromMin)) /
        (fromMax - fromMin)
  );

const easeInOutCubic = (x) =>
  x < 0.5
    ? 4 * x * x * x
    : 1 -
      Math.pow(-2 * x + 2, 3) /
        2;

const ProfileCardComponent = ({
  avatarUrl = "../img/me.png",
  iconUrl = "../img/logo123.png",
  grainUrl = "",

  behindGradient,
  innerGradient,

  showBehindGradient = false,

  className = "",

  enableTilt = true,
  enableMobileTilt = true,

  mobileTiltSensitivity = 5,

  miniAvatarUrl,

  name = "Ananta Firdaus",
  title = "Software Engineer",
  handle = "Ananta-TI",
  status = "Online",
  contactText = "Contact",

  showUserInfo = true,

  onContactClick,
}) => {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  const pointerRafRef = useRef(null);
  const animationRafRef = useRef(null);

  const rectRef = useRef(null);

  const pointerRef = useRef({
    x: 0,
    y: 0,
  });

  const targetPointerRef = useRef({
    x: 0,
    y: 0,
  });

  const hoveringRef = useRef(false);

  const orientationEnabledRef =
    useRef(false);

  // ─────────────────────────────────────────────
  // UPDATE TRANSFORM
  // ─────────────────────────────────────────────

  const updateCardTransform =
    useCallback(
      (
        offsetX,
        offsetY,
        card,
        wrap
      ) => {
        if (!card || !wrap) return;

        const width =
          card.clientWidth;

        const height =
          card.clientHeight;

        if (!width || !height) {
          return;
        }

        const percentX =
          clamp(
            (100 / width) *
              offsetX
          );

        const percentY =
          clamp(
            (100 / height) *
              offsetY
          );

        const centerX =
          percentX - 50;

        const centerY =
          percentY - 50;

        const pointerFromCenter =
          clamp(
            Math.hypot(
              percentY - 50,
              percentX - 50
            ) / 50,
            0,
            1
          );

        wrap.style.setProperty(
          "--pointer-x",
          `${round(percentX)}%`
        );

        wrap.style.setProperty(
          "--pointer-y",
          `${round(percentY)}%`
        );

        wrap.style.setProperty(
          "--background-x",
          `${adjust(
            percentX,
            0,
            100,
            35,
            65
          )}%`
        );

        wrap.style.setProperty(
          "--background-y",
          `${adjust(
            percentY,
            0,
            100,
            35,
            65
          )}%`
        );

        wrap.style.setProperty(
          "--pointer-from-center",
          `${pointerFromCenter}`
        );

        wrap.style.setProperty(
          "--pointer-from-top",
          `${percentY / 100}`
        );

        wrap.style.setProperty(
          "--pointer-from-left",
          `${percentX / 100}`
        );

        wrap.style.setProperty(
          "--rotate-x",
          `${round(
            -(centerX / 5)
          )}deg`
        );

        wrap.style.setProperty(
          "--rotate-y",
          `${round(
            centerY / 4
          )}deg`
        );
      },
      []
    );

  // ─────────────────────────────────────────────
  // CANCEL RETURN / INITIAL ANIMATION
  // ─────────────────────────────────────────────

  const cancelSmoothAnimation =
    useCallback(() => {
      if (
        animationRafRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationRafRef.current
        );

        animationRafRef.current =
          null;
      }
    }, []);

  // ─────────────────────────────────────────────
  // SMOOTH RETURN
  // ─────────────────────────────────────────────

  const createSmoothAnimation =
    useCallback(
      (
        duration,
        startX,
        startY,
        card,
        wrap
      ) => {
        if (!card || !wrap) return;

        cancelSmoothAnimation();

        const targetX =
          card.clientWidth / 2;

        const targetY =
          card.clientHeight / 2;

        const startTime =
          performance.now();

        const animate = (
          currentTime
        ) => {
          if (
            hoveringRef.current
          ) {
            animationRafRef.current =
              null;

            return;
          }

          const elapsed =
            currentTime -
            startTime;

          const progress =
            clamp(
              elapsed /
                duration,
              0,
              1
            );

          const eased =
            easeInOutCubic(
              progress
            );

          const currentX =
            adjust(
              eased,
              0,
              1,
              startX,
              targetX
            );

          const currentY =
            adjust(
              eased,
              0,
              1,
              startY,
              targetY
            );

          pointerRef.current = {
            x: currentX,
            y: currentY,
          };

          updateCardTransform(
            currentX,
            currentY,
            card,
            wrap
          );

          if (progress < 1) {
            animationRafRef.current =
              requestAnimationFrame(
                animate
              );
          } else {
            animationRafRef.current =
              null;
          }
        };

        animationRafRef.current =
          requestAnimationFrame(
            animate
          );
      },
      [
        cancelSmoothAnimation,
        updateCardTransform,
      ]
    );

  // ─────────────────────────────────────────────
  // POINTER ENTER
  // ─────────────────────────────────────────────

  const handlePointerEnter =
    useCallback(
      (event) => {
        if (!enableTilt) return;

        if (
          event.pointerType ===
          "touch"
        ) {
          return;
        }

        const card =
          cardRef.current;

        const wrap =
          wrapRef.current;

        if (!card || !wrap) {
          return;
        }

        hoveringRef.current =
          true;

        cancelSmoothAnimation();

        const rect =
          card.getBoundingClientRect();

        rectRef.current =
          rect;

        const x =
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;

        pointerRef.current = {
          x,
          y,
        };

        targetPointerRef.current = {
          x,
          y,
        };

        updateCardTransform(
          x,
          y,
          card,
          wrap
        );

        wrap.classList.add(
          "active"
        );

        card.classList.add(
          "active"
        );
      },
      [
        enableTilt,
        cancelSmoothAnimation,
        updateCardTransform,
      ]
    );

  // ─────────────────────────────────────────────
  // POINTER MOVE
  // ─────────────────────────────────────────────

  const handlePointerMove =
    useCallback(
      (event) => {
        if (!enableTilt) return;

        if (
          event.pointerType ===
          "touch"
        ) {
          return;
        }

        if (
          !hoveringRef.current
        ) {
          return;
        }

        const card =
          cardRef.current;

        const wrap =
          wrapRef.current;

        const rect =
          rectRef.current;

        if (
          !card ||
          !wrap ||
          !rect
        ) {
          return;
        }

        targetPointerRef.current = {
          x:
            event.clientX -
            rect.left,

          y:
            event.clientY -
            rect.top,
        };

        if (
          pointerRafRef.current !==
          null
        ) {
          return;
        }

        pointerRafRef.current =
          requestAnimationFrame(
            () => {
              const {
                x,
                y,
              } =
                targetPointerRef.current;

              pointerRef.current = {
                x,
                y,
              };

              updateCardTransform(
                x,
                y,
                card,
                wrap
              );

              pointerRafRef.current =
                null;
            }
          );
      },
      [
        enableTilt,
        updateCardTransform,
      ]
    );

  // ─────────────────────────────────────────────
  // POINTER LEAVE
  // ─────────────────────────────────────────────

  const handlePointerLeave =
    useCallback(() => {
      if (!enableTilt) return;

      const card =
        cardRef.current;

      const wrap =
        wrapRef.current;

      if (!card || !wrap) {
        return;
      }

      hoveringRef.current =
        false;

      rectRef.current =
        null;

      if (
        pointerRafRef.current !==
        null
      ) {
        cancelAnimationFrame(
          pointerRafRef.current
        );

        pointerRafRef.current =
          null;
      }

      const {
        x,
        y,
      } =
        pointerRef.current;

      wrap.classList.remove(
        "active"
      );

      card.classList.remove(
        "active"
      );

      createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        x,
        y,
        card,
        wrap
      );
    },
    [
      enableTilt,
      createSmoothAnimation,
    ]
  );

  // ─────────────────────────────────────────────
  // MOBILE TILT
  // ─────────────────────────────────────────────

  const handleDeviceOrientation =
    useCallback(
      (event) => {
        if (
          !enableMobileTilt
        ) {
          return;
        }

        const card =
          cardRef.current;

        const wrap =
          wrapRef.current;

        if (!card || !wrap) {
          return;
        }

        const {
          beta,
          gamma,
        } = event;

        if (
          beta == null ||
          gamma == null
        ) {
          return;
        }

        const x =
          card.clientWidth / 2 +
          gamma *
            mobileTiltSensitivity;

        const y =
          card.clientHeight / 2 +
          (beta -
            ANIMATION_CONFIG.DEVICE_BETA_OFFSET) *
            mobileTiltSensitivity;

        if (
          pointerRafRef.current !==
          null
        ) {
          return;
        }

        pointerRafRef.current =
          requestAnimationFrame(
            () => {
              updateCardTransform(
                x,
                y,
                card,
                wrap
              );

              pointerRafRef.current =
                null;
            }
          );
      },
      [
        enableMobileTilt,
        mobileTiltSensitivity,
        updateCardTransform,
      ]
    );

  // ─────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!enableTilt) return;

    const card =
      cardRef.current;

    const wrap =
      wrapRef.current;

    if (!card || !wrap) {
      return;
    }

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    const centerX =
      card.clientWidth / 2;

    const centerY =
      card.clientHeight / 2;

    pointerRef.current = {
      x: centerX,
      y: centerY,
    };

    targetPointerRef.current = {
      x: centerX,
      y: centerY,
    };

    if (reduceMotion) {
      updateCardTransform(
        centerX,
        centerY,
        card,
        wrap
      );
    } else {
      const initialX =
        Math.max(
          0,
          wrap.clientWidth -
            ANIMATION_CONFIG.INITIAL_X_OFFSET
        );

      const initialY =
        Math.min(
          wrap.clientHeight,
          ANIMATION_CONFIG.INITIAL_Y_OFFSET
        );

      hoveringRef.current =
        false;

      updateCardTransform(
        initialX,
        initialY,
        card,
        wrap
      );

      createSmoothAnimation(
        ANIMATION_CONFIG.INITIAL_DURATION,
        initialX,
        initialY,
        card,
        wrap
      );
    }

    const enableOrientation =
      () => {
        if (
          orientationEnabledRef.current
        ) {
          return;
        }

        orientationEnabledRef.current =
          true;

        window.addEventListener(
          "deviceorientation",
          handleDeviceOrientation,
          {
            passive: true,
          }
        );
      };

    const handleClick =
      async () => {
        if (
          !enableMobileTilt
        ) {
          return;
        }

        if (
          window.location.protocol !==
          "https:"
        ) {
          return;
        }

        if (
          orientationEnabledRef.current
        ) {
          return;
        }

        try {
          if (
            typeof DeviceOrientationEvent !==
              "undefined" &&
            typeof DeviceOrientationEvent.requestPermission ===
              "function"
          ) {
            const permission =
              await DeviceOrientationEvent.requestPermission();

            if (
              permission ===
              "granted"
            ) {
              enableOrientation();
            }
          } else {
            enableOrientation();
          }
        } catch (error) {
          console.warn(
            "Device orientation permission failed:",
            error
          );
        }
      };

    card.addEventListener(
      "pointerenter",
      handlePointerEnter,
      {
        passive: true,
      }
    );

    card.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );

    card.addEventListener(
      "pointerleave",
      handlePointerLeave,
      {
        passive: true,
      }
    );

    if (enableMobileTilt) {
      card.addEventListener(
        "click",
        handleClick
      );
    }

    return () => {
      card.removeEventListener(
        "pointerenter",
        handlePointerEnter
      );

      card.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      card.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      card.removeEventListener(
        "click",
        handleClick
      );

      window.removeEventListener(
        "deviceorientation",
        handleDeviceOrientation
      );

      orientationEnabledRef.current =
        false;

      if (
        pointerRafRef.current !==
        null
      ) {
        cancelAnimationFrame(
          pointerRafRef.current
        );

        pointerRafRef.current =
          null;
      }

      cancelSmoothAnimation();
    };
  }, [
    enableTilt,
    enableMobileTilt,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
    handleDeviceOrientation,
    updateCardTransform,
    createSmoothAnimation,
    cancelSmoothAnimation,
  ]);

  // ─────────────────────────────────────────────
  // CSS VARIABLES
  // ─────────────────────────────────────────────

  const cardStyle =
    useMemo(
      () => ({
        "--icon": iconUrl
          ? `url(${iconUrl})`
          : "none",

        "--grain": grainUrl
          ? `url(${grainUrl})`
          : "none",

        "--behind-gradient":
          showBehindGradient
            ? behindGradient ??
              DEFAULT_BEHIND_GRADIENT
            : "none",

        "--inner-gradient":
          innerGradient ??
          DEFAULT_INNER_GRADIENT,

        "--pointer-x": "50%",
        "--pointer-y": "50%",

        "--pointer-from-center":
          "0",

        "--pointer-from-top":
          "0.5",

        "--pointer-from-left":
          "0.5",

        "--rotate-x":
          "0deg",

        "--rotate-y":
          "0deg",

        "--background-x":
          "50%",

        "--background-y":
          "50%",
      }),
      [
        iconUrl,
        grainUrl,
        showBehindGradient,
        behindGradient,
        innerGradient,
      ]
    );

  const handleContactClick =
    useCallback(
      (event) => {
        event.stopPropagation();

        onContactClick?.();
      },
      [onContactClick]
    );

  return (
    <div
      ref={wrapRef}
      className={`pc-card-wrapper ${className}`.trim()}
      style={cardStyle}
    >
      <section
        ref={cardRef}
        className="pc-card"
      >
        <div className="pc-inside">
          <div
            className="pc-shine"
            aria-hidden="true"
          />

          <div
            className="pc-glare"
            aria-hidden="true"
          />

          <div className="pc-avatar-content">
            <img
              className="avatar -mb-60"
              src={avatarUrl}
              alt={`${name || "User"} avatar`}
              loading="lazy"
              decoding="async"
              draggable="false"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={
                        miniAvatarUrl ||
                        avatarUrl
                      }
                      alt={`${name || "User"} mini avatar`}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      onError={(event) => {
                        const target =
                          event.currentTarget;

                        target.style.opacity =
                          "0.5";

                        if (
                          target.src !==
                          avatarUrl
                        ) {
                          target.src =
                            avatarUrl;
                        }
                      }}
                    />
                  </div>

                  <div className="pc-user-text">
                    <div className="pc-handle">
                      @{handle}
                    </div>

                    <div className="pc-status">
                      {status}
                    </div>
                  </div>
                </div>

                <button
                  className="pc-contact-btn cursor-target cursor-none"
                  onClick={
                    handleContactClick
                  }
                  type="button"
                  aria-label={`Contact ${
                    name || "user"
                  }`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>

          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard =
  React.memo(
    ProfileCardComponent
  );

export default ProfileCard;