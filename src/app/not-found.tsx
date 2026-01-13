import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h2 className="text-4xl font-bold">Not Found</h2>
      <p className="text-base-content/60">Could not find requested resource</p>
      <Link href="/" className="btn btn-primary">
        Return Home
      </Link>
    </div>
  )
}
