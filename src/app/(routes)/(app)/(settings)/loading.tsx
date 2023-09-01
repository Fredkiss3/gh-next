import { clsx } from "~/lib/shared/utils.shared";
import { Skeleton } from "~/app/(components)/skeleton";

export default function Loading() {
  return (
    <main
      className={clsx(
        "my-5 max-w-[1270px] mx-auto px-5 flex flex-col gap-6",
        "md:my-6 md:px-8"
      )}
    >
      <section id="hero" className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 flex-shrink-0" shape="circle" />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-9">
        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-2 w-full">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
        <Skeleton className="md:col-span-6 lg:col-span-7 h-64" />
      </div>
    </main>
  );
}
