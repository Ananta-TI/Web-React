<div align="center">

# 🌊 Ananta-TI Portfolio v2.0
### Interactive • Immersive • Awwwards-Inspired

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ananta--ti.vercel.app-success?style=for-the-badge&logoColor=white)](https://ananta-ti.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Ananta--TI%2FWeb--React-black?style=for-the-badge&logo=github)](https://github.com/Ananta-TI/Web-React)
[![Last Commit](https://img.shields.io/github/last-commit/Ananta-TI/Web-React?style=for-the-badge&color=blue&logo=git)](https://github.com/Ananta-TI/Web-React)
[![Performance](https://img.shields.io/badge/Performance-⚡_100%25-brightgreen?style=for-the-badge)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

> **Website portofolio eksperimental yang mendorong batas kemampuan React & Framer Motion**  
> Menampilkan liquid transitions, micro-interactions, dan typography-driven design dengan performa maksimal.

[**🌐 Kunjungi Website**](https://ananta-ti.vercel.app/) • [**📚 Lihat Kode**](https://github.com/Ananta-TI/Web-React) • [**📧 Hubungi Saya**](mailto:ananta23ti@mahasiswa.pcr.ac.id)

</div>

---

## 📋 Daftar Isi
- [✨ Fitur Utama](#-fitur-utama)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Struktur Folder](#-struktur-folder)
- [🎨 Komponen & Fitur Khusus](#-komponen--fitur-khusus)
- [⚡ Optimasi Performa](#-optimasi-performa)
- [🔧 Development](#-development)
- [📬 Kontak](#-kontak)

---

## ✨ Fitur Utama

### 🎬 **Cinematic Preloader** (Signature Feature)
Fitur unggulan yang memberikan kesan pertama premium dengan animasi kelas Awwwards:

- **✨ Curtain Reveal Effect**: SVG Path Morphing menciptakan efek tirai "cair" yang ditarik ke atas, memberikan transisi liquid yang sangat halus saat website dimuat
- **🌍 Multi-language Greeting**: Menyapa pengguna dengan animasi teks dalam **16 bahasa berbeda** sebelum konten utama muncul
- **🧠 Smart Loading Logic**: Menggunakan `SessionStorage` agar preloader hanya muncul pada kunjungan pertama, tidak mengganggu navigasi berulang
- **🔒 Anti-Scroll Locking**: Mencegah scroll saat loading berlangsung untuk menjaga integritas visual

### 🖱️ **Interaksi & Navigasi** (UX First)

- **🎯 Custom Target Cursor**: Kursor kustom dengan efek magnetik dan indikator visual yang berputar
- **📜 GSAP Smooth Scroll (Lenis)**: Scroll berbasis inersia (momentum) yang lembut menggantikan scroll browser default
- **📊 Scroll Progress Bar**: Indikator visual real-time yang menunjukkan posisi baca pengguna

### 🌓 **Dynamic Theming** (Dark/Light Mode)

- Global state management menggunakan `ThemeContext`
- Transisi warna halus (`duration-500`) pada semua elemen
- SVG dan komponen secara otomatis menyesuaikan palet warna

### 📱 **Fully Responsive Design**

- Mobile-first approach
- Breakpoint Tailwind yang optimal
- Testing di berbagai device ukuran
- Touch-friendly interaction

---

## 🛠️ Tech Stack & Tools

| Kategori | Teknologi | Alasan Dipilih |
|:---|:---|:---|
| **Framework** | ![React](https://img.shields.io/badge/-React%2018+-61DAFB?style=flat&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white) | Ekosistem komponen terbaik & HMR instan |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | Rapid UI development & konsistensi desain |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0055FF?style=flat&logo=framer&logoColor=white) ![GSAP](https://img.shields.io/badge/-GSAP-88CE02?style=flat&logo=greensock&logoColor=white) | Library animasi paling deklaratif untuk React | 
| **3D & WebGL** | ![Three.js](https://img.shields.io/badge/-Three.js-000000?style=flat&logo=three.js&logoColor=white) | Rendering grafik 3D interaktif di browser |
| **Scroll** | ![Lenis](https://img.shields.io/badge/-Lenis-000?style=flat) | Smooth scrolling berbasis inersia |
| **Deployment** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat&logo=vercel&logoColor=white) | CI/CD otomatis & Edge Network global |
| **Version Control** | ![Git](https://img.shields.io/badge/-Git-F05032?style=flat&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat&logo=github&logoColor=white) | Workflow kolaborasi modern |

**Node Version**: v16+ | **Package Manager**: npm atau yarn

---

## 🚀 Quick Start

### 📋 Prerequisites
```
✅ Node.js v16 atau lebih tinggi
✅ npm atau yarn (package manager)
✅ Git untuk version control
```

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Ananta-TI/Web-React.git
cd Web-React
```

### 2️⃣ Install Dependencies
```bash
npm install
# atau jika menggunakan yarn
yarn install
```

### 3️⃣ Jalankan Development Server
```bash
npm run dev
# atau
yarn dev
```
Buka `http://localhost:5173` di browser Anda untuk melihat hasilnya.

### 4️⃣ Build untuk Production
```bash
npm run build
# atau
yarn build
```

### 5️⃣ Preview Production Build
```bash
npm run preview
# atau
yarn preview
```

---

## 📁 Struktur Folder

```
Web-React/
├── 📂 public/                    # Aset statis & favicon
│   ├── img/                      # Gambar-gambar proyek
│   └── ...
├── 📂 src/
│   ├── 📂 assets/               # Global assets (CSS, Fonts, Images)
│   │   ├── index.css            # Global Tailwind & custom styles
│   │   └── fonts/               # Custom fonts
│   │
│   ├── 📂 components/              # Komponen UI Reusable
│   │   ├── 📂 Home/                # Komponen spesifik halaman Home
│   │   │   ├── Hero.jsx            # Section hero dengan animasi
│   │   │   ├── ScrollProgress.jsx
│   │   │   └── ...
│   │   ├── 📂 Shared/                  # Komponen umum
│   │   │   ├── TargetCursor.jsx        # Custom cursor dengan efek
│   │   │   ├── MorphTransition.jsx     # SVG morphing preloader
│   │   │   ├── TextPressure.jsx        # Typography interaktif
│   │   │   └── ...
│   │   └── 📂 UI/                     # Komponen UI dasar
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── ...
│   │
│   ├── 📂 context/              # State Management Global
│   │   ├── ThemeContext.jsx     # Dark/Light mode context
│   │   └── ...
│   │
│   ├── 📂 layouts/              # Page Layouts & Sections
│   │   ├── Home.jsx             # Halaman utama
│   │   ├── Projects.jsx         # Halaman projects
│   │   ├── About.jsx            # Halaman tentang
│   │   └── ...
│   │
│   ├── 📂 hooks/                # Custom React Hooks
│   │   ├── useScrollProgress.js
│   │   ├── useTheme.js
│   │   └── ...
│   │
│   ├── 📂 utils/                # Utility functions
│   │   ├── animations.js        # Helper animasi
│   │   ├── constants.js         # Konstanta global
│   │   └── ...
│   │
│   ├── App.jsx                  # Main routing & preloader logic
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 vite.config.js            # Konfigurasi Vite
├── 📄 tailwind.config.js        # Konfigurasi Tailwind CSS
├── 📄 postcss.config.js         # PostCSS configuration
└── 📄 README.md                 # Dokumentasi ini
```

---

## 🎨 Komponen & Fitur Khusus

### 1. 🦸 **Hero Section**
```jsx
// Fitur:
- Tipografi besar, bold, dan kontras
- Identitas personal yang kuat
- Entry animation berbasis opacity + transform
- Responsive pada semua ukuran layar
```

### 2. 🔤 **Text Pressure Effect**
```jsx
// Fitur:
- Typography responsif terhadap posisi mouse
- Distorsi berbasis CSS transform matrix
- Menjadikan teks sebagai elemen interaktif
- Smooth follow animation dengan useMousePosition hook
```

### 3. 👤 **About Section**
```jsx
// Fitur:
- Layout minimalis dan fokus pada konten
- Background yang adaptive sesuai theme
- Typography hierarchy yang jelas
- Scroll-triggered animations
```

### 4. 💼 **Projects & Portfolio Grid**
```jsx
// Fitur:
- Grid system fleksibel (responsive cols)
- Hover reveal untuk metadata proyek
- Modal detail dengan scroll-locking
- Background freeze saat modal aktif
- Lazy loading untuk optimasi performa
```

### 5. 📊 **Scanner & Experimental Visuals**
```jsx
// Fitur:
- Elemen visual sci-fi inspired
- CSS animation intensive
- Demonstrasi eksplorasi kreatif frontend
- Performance-optimized SVG animations
```

### 6. 🕒 **Timeline & Certificates**
```jsx
// Fitur:
- Visualisasi kronologis yang elegan
- Scroll-triggered animations
- Modal certificate dengan UX overlay proper
- Responsive design untuk mobile
```

### 7. 🎯 **Custom Target Cursor**
```jsx
// Fitur:
- Kursor custom yang mengikuti mouse
- Efek magnetik pada hover elements
- Loading indicator rotasi
- Smooth easing dengan GSAP
```
### 8. 🧊 **3D GitHub Isometric Contributions**
```jsx
// Fitur:
- Rendering aktivitas GitHub dalam bentuk balok neon 3D (Three.js)
- Responsive layout dengan auto-camera positioning
- Interaksi Gyroscope (Paralaks saat device dimiringkan)
- Scroll momentum rotation (Otomatis berputar searah scroll)
- Hover wobble animation & Dynamic Tooltip

---

## ⚡ Optimasi Performa

Website ini bukan hanya soal visual, tapi juga dioptimalkan untuk performa maksimal:

### 📦 **Code Splitting**
```bash
✓ Vite memecah bundle JavaScript otomatis
✓ Dynamic import untuk route-based splitting
✓ Tree-shaking untuk menghilangkan dead code
```

### 🖼️ **Asset Optimization**
```bash
✓ Format gambar modern (AVIF/WebP)
✓ Image compression & responsive images
✓ Lazy loading untuk images & components
✓ SVG optimization dengan SVGO
```

### 📊 **Monitoring & Analytics**
```bash
✓ Vercel Speed Insights untuk Core Web Vitals
✓ Real-time performance monitoring
✓ Lighthouse scoring tinggi (90+)
```

### 🧹 **Memory Management**
```jsx
✓ useEffect cleanup functions
✓ Event listener removal pada unmount
✓ Timeout/interval clearing
✓ No memory leaks
```

### 🔄 **Browser Caching**
```bash
✓ Service Worker untuk offline support
✓ HTTP caching headers optimal
✓ LocalStorage untuk preferences
✓ SessionStorage untuk transient data
```

---

## 🔧 Development

### Available Scripts

```bash
# Development server dengan hot reload
npm run dev              # Jalankan di http://localhost:5173

# Build untuk production
npm run build            # Optimized build untuk deployment

# Preview production build
npm run preview          # Test production build locally

# Lint code (jika eslint dikonfigurasi)
npm run lint             # Check code quality

# Format code (jika prettier dikonfigurasi)
npm run format           # Auto format code
```

### Environment Variables (jika diperlukan)
```bash
# Buat file .env.local di root folder
VITE_API_URL=your_api_url
VITE_PUBLIC_KEY=your_public_key
```

### Git Workflow (Best Practices)
```bash
# Buat feature branch
git checkout -b feature/amazing-feature

# Commit dengan pesan deskriptif
git commit -m "feat: add amazing feature"

# Push ke remote
git push origin feature/amazing-feature

# Buat Pull Request di GitHub
# (Vercel akan auto-deploy preview)
```

---

## 🎯 Fitur yang Akan Datang

- [ ] Blog section dengan MDX support
- [x] Interactive 3D elements dengan Three.js
- [ ] Real-time collaboration features
- [ ] CMS integration (Contentful/Sanity)
- [ ] Advanced analytics dashboard
- [x] API backend integration

---

## 🐛 Troubleshooting

### Port 5173 sudah terpakai?
```bash
npm run dev -- --port 3000  # Ganti ke port 3000
```

### Permasalahan dengan dependencies?
```bash
# Clear cache
npm cache clean --force

# Delete node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build gagal?
```bash
# Clear Vite cache
rm -rf dist/ .vite/

# Rebuild
npm run build
```

### Permasalahan dengan styling?
```bash
# Rebuild Tailwind cache
npx tailwindcss -i ./src/assets/index.css -o ./dist/output.css
```

---

## 📚 Resources & Documentation

### Official Docs
- [🔗 React Documentation](https://react.dev)
- [🔗 Vite Guide](https://vitejs.dev)
- [🔗 Tailwind CSS](https://tailwindcss.com/docs)
- [🔗 Framer Motion](https://www.framer.com/motion)
- [🔗 GSAP Docs](https://greensock.com/gsap/)
- [🔗 Lenis Scroll](https://lenis.darkroom.engineering/)

### Learning Resources
- [📺 React Hooks Tutorial](https://react.dev/reference/react)
- [📺 Animation Basics](https://www.framer.com/motion/introduction/)
- [📖 Performance Optimization](https://web.dev/performance/)

---

## 🤝 Contributing

Kami menerima kontribusi dari komunitas! Berikut cara berkontribusi:

### Langkah-langkah:
1. **Fork** repository ini
2. **Clone** fork Anda ke lokal
   ```bash
   git clone https://github.com/YOUR_USERNAME/Web-React.git
   ```
3. **Buat feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. **Commit changes**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```
5. **Push ke branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Buka Pull Request**

### Contribution Guidelines
- ✅ Ikuti kode style yang sudah ada
- ✅ Tulis commit message yang deskriptif
- ✅ Update dokumentasi jika diperlukan
- ✅ Test fitur sebelum push
- ✅ Jangan push ke `main` secara langsung

### Kode Style
```javascript
// ✓ Baik
const fetchUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// ✗ Hindari
const FetchUserData=async(u)=>{return fetch(`/api/users/${u}`).then(r=>r.json())}
```

---

## 📄 License

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

## 📬 Kontak & Social Media

Tertarik untuk berkolaborasi atau punya pertanyaan? Mari terhubung!

| Platform | Link |
|:---|:---|
| **🌐 Website** | [ananta-ti.vercel.app](https://ananta-ti.vercel.app/) |
| **📧 Email** | [ananta23ti@mahasiswa.pcr.ac.id](mailto:ananta23ti@mahasiswa.pcr.ac.id) |
| **🐙 GitHub** | [@Ananta-TI](https://github.com/Ananta-TI) |

---

## 🙏 Acknowledgments & Credits

- Terinspirasi oleh desain **Awwwards** award-winning websites
- Terima kasih kepada komunitas React yang luar biasa
- GSAP & Framer Motion untuk library animasi terbaik
- Vercel untuk deployment platform yang sempurna
- Semua kontributor dan supporter! ❤️

---

<div align="center">

##  Jika project ini membantu, jangan lupa beri ⭐ di GitHub!

**[⬆ Kembali ke Atas](#-ananta-ti-portfolio-v20)**

---

<img src="https://img.shields.io/badge/Made%20with-💻%20and%20☕-000?style=for-the-badge" alt="Made with love and coffee">

**© 2026 Ananta-TI. All rights reserved.**

*Designed & Developed with by Ananta Firdaus*

</div>

y