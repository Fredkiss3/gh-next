import { clsx } from "~/lib/shared-utils";

export default function Loading() {
  return (
    <main
      className={clsx(
        "my-5 max-w-[1270px] mx-auto px-5 flex flex-col gap-6",
        "md:my-6 md:px-8"
      )}
    >
      <section id="hero" className="flex items-center gap-4">
        <div className="rounded-full flex-shrink-0 animate-pulse bg-grey  h-16 w-16" />

        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 rounded-md font-semibold animate-pulse bg-grey" />
          <div className="h-4 w-40 rounded-md text-grey animate-pulse bg-grey" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-9">
        <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-2 w-full">
          <div className="h-7 w-full animate-pulse bg-grey rounded-md" />
          <div className="h-7 w-full animate-pulse bg-grey rounded-md" />
        </div>
        <div className="md:col-span-6 lg:col-span-7 animate-pulse bg-grey rounded-md h-64" />
      </div>
    </main>
  );
}
