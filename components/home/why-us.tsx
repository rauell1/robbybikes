import { MapPinned, MessageSquareText, Images, SearchCheck } from "lucide-react";

const REASONS = [
  {
    icon: MapPinned,
    title: "A real yard in Eastleigh",
    body: "We are on Juja Road, near the Amana / Luqman petrol station. You can see the motorcycles in person before you decide.",
  },
  {
    icon: MessageSquareText,
    title: "Talk to the dealership direct",
    body: "Call or WhatsApp the same team that prepares and sells the bikes. Ask for photos, specifics, or a walk-around.",
  },
  {
    icon: Images,
    title: "Details before you travel",
    body: "Listings show engine size, year, mileage and condition where we have them. Missing details are left blank, not guessed.",
  },
  {
    icon: SearchCheck,
    title: "Inspect before you buy",
    body: "Arrange a viewing at the yard. Check the motorcycle, start it, and confirm the paperwork with our team.",
  },
] as const;

export function WhyUs() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {REASONS.map((reason) => (
        <li
          key={reason.title}
          className="rounded-xl border border-mist-200 bg-white p-5 transition-colors hover:border-mist-300"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-ink-950 text-accent-400">
            <reason.icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-900">
            {reason.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-600">{reason.body}</p>
        </li>
      ))}
    </ul>
  );
}
