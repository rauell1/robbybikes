import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { business } from "@/lib/business";
import { telHref } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy notice",
  description:
    "How Robbybikes collects, uses and protects the personal information you share when enquiring about a motorcycle.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        Privacy notice
      </h1>
      <p className="mt-2 text-sm text-mist-500">Last updated: 23 October 2026</p>

      <div className="prose-page mt-8">
        <p>
          This notice explains how {business.legalName} (&ldquo;{business.name}&rdquo;, &ldquo;we&rdquo;)
          handles personal information submitted through this website. It is written to reflect the
          Kenya Data Protection Act, 2019.
        </p>

        <h2>What we collect</h2>
        <p>When you send an enquiry we collect only what we need to reply:</p>
        <ul>
          <li>Your name.</li>
          <li>Your phone number.</li>
          <li>Your email address, if you choose to provide it.</li>
          <li>Your preferred contact method.</li>
          <li>The message you write, including any motorcycle you ask about.</li>
          <li>The date and time you consented to us contacting you.</li>
        </ul>
        <p>
          We do not ask for identity documents, payment card details, or any sensitive personal data
          through this website. If you contact us by WhatsApp or telephone, that conversation is
          governed by the privacy terms of that service and our own handling of the information you
          share.
        </p>

        <h2>Why we use it</h2>
        <p>
          We use your details solely to respond to your enquiry, confirm motorcycle availability, and
          arrange a viewing. We do not sell your information, and we do not add you to marketing
          lists without asking.
        </p>

        <h2>Who can see it</h2>
        <p>
          Enquiries are visible only to authorised {business.name} staff who need them to follow up.
          We use service providers for website hosting, database storage and image delivery; they
          process data on our behalf. We do not publish customer enquiries.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep enquiries for as long as needed to deal with your request and any follow-up sale,
          and normally no longer than 24 months after the last contact. You can ask us to delete your
          enquiry sooner.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          This website is designed to work without advertising cookies. If the dealership later
          enables website analytics, this notice will be updated and any consent required by law will
          be requested first. Server logs kept by our hosting provider may record technical
          information such as your IP address for security and reliability.
        </p>

        <h2>Your rights</h2>
        <p>
          Under the Data Protection Act, 2019 you may ask to access, correct or delete the personal
          information we hold about you, or object to how it is used. To make a request, call{" "}
          <a href={telHref(business.phones[0].international)}>{business.phones[0].display}</a> or{" "}
          <a href={telHref(business.phones[1].international)}>{business.phones[1].display}</a>, or visit
          us at {business.address.display}. We may need to confirm your identity before acting on a
          request.
        </p>
        <p>
          If you are not satisfied with our response, you may contact the Office of the Data
          Protection Commissioner in Kenya.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this notice as the website or our practices change. The date at the top shows
          the latest revision.
        </p>
      </div>
    </div>
  );
}
