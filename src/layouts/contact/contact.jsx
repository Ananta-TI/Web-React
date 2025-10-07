import { GithubIcon, InstagramIcon, LinkedinIcon, MailIcon } from "lucide-react";
import MagneticEffect from "../../components/Home/magnet.jsx";
import ContactLink from "./ContactLink";
import ContactTitle from "./ContactTitle";
import ContactForm from "./ContactForm";
import ContactRounded from "./ContactRounded"; // Komponen ini sepertinya duplikat dari ContactLink, Anda bisa memilih salah satu

export default function Contact() {
  return (
    <section
      id="contact"
      className="contact-section flex min-h-screen w-full flex-col items-center justify-center bg-zinc-800 px-4 py-12 dark:bg-zinc-100"
    >
      {/* Wrapper untuk memusatkan dan membatasi lebar konten */}
      <div className="contact-wrapper w-full max-w-2xl">
        <ContactTitle title="Contact" />
        <ContactForm />
        <div className="mt-16 flex w-full justify-between py-12">
          <div>
            <p className="mb-4 text-xl font-semibold text-zinc-200 dark:text-zinc-800">
              Github
            </p>
            <a
              href="https://github.com/Ananta-TI"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Github Link"
            >
              <MagneticEffect>
                <GithubIcon className="h-8 w-8 text-zinc-100 dark:text-zinc-800" />
              </MagneticEffect>
            </a>
          </div>
          <div className="flex flex-col items-end">
            <p className="mb-4 text-xl font-semibold text-zinc-200 dark:text-zinc-800">
              Links
            </p>
            <div className="flex items-center gap-x-2">
              <ContactLink
                href="https://instagram.com/aafrzl_"
                label="Instagram"
                icon={<InstagramIcon className="text-zinc-200 dark:text-zinc-800" />}
              />
              <ContactLink
                href="mailto:afrizal.mufriz25@gmail.com"
                label="Email"
                icon={<MailIcon className="text-zinc-200 dark:text-zinc-800" />}
              />
              <ContactLink
                href="https://www.linkedin.com/in/afrizal-mufriz-fouji-8a930111b/"
                label="LinkedIn"
                icon={<LinkedinIcon className="text-zinc-200 dark:text-zinc-800" />}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}