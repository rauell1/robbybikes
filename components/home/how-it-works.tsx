const STEPS = [
  {
    title: "Browse the available motorcycles",
    body: "Filter by brand, engine size, price and condition. Every listing that is not marked sold is stock we have listed publicly.",
  },
  {
    title: "Contact us to confirm availability",
    body: "Prices and availability can change. Call or WhatsApp with the listing link so we can confirm the bike is still in the yard.",
  },
  {
    title: "Arrange a viewing and inspect",
    body: "Visit us on Juja Road, inspect the motorcycle and its paperwork, then agree the deal in person. No online payments.",
  },
] as const;

export function HowItWorks() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((step, index) => (
        <li key={step.title} className="relative rounded-xl bg-white/5 p-5 ring-1 ring-inset ring-white/10">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">
            {index + 1}
          </span>
          <h3 className="mt-4 text-base font-semibold tracking-tight text-white">{step.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
