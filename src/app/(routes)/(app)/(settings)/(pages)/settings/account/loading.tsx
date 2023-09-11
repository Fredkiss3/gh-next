import { Skeleton } from "~/app/(components)/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col gap-4 md:gap-8">
        <Skeleton className="h-14 border-b border-neutral" />

        <Skeleton className="h-24 border-b border-neutral" />

        <Skeleton className="h-[300px] border-b border-neutral" />
      </section>

      <section className="flex flex-col gap-4 md:gap-8">
        <Skeleton className="h-14 border-b border-neutral" />

        <Skeleton className="h-32 border-b border-neutral" />
      </section>
    </div>
  );
}
