"use client";

import React, { useRef, useState, useContext, useEffect } from "react";
import gsap from "gsap";
import { animate, svg, stagger } from "animejs";
import {
  Loader,
  Mail,
  ArrowUp,
  Github,
  Linkedin,
  Instagram,
  Music2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";
import ProfileCard from "./ProfileCard";
import supabase from "../supabaseClient";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ContactFormLine({ inputId, hasError, isDarkMode }) {
  return (
    <svg
      viewBox="0 0 300 100"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        `input-line-${inputId}`,
        "pointer-events-none absolute bottom-0 right-0 h-[90px] w-[300%] fill-none stroke-[1.75] transition-colors duration-300 will-change-transform",
        hasError
          ? "stroke-red-500/80 peer-focus:!stroke-red-400"
          : isDarkMode
          ? "stroke-zinc-500/40 peer-focus:!stroke-white/70"
          : "stroke-zinc-400/50 peer-focus:!stroke-black/70"
      )}
      preserveAspectRatio="none"
    >
      <path d="M0 90H100C110 90 120 84 130 78C140 72 160 72 170 78C180 84 190 90 200 90H300" />
    </svg>
  );
}

function AnimatedSignature({ isDarkMode }) {
  const signatureRef = useRef(null);

  useEffect(() => {
    if (!signatureRef.current) return;

    const lines = signatureRef.current.querySelectorAll(".nta-signature-line");
    if (!lines.length) return;

    const animation = animate(svg.createDrawable(lines), {
      draw: ["0 0", "0 1", "1 1"],
      ease: "inOutQuad",
      duration: 2200,
      delay: stagger(350),
      loop: true,
    });

    return () => {
      animation?.pause?.();
      animation?.cancel?.();
      animation?.revert?.();
    };
  }, []);

  return (
    <svg
      ref={signatureRef}
      viewBox="0 0 1149 575"
      preserveAspectRatio="xMidYMid meet"
      aria-label="NTA Signature"
      className={cn(
        "relative z-10 h-[150px] w-full select-none px-6 py-5 transition-colors duration-500 sm:h-[180px] lg:h-[210px]",
        isDarkMode ? "text-white" : "text-zinc-950"
      )}
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      >
        {/* N */}
        <path
          className="nta-signature-line"
          d="M 397 565
             C 435 485 480 383 526 281
             C 552 224 579 162 604 116
             C 608 109 615 113 612 122
             C 598 223 586 345 585 430
             C 585 455 603 459 620 437
             C 662 381 691 297 714 210
             C 735 130 754 54 704 20
             C 660 -10 568 16 458 65
             C 334 121 194 213 56 299
             C 18 323 -4 342 18 353
             C 60 372 182 344 292 344
             C 416 344 533 345 642 345
             C 688 345 717 345 731 345"
        />

        {/* T, satu garis utuh */}
        <path
          className="nta-signature-line"
          d="M 768 171
             C 750 220 724 283 695 354
             C 681 389 669 418 662 444
             C 675 392 690 330 621 288
             C 590 288 550 288 515 288
             C 650 288 850 288 1138 288"
        />

        {/* A */}
        <path
          className="nta-signature-line"
          d="M 726 357
             C 738 336 755 328 766 336
             C 778 345 770 368 747 389
             C 731 402 718 394 721 374
             C 724 357 744 340 764 338
             C 770 354 772 371 785 375
             C 798 379 811 360 820 343"
        />
      </g>
    </svg>
  );
}

