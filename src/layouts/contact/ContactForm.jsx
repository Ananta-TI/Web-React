import React, { useState } from 'react';
import ContactSubmitBtn from './ContactSubmitBtn';
import ContactFormLine from './ContactFormLine'; // Assuming you have this component

export default function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false); // Example error state

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPending(true);
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="relative my-4">
        <input
          id="name"
          name="name"
          type="text"
          className="peer w-full border-none bg-transparent p-0 pb-1.5 text-zinc-100 placeholder-transparent outline-none focus:ring-0 dark:text-zinc-800"
          placeholder="Name"
          required
        />
        <label
          htmlFor="name"
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-zinc-200 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-full peer-focus:text-xs dark:text-zinc-800"
        >
          Name
        </label>
        <ContactFormLine inputId={1} hasError={hasError} />
      </div>

      <div className="relative my-8">
        <input
          id="email"
          name="email"
          type="email"
          className="peer w-full border-none bg-transparent p-0 pb-1.5 text-zinc-100 placeholder-transparent outline-none focus:ring-0 dark:text-zinc-800"
          placeholder="Email"
          required
        />
        <label
          htmlFor="email"
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-zinc-200 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-full peer-focus:text-xs dark:text-zinc-800"
        >
          Email
        </label>
        <ContactFormLine inputId={2} hasError={hasError} />
      </div>

       <div className="relative my-8">
        <textarea
          id="message"
          name="message"
          rows="3"
          className="peer w-full border-none bg-transparent p-0 pb-1.5 text-zinc-100 placeholder-transparent outline-none focus:ring-0 dark:text-zinc-800"
          placeholder="Message"
          required
        />
        <label
          htmlFor="message"
          className="pointer-events-none absolute left-0 top-0 -translate-y-full text-xs text-zinc-200 transition-all duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:-translate-y-full peer-focus:text-xs dark:text-zinc-800"
        >
          Message
        </label>
         <ContactFormLine inputId={3} hasError={hasError} />
      </div>

      <ContactSubmitBtn pending={isPending} />
    </form>
  );
}