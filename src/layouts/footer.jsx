"use client";
import React, { useEffect, useRef, useState, useContext } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import Line from "./line.jsx";
import ProfileCard from './ProfileCard'


// Utility class
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Garis animasi untuk input form
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

  // Animasi saat footer muncul
  // useEffect(() => {
  //   gsap.registerPlugin(ScrollTrigger);
  //   gsap.fromTo(
  //     el.current,
  //     { opacity: 0, y: 60 },
  //     {
  //       opacity: 1,
  //       y: 0,
  //       ease: "power2.out",
  //       scrollTrigger: {
  //         trigger: el.current,
  //         start: "top bottom",
  //         end: "top center",
  //         scrub: false,
  //       },
  //     }
  //   );
  // }, []);

  const handleFocus = (inputId) => {
    gsap.fromTo(
      `.input-line-${inputId}`,
      { xPercent: 0 },
      { xPercent: 65, duration: 1, ease: "power1.inOut" }
    );
  };

  // Validasi form
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

  // Kirim form pakai EmailJS
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPending(true);
    setSent(false);
    try {
      await emailjs.sendForm(
        "service_m3pugyl",
        "template_fbyckkg",
        formEl.current,
        "F7OWxXL91oYx48edi"
      );
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    } finally {
      setPending(false);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const discoverLinks = [
    { name: "All Projects", path: "/all-projects" },
    { name: "Certificates", path: "/certificates" },
  ];

  const socialLinks = [
    { name: "Github", url: "https://github.com/Ananta-TI", icon: <Github size={18} /> },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/ananta-firdaus-93448328b/", icon: <Linkedin size={18} /> },
    { name: "Instagram", url: "https://instagram.com/ntakunti_14", icon: <Instagram size={18} /> },
    { name: "Tiktok", url: "https://tiktok.com/@ntakunti_14", icon: <Music2 size={18} /> },
  ];

  return (
    <footer
      ref={el}
      className={cn(
        "relative z-10 w-full overflow-hidden transition-colors duration-500",
        isDarkMode ? "text-white" : "text-zinc-900"
      )}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 -z-100 bg-gradient-to-b ${
          isDarkMode
            ? "from-zinc-900 via-zinc-950 to-black"
            : "from-[#f7f7f7] via-[#c9c9c9] to-[#797979]"
        }`}
      />
      <div className="relative">
        <Line />
      </div>

      <div className="w-full mx-auto py-20 px-6 sm:px-12 lg:px-20 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Left Section - Profile + Info */}
          <div className="lg:col-span-5 space-y-10">
            {/* Profile Card */}
            <div className="flex justify-center lg:justify-start">
              <ProfileCard
                name="Ananta Firdaus"
                title="Software Engineer"
                handle="Ananta-TI"
                status="Online"
                contactText="Contact Me"
                avatarUrl="../img/me.png"
                showUserInfo={false}
                enableTilt={true}
                enableMobileTilt={true}
                onContactClick={() => console.log('Contact clicked')}
              />
            </div>

            {/* Discover & Social in two columns on mobile, stacked on large screens */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Discover */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold font-lyrae mb-4 lg:mb-6">
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
                        className="cursor-none relative font-bold font-mono transition-transform active:scale-95 block"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: i * 0.1 },
                        }}
                      >
                        <span className="cursor-target hover:opacity-70 transition-opacity">
                          {link.name}
                        </span>
                      </motion.a>
                    ))}
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold font-lyrae mb-4 lg:mb-6">
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
                          "flex gap-2 transition-colors cursor-none hover:opacity-70",
                          isDarkMode ? "hover:text-zinc-400" : "hover:text-white"
                        )}
                      >
                        <div className="flex gap-2 cursor-target">
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

          {/* Right Section - Contact Form */}
          <div className="lg:col-span-7">
            <div className="lg:pl-8">
              <h3 className="text-3xl lg:text-4xl font-bold font-lyrae mb-6">
                Get in Touch
              </h3>
              <form
                ref={formEl}
                onSubmit={handleSubmit}
                className="flex flex-col font-mono font-bold gap-4 mt-6 overflow-hidden"
              >
                {["name", "email", "subject", "message"].map((field, index) => (
                  <div key={field} className="relative overflow-hidden">
                    {field === "message" ? (
                      <textarea
                        name={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        onFocus={() => handleFocus(index + 1)}
                        className={cn(
                          "peer min-h-[8rem] cursor-target cursor-none w-full resize-none bg-transparent py-3 font-semibold outline-none transition-colors",
                          isDarkMode
                            ? "placeholder:text-zinc-600 text-white"
                            : "placeholder:text-zinc-500 text-zinc-900"
                        )}
                      />
                    ) : (
                      <input
                        name={field}
                        type={field === "email" ? "email" : "text"}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        onFocus={() => handleFocus(index + 1)}
                        className={cn(
                          "peer w-full cursor-target cursor-none bg-transparent py-3 text-base font-semibold outline-none transition-colors",
                          isDarkMode
                            ? "placeholder:text-zinc-600 text-white"
                            : "placeholder:text-zinc-500 text-zinc-900"
                        )}
                      />
                    )}
                    <ContactFormLine
                      inputId={index + 1}
                      hasError={!!errors[field]}
                      isDarkMode={isDarkMode}
                    />
                    {errors[field] && (
                      <span className="text-red-500 text-xs absolute right-0 top-3">
                        {errors[field]}
                      </span>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={pending}
                  className={cn(
                    "mt-4 inline-flex cursor-target cursor-none items-center justify-center gap-x-2 border py-3 px-6 rounded-md transition-colors disabled:opacity-50 font-bold",
                    isDarkMode
                      ? "border-zinc-600 hover:bg-[#faf9f9] hover:text-zinc-900"
                      : "border-zinc-900 hover:bg-zinc-900 hover:text-zinc-50"
                  )}
                >
                  {pending ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>

                {sent && (
                  <span className="text-green-400 font-mono font-bold text-sm mt-3">
                    ✅ Message Sent Successfully!
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          id="contact"
          className={cn(
            "flex flex-col sm:flex-row justify-between items-center pt-8 border-t-2 text-sm gap-4",
            isDarkMode
              ? "border-zinc-300/50 text-white"
              : "border-zinc-300 text-white"
          )}
        >
          <div className="font-mono font-bold">
            © 2025 All Rights Reserved
          </div>
          
          <button
            onClick={scrollToTop}
            className={cn(
              "flex cursor-target font-mono font-bold items-center gap-2 group transition-colors",
              isDarkMode ? "hover:text-white" : "hover:text-zinc-300"
            )}
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