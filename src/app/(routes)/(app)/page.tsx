import Link from "next/link";

export default async function Page() {
  return (
    <main>
      <h1 className="text-4xl">Home</h1>
      <Link href={`/profile`} className="text-accent underline">
        Profile
      </Link>
    </main>
  );
}
