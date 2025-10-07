import React from 'react';

export default function ContactSubmitBtn({ pending }) {
  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-zinc-600 px-8 py-3 font-medium text-zinc-100 shadow-lg transition-all duration-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="relative">
        {pending ? "Sending..." : "Send Message"}
      </span>
    </button>
  );
}