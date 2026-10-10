// src/transisi.js
export function themeTransition({ x, y, isDark }) {
  const circle = document.createElement("div");
  circle.style.position = "fixed";
  circle.style.top = `${y}px`;
  circle.style.left = `${x}px`;
  const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 2;
  circle.style.width = "1px";
  circle.style.height = "1px";
  circle.style.borderRadius = "50%";
  circle.style.zIndex = "9999";
  circle.style.pointerEvents = "none";
  circle.style.background = isDark ? "#fff" : "#000";
  circle.style.transform = `translate(-50%, -50%) scale(${maxRadius})`;
  circle.style.transition = "transform 0.6s ease-in-out";
  document.body.appendChild(circle);

  // Ganti tema DULUAN, biar background di belakang sudah berubah
  document.documentElement.classList.toggle("dark", !isDark);

  // Setelah satu frame, mulai animasi mengecil
  requestAnimationFrame(() => {
    circle.style.transform = "translate(-50%, -50%) scale(0)";
  });

  // Hapus elemen setelah animasi selesai
  setTimeout(() => {
    circle.remove();
  }, 650);
}
