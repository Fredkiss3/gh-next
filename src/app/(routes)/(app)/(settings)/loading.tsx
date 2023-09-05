import { clsx } from "~/lib/shared/utils.shared";
import { Skeleton } from "~/app/(components)/skeleton";

export default function Loading() {
  return (
    <main
      className={clsx(
        "mx-auto my-5 flex max-w-[1270px] flex-col gap-6 px-5",
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
        <div className="flex w-full flex-col gap-2 md:col-span-3 lg:col-span-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
        <Skeleton className="h-64 md:col-span-6 lg:col-span-7" />
      </div>
    </main>
  );
}
