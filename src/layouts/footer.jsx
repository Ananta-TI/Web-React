"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader, Mail, ArrowUp } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ContactFormLine({ inputId, hasError }) {
  return (
    <svg
      viewBox="0 0 300 100"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        `input-line-${inputId}`,
        "pointer-events-none absolute bottom-0 right-0 h-[90px] w-[400%] fill-none stroke-[1.75] transition-colors duration-300 will-change-transform",
        hasError
          ? "stroke-red-500/80 peer-focus:!stroke-red-400"
          : "stroke-zinc-500/40 peer-focus:!stroke-white/70"
      )}
      preserveAspectRatio="none"
    >
      <path d="M0 90H100C110 90 120 84 130 78C140 72 160 72 170 78C180 84 190 90 200 90H300" />
    </svg>
  );
}

export default function Footer() {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const formEl = useRef(null);
  const el = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      el.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el.current,
          start: "top bottom",
          end: "top center",
          scrub: false,
        },
      }
    );
  }, []);

  const handleFocus = (inputId) => {
    gsap.fromTo(
      `.input-line-${inputId}`,
      { xPercent: 0 },
      { xPercent: 50, duration: 1, ease: "power1.inOut" }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = true;
    if (!formData.subject.trim()) newErrors.subject = true;
    if (formData.message.trim().length < 3) newErrors.message = true;
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setPending(true);
    setSent(false);
    setTimeout(() => {
      setPending(false);
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    }, 1500);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      ref={el}
      className={cn(
        "relative z-10 w-full overflow-hidden",
        isDarkMode ? "bg-[#0b0b0b] text-white" : "bg-white text-black"
      )}
    >
      {/* Background gradient fill biar nutup layar */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />

      <div className="w-full mt-100 mx-auto py-24 px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16 text-base">
          <div>
            <h3 className="text-3xl font-light mb-6">Discover</h3>
            <ul className="space-y-3">
              {["Products", "Markets", "About", "Partners", "Stories"].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-zinc-400 transition-colors">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-3xl font-light mb-6">Social</h3>
            <ul className="space-y-3">
              {["LinkedIn", "WeChat"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-zinc-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-3xl font-light mb-6">Info</h3>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-zinc-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-light mb-4">Get in Touch</h3>
            <form
              ref={formEl}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 mt-4 overflow-hidden"
            >
              {["name", "email", "subject", "message"].map((field, index) => (
                <div key={field} className="relative overflow-hidden">
                  {field === "message" ? (
                    <textarea
                      placeholder={field}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      onFocus={() => handleFocus(index + 1)}
                      className="peer min-h-[7rem] w-full resize-none bg-transparent py-2 font-semibold outline-none placeholder:text-zinc-600"
                    />
                  ) : (
                    <input
                      type={field === "email" ? "email" : "text"}
                      placeholder={field}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      onFocus={() => handleFocus(index + 1)}
                      className="peer w-full bg-transparent py-2 text-base font-semibold outline-none placeholder:text-zinc-600"
                    />
                  )}
                  <ContactFormLine inputId={index + 1} hasError={!!errors[field]} />
                </div>
              ))}

              <button
                type="submit"
                disabled={pending}
                className="mt-4 inline-flex items-center justify-center gap-x-2 border border-zinc-600 py-2 px-5 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" />
                    Send
                  </>
                )}
              </button>

              {sent && (
                <span className="text-green-400 text-sm mt-3 text-center">
                  ✅ Message Sent Successfully!
                </span>
              )}
            </form>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-zinc-700/50 text-sm text-gray-400 gap-4"
              id="contact"
>
          <div className="flex items-center space-x-2">
            <div className="text-4xl sm:text-6xl tracking-wider font-MailBox">
              @NANTA
            </div>
            <span>©2025</span>
          </div>
          <div>All Rights Reserved</div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 sm:gap-2 group"
          >
            <span>Back To Top</span>
            <ArrowUp
              size={18}
              className="group-hover:-translate-y-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