export default function Footer() {
  const { isDarkMode } = useContext(ThemeContext);
  const formEl = useRef(null);
  const el = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleFocus = (inputId) => {
    gsap.fromTo(
      `.input-line-${inputId}`,
      { xPercent: 0 },
      { xPercent: 65, duration: 1, ease: "power1.inOut" }
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Required";

    if (!formData.email.trim()) {
      newErrors.email = "Required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.subject.trim()) newErrors.subject = "Required";
    if (!formData.message.trim()) newErrors.message = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPending(true);
    setSent(false);

    const contactData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      const emailPromise = emailjs.sendForm(
        "service_m3pugyl",
        "template_fbyckkg",
        formEl.current,
        "F7OWxXL91oYx48edi"
      );

      const { error: supabaseError } = await supabase
        .from("contacts")
        .insert([contactData]);

      await emailPromise;

      if (supabaseError) {
        console.error("Supabase insert error:", supabaseError);
      }

      setSent(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (err) {
      console.error("Contact submit error:", err);
    } finally {
      setPending(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discoverLinks = [
    { name: "All Projects", path: "/all-projects" },
    { name: "Certificates", path: "/certificates" },
    { name: "Art", path: "/art" },
    { name: "Scanner", path: "/scanner" },
    { name: "Activity", path: "/activity" },
  ];

  const socialLinks = [
    {
      name: "Github",
      url: "https://github.com/Ananta-TI",
      icon: <Github size={18} />,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/ananta-firdaus-93448328b/",
      icon: <Linkedin size={18} />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/ntakunti_14",
      icon: <Instagram size={18} />,
    },
    {
      name: "Tiktok",
      url: "https://tiktok.com/@ntakunti_14",
      icon: <Music2 size={18} />,
    },
  ];

  return (
    <footer
      ref={el}
      className={cn(
        "relative z-10 w-full overflow-hidden transition-colors duration-500",
        isDarkMode ? "text-white" : "text-zinc-900"
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            isDarkMode
              ? "from-zinc-900 via-zinc-950 to-black"
              : "from-white via-[#c9c9c9] to-[#797979]"
          )}
        />

        <div
          className={cn(
            "absolute left-0 top-0 h-32 w-full bg-gradient-to-b",
            isDarkMode ? "from-zinc-900 to-transparent" : "from-white to-transparent"
          )}
        />

        <div
          className={cn(
            "absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full blur-3xl",
            isDarkMode ? "bg-white/[0.035]" : "bg-black/[0.06]"
          )}
        />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-12 lg:px-20">
        <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="z-10 space-y-10 lg:col-span-5">
            <div className="flex justify-center lg:justify-start">
              <ProfileCard
                name="Ananta Firdaus"
                title="Web Developer"
                handle="Ananta-TI"
                status="Online"
                contactText="Contact Me"
                avatarUrl="/img/m3.png"
                showUserInfo={false}
                enableTilt={true}
                enableMobileTilt={true}
                onContactClick={() => console.log("Contact clicked")}
              />
            </div>

            <div className="grid grid-cols-2 gap-8 lg:grid-cols-2 lg:gap-10">
              <div>
                <h3 className="mb-4 font-lyrae text-2xl font-bold lg:mb-6 lg:text-3xl">
                  Discover
                </h3>

                <div className="space-y-2">
                  {discoverLinks
                    .filter((link) => link.path !== location.pathname)
                    .map((link, i) => (
                      <motion.a
                        key={link.name}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(link.path);
                        }}
                        className="cursor-none relative block font-mono font-bold transition-transform active:scale-95"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: i * 0.1 },
                        }}
                      >
                        <span className="cursor-target transition-opacity hover:opacity-70">
                          {link.name}
                        </span>
                      </motion.a>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-lyrae text-2xl font-bold lg:mb-6 lg:text-3xl">
                  Social
                </h3>

                <ul className="space-y-3 font-mono font-bold">
                  {socialLinks.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "cursor-none flex gap-2 transition-colors hover:opacity-70",
                          isDarkMode ? "hover:text-zinc-400" : "hover:text-white"
                        )}
                      >
                        <div className="cursor-target flex gap-2">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="relative z-10 lg:col-span-7">
            <div className="relative z-10 lg:pl-8">
              <h3 className="mb-6 font-lyrae text-3xl font-bold lg:text-4xl">
                Get in Touch
              </h3>

              <form
                ref={formEl}
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4 overflow-hidden font-mono font-bold"
              >
                {["name", "email", "subject", "message"].map((field, index) => (
                  <div key={field} className="relative overflow-hidden">
                    {field === "message" ? (
                      <textarea
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: e.target.value,
                          })
                        }
                        onFocus={() => handleFocus(index + 1)}
                        className={cn(
                          "peer min-h-[8rem] w-full cursor-none cursor-target resize-none bg-transparent py-3 font-semibold outline-none transition-colors",
                          isDarkMode
                            ? "text-white placeholder:text-zinc-200"
                            : "text-zinc-900 placeholder:text-zinc-700"
                        )}
                      />
                    ) : (
                      <input
                        name={field}
                        type={field === "email" ? "email" : "text"}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: e.target.value,
                          })
                        }
                        onFocus={() => handleFocus(index + 1)}
                        className={cn(
                          "peer w-full cursor-none cursor-target bg-transparent py-3 text-base font-semibold outline-none transition-colors",
                          isDarkMode
                            ? "text-white placeholder:text-zinc-200"
                            : "text-zinc-900 placeholder:text-zinc-700"
                        )}
                      />
                    )}

                    <ContactFormLine
                      inputId={index + 1}
                      hasError={!!errors[field]}
                      isDarkMode={isDarkMode}
                    />

                    {errors[field] && (
                      <span className="absolute right-0 top-3 text-xs text-red-500">
                        {errors[field]}
                      </span>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "group mt-4 inline-flex cursor-none cursor-target items-center justify-center gap-x-2 rounded-md border px-6 py-3 font-bold",
                    "transition-all duration-500 ease-out hover:shadow-lg",
                    isDarkMode
                      ? "border-zinc-600 hover:bg-[#faf9f9] hover:text-zinc-900 hover:shadow-white/10"
                      : "border-zinc-900 hover:bg-zinc-900 hover:text-zinc-50 hover:shadow-zinc-900/20",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {pending ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-12" />
                      Send Message
                    </>
                  )}
                </button>

                {sent && (
                  <span className="mt-3 font-mono text-sm font-bold text-green-400">
                    ✅ Message Sent Successfully!
                  </span>
                )}
              </form>

              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "pointer-events-none mt-10 flex justify-center lg:justify-end",
                  "min-h-[150px] sm:min-h-[180px] lg:min-h-[210px]"
                )}
              >
                <div className="relative w-full max-w-[360px] overflow-visible">
                  <AnimatedSignature isDarkMode={isDarkMode} />

                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div
          id="contact"
          className={cn(
            "relative z-10 flex flex-col items-center justify-between gap-4 border-t-2 pt-8 text-sm sm:flex-row",
            isDarkMode ? "border-white text-white" : "border-black text-zinc-900"
          )}
        >
          <div className="z-10 font-mono font-bold">
            © 2025 All Rights Reserved
          </div>

          <button
            onClick={scrollToTop}
            className={cn(
              "cursor-target z-10 flex items-center gap-2 font-mono font-bold transition-colors group",
              isDarkMode ? "hover:text-white" : "hover:text-zinc-700"
            )}
          >
            <span>Back To Top</span>
            <ArrowUp
              size={18}
              className="transition-transform group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}