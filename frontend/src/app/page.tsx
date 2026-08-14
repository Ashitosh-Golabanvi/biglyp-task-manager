import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-3">
          Task Manager
        </h1>

        <p className="text-gray-600 mb-8">
          Manage your tasks easily and efficiently.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full border rounded px-4 py-3 font-medium hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="w-full border rounded px-4 py-3 font-medium hover:bg-gray-100"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}