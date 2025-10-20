import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <motion.section
      className="max-w-3xl mx-auto px-6 py-16 font-mono text-zinc-800 dark:text-zinc-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-lyrae font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Terakhir diperbarui: 21 Oktober 2025
      </p>

      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Website ini tidak mengumpulkan data pribadi pengunjung. Beberapa data
          non-pribadi seperti alamat IP dan jenis browser mungkin dikumpulkan
          secara otomatis untuk keperluan keamanan dan statistik dasar.
        </p>

        <p>
          Kami tidak membagikan data apa pun kepada pihak ketiga. Dengan
          mengakses website ini, Anda menyetujui kebijakan privasi sederhana
          ini.
        </p>

        <p>
          Jika Anda memiliki pertanyaan mengenai kebijakan ini, Anda dapat
          menghubungi kami melalui email:{" "}
          <a
            href="mailto:youremail@example.com"
            className="underline hover:text-zinc-400 transition-colors"
          >
            youremail@example.com
          </a>
        </p>
      </div>
    </motion.section>
  );
}
