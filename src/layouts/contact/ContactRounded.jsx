import React from 'react';
import MagneticEffect from "../../components/Home/magnet.jsx"; // Assuming MagneticEffect is in the same folder

export default function ContactLink({ href, label, icon }) {
  return (
    <a
      href={href}
      target={label !== "Email" ? "_blank" : "_self"}
      rel={label !== "Email" ? "noopener noreferrer" : ""}
      aria-label={label}
      className="mx-2"
    >
      <MagneticEffect>
        {icon}
        <div className="absolute -bottom-[2px] h-[2px] w-full origin-center scale-x-0 rounded-full bg-foreground/30 transition-transform hover:translate-y-2 hover:scale-x-100" />
      </MagneticEffect>
    </a>
  );
}