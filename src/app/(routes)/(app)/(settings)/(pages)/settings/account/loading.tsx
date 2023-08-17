import { Skeleton } from "~/app/(components)/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 md:gap-5">
        <Skeleton className="h-14 border-b border-neutral" />

        <Skeleton className="h-12 border-b border-neutral" />

        <Skeleton className="h-32 border-b border-neutral" />
      </section>
    </div>
  );
}
