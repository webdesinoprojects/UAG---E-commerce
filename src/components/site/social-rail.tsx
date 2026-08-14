const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/URBN-ARMR-GEAR/61560946560115/",
    background: "#3b5998",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M14.2 8.5V6.8c0-.8.5-1 1-1h2.6V1.9L14.2 2c-3.6 0-4.4 2.7-4.4 4.4v2.1H7.5V13h2.3v9h4.4v-9h3.2l.5-4.5h-3.7z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/uag_audio/",
    background: "linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Uag-Audio",
    background: "#d71920",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
];

export default function SocialRail() {
  return (
    <aside className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col overflow-hidden shadow-md md:flex" aria-label="Social media links">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="flex h-11 w-11 items-center justify-center text-white transition-[filter] hover:brightness-110"
          style={{ background: link.background }}
        >
          {link.icon}
        </a>
      ))}
    </aside>
  );
}
