import Image from "next/image";
import Link from "next/link";
import { BUCKET_LABELS, type Bucket } from "@data";
import { BUCKET_META } from "@/lib/buckets-meta";

const buckets = Object.keys(BUCKET_LABELS) as Bucket[];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden px-6 pb-24 pt-16 sm:px-10">
      {/* Hero */}
      <div className="mx-auto max-w-3xl text-center">
        {/* Eyebrow */}
        <p className="text-eyebrow mb-4">
          Shark-tank-style scenario practice
        </p>

        {/* Title — Caveat script via --font-caveat token */}
        <h1
          className="mt-2 text-6xl font-bold leading-tight sm:text-8xl"
          style={{ fontFamily: "var(--font-caveat)", color: "var(--color-text-primary)" }}
        >
          The Lenny Tank
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Practice the high-stakes decisions of your craft.{" "}
          <br></br>
          <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
            Get feedback from people who've already lived them.
          </span>
        </p>
      </div>

      {/* Hero visual: lone fin slicing through the waterline.
          Bleeds edge-to-edge (negative margins escape main's padding); mask fades cream into page cream at the top. */}
      <div
        className="relative mt-12 -mx-6 overflow-hidden sm:-mx-10"
        style={{
          aspectRatio: "16 / 5",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 28%, black 100%)",
        }}
      >
        <Image
          src="/images/shark-fin-waterline.png"
          alt="An orange shark fin slicing through the water's surface"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Bucket grid */}
      <div className="mx-auto mt-14 max-w-5xl">
        <p className="text-eyebrow mb-8 text-center">Pick your arena</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buckets.map((key) => {
            const { image, description, iconScale } = BUCKET_META[key];
            const label = BUCKET_LABELS[key];

            return (
              <Link
                key={key}
                href={`/arena/${key}`}
                className="card card-interactive group relative flex flex-col items-center gap-3 p-6 transition-all duration-200 hover:-translate-y-0.5"
              >
                <Image
                  src={`/images/${image}.png`}
                  alt={`${label} icon`}
                  width={80}
                  height={80}
                  className="h-24 w-24 object-contain"
                  style={iconScale ? { transform: `scale(${iconScale})` } : undefined}
                  unoptimized
                />

                <div className="w-full text-center">
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {label}
                  </h2>
                  <p
                    className="mt-1.5 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {description}
                  </p>
                </div>

                <div
                  className="mt-auto flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Enter arena
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-16 flex flex-col items-center gap-4">
        <p
          className="text-center text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          Inspired by the guests of{" "}
          <span style={{ color: "var(--color-brand-orange)" }}>
            Lenny's Podcast
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/about" className="btn-secondary">
            About
          </Link>
          <a
            href="https://www.lennysnewsletter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Lenny's Newsletter
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
