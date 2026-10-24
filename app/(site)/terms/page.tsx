import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { business } from "@/lib/business";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description:
    "The terms that apply when you use the Robbybikes website, browse motorcycle listings or submit an enquiry.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Terms of use</h1>
      <p className="mt-2 text-sm text-mist-500">Last updated: 23 October 2026</p>

      <div className="prose-page mt-8">
        <p>
          These terms apply to your use of the {business.name} website. By using the site you accept
          them. The site is operated by {business.legalName}, {business.address.display}.
        </p>

        <h2>Motorcycle listings</h2>
        <p>
          Listings describe used motorcycles offered for sale by {business.name}. Specifications,
          photographs and condition notes are provided in good faith by the dealership. Used vehicles
          vary, and details can change or contain errors. Nothing on this website is a warranty or a
          guarantee of condition.
        </p>

        <h2>Prices and availability</h2>
        <p>
          Prices are shown in Kenyan Shillings and are asking prices, not final selling prices. Stock
          changes frequently. A motorcycle shown as available may be sold, reserved or in the process
          of a sale by the time you read the listing. Always contact us to confirm availability before
          travelling.
        </p>

        <h2>No online sales or payments</h2>
        <p>
          This website does not process payments. Enquiries submitted here are requests for
          information, not orders or reservations. Any sale is agreed in person at the dealership
          after you have inspected the motorcycle and its paperwork.
        </p>

        <h2>Sample and demonstration content</h2>
        <p>
          Where a listing or photograph is marked as a sample, it is demonstration content used while
          the site is being prepared and must not be treated as a real offer. We remove sample content
          before publishing verified stock.
        </p>

        <h2>Enquiries and acceptable use</h2>
        <p>
          Please provide accurate contact details and do not use this website to send unlawful,
          abusive, misleading or automated submissions. We may restrict access where we detect abuse.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The {business.name} name, logo and original site content belong to the dealership. Brand and
          model names are used descriptively and remain the property of their owners. We are not an
          authorised dealer for any manufacturer unless stated in writing.
        </p>

        <h2>Third-party links</h2>
        <p>
          Links to Google Maps, WhatsApp, Facebook and similar services take you to third-party
          websites with their own terms. We are not responsible for their content or availability.
        </p>

        <h2>Liability</h2>
        <p>
          We work to keep the site accurate and available, but we do not promise uninterrupted access.
          To the extent permitted by Kenyan law, we are not liable for losses arising from reliance on
          website information without confirming it with the dealership. Nothing in these terms limits
          rights you have under Kenyan consumer law.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Kenya.</p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be raised at the dealership, {business.address.display}, or
          by telephone on {business.phones.map((phone) => phone.display).join(" or ")}.
        </p>
      </div>
    </div>
  );
}
