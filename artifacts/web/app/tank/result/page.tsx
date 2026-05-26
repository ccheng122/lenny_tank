import { Suspense } from "react";
import ResultClient from "./ResultClient";

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <ResultClient />
    </Suspense>
  );
}

function ResultSkeleton() {
  return (
    <main
      className="min-h-screen px-6 pb-24 pt-10 sm:px-10"
      style={{ backgroundColor: "#0f0a08", color: "#f5ede4" }}
    >
      <div className="mx-auto max-w-5xl pt-10 text-center">
        <p style={{ color: "#a8998f", fontStyle: "italic", fontSize: "1.125rem" }}>
          The panel is convening…
        </p>
      </div>
    </main>
  );
}
