import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./app.css";

const SITE_URL = "https://vibefromcafe.id/";
const SITE_TITLE = "Vibe From Cafe — Navigate the AI Shift Together";
const SITE_DESCRIPTION =
  "Vibe From Cafe is a support system for tech workers navigating the AI shift — belajar bareng, build side projects, and grow careers sambil ngopi di cafe favorit.";
const OG_IMAGE_URL = `${SITE_URL}og-image.png`;

export const meta: MetaFunction = () => [
  { title: SITE_TITLE },
  { name: "description", content: SITE_DESCRIPTION },
  { property: "og:title", content: SITE_TITLE },
  { property: "og:description", content: SITE_DESCRIPTION },
  { property: "og:image", content: OG_IMAGE_URL },
  { property: "og:url", content: SITE_URL },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: SITE_TITLE },
  { name: "twitter:description", content: SITE_DESCRIPTION },
  { name: "twitter:image", content: OG_IMAGE_URL },
];

export const links: LinksFunction = () => [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // Preload LCP image (hero logo) to reduce LCP time
  {
    rel: "preload",
    as: "image",
    href: "/logos/vfc-logo-480.jpg",
  },
];

function GoogleFonts() {
  return (
    <>
      {/* Load Google Fonts asynchronously to avoid render-blocking */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        media="print"
        onLoad={(e) => {
          (e.currentTarget as HTMLLinkElement).media = "all";
        }}
      />
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </noscript>
    </>
  );
}

// Runs before React hydrates to avoid a flash of the wrong theme.
const THEME_INIT_SCRIPT = `(function(){var t=localStorage.getItem('vfc-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Meta />
        <Links />
        <GoogleFonts />
      </head>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
