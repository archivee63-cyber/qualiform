import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-bold text-neutral-800">404</h1>
        <p className="text-xl text-neutral-400">Cette page n&apos;existe pas</p>
        <Link href="/" className="inline-flex rounded-full bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-neutral-200">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
