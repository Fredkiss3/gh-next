export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 md:gap-5">
        <div className="rounded-md animate-pulse bg-grey h-14 font-medium border-b border-neutral "></div>

        <div className="rounded-md animate-pulse bg-grey h-12"></div>

        <div className="rounded-md animate-pulse bg-grey h-32 w-full" />
      </section>
    </div>
  );
}
