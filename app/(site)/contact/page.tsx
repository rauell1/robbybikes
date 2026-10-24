import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { FacebookIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { buttonStyles } from "@/components/ui/button";
import { business, directionsNote, mapsDirectionsUrl, mapsSearchUrl } from "@/lib/business";
import { generalWhatsAppMessage, telHref, whatsappHref } from "@/lib/contact";
import { autoDealerJsonLd, breadcrumbJsonLd, jsonLdScriptProps, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Contact Robbybikes",
  description:
    "Call 0768 462 250 or 0799 741 062, WhatsApp us, or send an enquiry. Robbybikes is on Juja Road, Eastleigh, Nairobi.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <script {...jsonLdScriptProps(autoDealerJsonLd())} />
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />

      <div className="border-b border-mist-200 bg-mist-50">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Contact Robbybikes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist-600 sm:text-base">
            Ask about a motorcycle, confirm availability, or arrange a viewing. Calling and WhatsApp
            are the fastest ways to reach the team at the yard.
          </p>
        </div>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="space-y-4">
          <div className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink-900">Phone</h2>
            <ul className="mt-3 space-y-3">
              {business.phones.map((phone) => (
                <li key={phone.international}>
                  <a
                    href={telHref(phone.international)}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-mist-50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-950 text-accent-400">
                      <Phone className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{phone.display}</span>
                      <span className="text-xs text-mist-500">{phone.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={whatsappHref(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonStyles({ variant: "whatsapp" }), "mt-4 w-full justify-center")}
            >
              <WhatsAppIcon className="size-4" />
              Chat on WhatsApp
            </a>
            <p className="mt-2 text-[11px] leading-relaxed text-mist-500">
              WhatsApp opens in your own app. Sending a chat is not the same as submitting a website
              enquiry, and we cannot confirm when a message has been read.
            </p>
          </div>

          <div className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink-900">Visit the yard</h2>
            <div className="mt-3 flex gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-600" aria-hidden="true" />
              <address className="not-italic text-mist-600">
                <span className="block font-medium text-ink-900">
                  {business.address.street}, {business.address.area}
                </span>
                {business.address.city}, {business.address.country}
                <span className="mt-1 block text-xs text-mist-500">{business.address.landmark}</span>
              </address>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mist-500">{directionsNote}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "dark" }), "justify-center")}
              >
                <Navigation className="size-4" aria-hidden="true" />
                Directions
              </a>
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "outline" }), "justify-center")}
              >
                <MapPin className="size-4" aria-hidden="true" />
                Google Maps
              </a>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-mist-50 p-3 text-xs text-mist-600">
              <Clock className="mt-0.5 size-4 shrink-0 text-mist-400" aria-hidden="true" />
              <p>
                <span className="font-semibold text-ink-800">Opening hours:</span> being confirmed
                with the dealership. Please call before travelling and we will confirm when the yard
                is open.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-mist-200 bg-white p-5">
            <h2 className="text-base font-semibold text-ink-900">Social</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={business.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonStyles({ variant: "outline", size: "sm" }), "gap-2")}
              >
                <FacebookIcon className="size-4 text-[#1877f2]" />
                Facebook · {business.social.facebookHandle}
              </a>
              {business.social.tiktok ? (
                <a
                  href={business.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonStyles({ variant: "outline", size: "sm" }), "gap-2")}
                >
                  <TikTokIcon className="size-4" />
                  TikTok · {business.social.tiktokHandle}
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-mist-300 px-3 py-2 text-xs text-mist-500">
                  <TikTokIcon className="size-4" />
                  TikTok link to be confirmed
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-mist-200 bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-xl font-bold tracking-tight text-ink-900">Send an enquiry</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-mist-600">
              Tell us what you are looking for and how you would like to be contacted. Fields marked
              with an asterisk are required.
            </p>
            <div className="mt-5">
              <EnquiryForm source="contact" />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-mist-50 p-5 text-sm leading-relaxed text-mist-600">
            <h3 className="text-sm font-semibold text-ink-900">What happens next</h3>
            <p className="mt-1.5">
              Your enquiry is stored for our team to follow up. We use your details only to respond
              to this enquiry (see the{" "}
              <a href="/privacy" className="font-semibold text-accent-700 underline underline-offset-2">
                privacy notice
              </a>
              . We do not accept payments or card details on this website.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
