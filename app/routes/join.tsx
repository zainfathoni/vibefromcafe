import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Join — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Join the Vibe From Cafe community. Connect with remote workers across Indonesia.",
  },
];

export default function Join() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-coffee-800 mb-4">
          Join Vibe From Cafe
        </h1>
        <p className="text-coffee-500 text-lg max-w-xl mx-auto">
          Connect with fellow remote workers, share cafe recommendations, and
          find your next workspace.
        </p>
      </div>

      <div className="space-y-6">
        {/* WhatsApp */}
        <a
          href="#"
          className="flex items-center gap-5 bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all p-6 group"
        >
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-coffee-800 group-hover:text-coffee-600">
              WhatsApp Group
            </h2>
            <p className="text-sm text-coffee-400">
              Join our WhatsApp community for real-time cafe recommendations and meetup updates.
            </p>
          </div>
          <svg className="w-5 h-5 text-coffee-300 group-hover:text-coffee-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* X / Twitter */}
        <a
          href="https://x.com/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all p-6 group"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-coffee-800 group-hover:text-coffee-600">
              X (Twitter)
            </h2>
            <p className="text-sm text-coffee-400">
              Follow @vibefromcafe for cafe highlights and community updates.
            </p>
          </div>
          <svg className="w-5 h-5 text-coffee-300 group-hover:text-coffee-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all p-6 group"
        >
          <div className="w-14 h-14 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-coffee-800 group-hover:text-coffee-600">
              Instagram
            </h2>
            <p className="text-sm text-coffee-400">
              Follow @vibefromcafe for cafe photos and community stories.
            </p>
          </div>
          <svg className="w-5 h-5 text-coffee-300 group-hover:text-coffee-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/zainfathoni/vibefromcafe"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-5 bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md transition-all p-6 group"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-coffee-800 group-hover:text-coffee-600">
              GitHub
            </h2>
            <p className="text-sm text-coffee-400">
              Contribute to the project. This website is open source!
            </p>
          </div>
          <svg className="w-5 h-5 text-coffee-300 group-hover:text-coffee-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
