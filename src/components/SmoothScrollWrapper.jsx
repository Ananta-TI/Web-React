// src/components/Shared/SmoothScrollWrapper.jsx

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother'; // Pastikan Anda memiliki file ini atau akses ke Club GreenSock

// Daftar plugin GSAP yang perlu diimpor
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function SmoothScrollWrapper({ children }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Pastikan ScrollSmoother didukung oleh browser
    if (ScrollSmoother.isSupported()) {

      // 1. Dapatkan referensi ke wrapper HTML
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper', // ID yang akan kita taruh di JSX
        content: '#smooth-content', // ID konten utama
        smooth: 1.5, // Tingkat kehalusan (semakin besar, semakin halus/lambat)
        normalizeScroll: true, // Mengatasi masalah sentuhan/scroll di beberapa browser
        ignoreMobileResize: true, // Opsional: Untuk stabilitas di perangkat mobile
      });

      // Cleanup function: Hapus instance ScrollSmoother saat komponen di-unmount
      return () => {
        smoother.kill();
        ScrollTrigger.killAll();
      };
    }
  }, []); // Run sekali saat komponen dimuat

  // Struktur wajib ScrollSmoother
  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div id="smooth-content">
        {children}
      </div>
    </div>
  );
}