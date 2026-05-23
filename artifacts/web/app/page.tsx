export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Next.js + TypeScript + Tailwind
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Your new app is ready. Start editing{" "}
          <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
            app/page.tsx
          </code>{" "}
          to get started.
        </p>
      </div>
    </main>
  );
}
