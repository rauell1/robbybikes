"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { WhatsAppIcon } from "@/components/icons";
import { submitEnquiry } from "@/lib/actions/enquiry-actions";
import { initialEnquiryState } from "@/lib/actions/state";
import { business } from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type EnquiryFormProps = {
  motorcycleId?: string;
  source?: string;
  defaultMessage?: string;
  compact?: boolean;
};

export function EnquiryForm({ motorcycleId, source, defaultMessage, compact = false }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialEnquiryState);
  const formRef = useRef<HTMLFormElement>(null);
  const startedAtRef = useRef<HTMLInputElement>(null);

  // Record when the form was shown (used server-side as a bot heuristic).
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      trackEvent("enquiry_submitted", { source: source ?? "contact" });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.status, source]);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-emerald-950">Enquiry received</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-900/80">
          {state.message}
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs text-emerald-900/60">
          Need an answer sooner? Call or WhatsApp us and mention the motorcycle you are asking about.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <a
            href={whatsappHref(
              `Hello ${business.name}, I have just sent an enquiry through your website. I would like to follow up.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonStyles({ variant: "whatsapp", size: "md" }), "justify-center")}
          >
            <WhatsAppIcon className="size-4" />
            Continue on WhatsApp
          </a>
          <a
            href={telHref(business.phones[0].international)}
            className={cn(buttonStyles({ variant: "outline", size: "md" }), "justify-center")}
          >
            Call {business.phones[0].display}
          </a>
        </div>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {state.message}
        </div>
      ) : null}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <Field label="Your name" htmlFor="enquiry-name" required error={errors.name?.[0]}>
          <Input
            id="enquiry-name"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "enquiry-name-error" : undefined}
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="enquiry-phone"
          required
          hint="Kenyan mobile, e.g. 0712 345 678"
          error={errors.phone?.[0]}
        >
          <Input
            id="enquiry-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="0712 345 678"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "enquiry-phone-error" : "enquiry-phone-hint"}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="enquiry-email"
          optional
          error={errors.email?.[0]}
        >
          <Input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          label="Preferred contact method"
          htmlFor="enquiry-contact"
          error={errors.preferredContact?.[0]}
        >
          <Select id="enquiry-contact" name="preferredContact" defaultValue="phone">
            <option value="phone">Phone call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Your message"
        htmlFor="enquiry-message"
        required
        hint="Include the motorcycle you are interested in and when you would like to visit."
        error={errors.message?.[0]}
      >
        <Textarea
          id="enquiry-message"
          name="message"
          rows={4}
          required
          maxLength={1500}
          defaultValue={defaultMessage}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "enquiry-message-error" : "enquiry-message-hint"}
        />
      </Field>

      <div className="flex items-start gap-3 rounded-lg bg-mist-50 p-3">
        <input
          id="enquiry-consent"
          name="consent"
          type="checkbox"
          required
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "enquiry-consent-error" : undefined}
          className="mt-0.5 size-4 shrink-0 rounded border-mist-300 accent-accent-600"
        />
        <div>
          <label htmlFor="enquiry-consent" className="text-xs leading-relaxed text-ink-700">
            I agree that {business.name} may use the details I have provided to respond to this
            enquiry. See our{" "}
            <Link href="/privacy" className="font-semibold text-accent-700 underline underline-offset-2">
              privacy notice
            </Link>
            .
          </label>
          {errors.consent?.[0] ? (
            <p className="field-error" id="enquiry-consent-error" role="alert">
              {errors.consent[0]}
            </p>
          ) : null}
        </div>
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {motorcycleId ? <input type="hidden" name="motorcycleId" value={motorcycleId} /> : null}
      <input type="hidden" name="source" value={source ?? "contact"} />
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Sending enquiry…
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            Send enquiry
          </>
        )}
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-mist-500">
        We only use these details to respond to your enquiry. No online payment is taken on this
        site.
      </p>
    </form>
  );
}
