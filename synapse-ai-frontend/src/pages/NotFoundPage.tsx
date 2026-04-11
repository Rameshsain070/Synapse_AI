import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 text-center">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/chat"
        className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200"
      >
        Back to Chat
      </Link>
    </div>
  );
}
