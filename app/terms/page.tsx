import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service – GoodTally",
  alternates: {
    canonical: "https://goodtally.app/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-blue-600">
            GoodTally
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            GoodTally &mdash; Terms of Service
          </h1>
          <p className="mt-2 text-sm text-gray-400">Last Updated: March 2026</p>

          <p className="mt-6 text-sm leading-relaxed text-gray-600">
            These Terms govern your use of GoodTally, a service operated by
            GoodTally, LLC, an Oklahoma limited liability company
            (&ldquo;GoodTally,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;).
          </p>

          <div className="mt-8 space-y-8">
            {/* 1 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                By accessing or using GoodTally (the &ldquo;Service&rdquo;), you
                agree to be bound by these Terms of Service
                (&ldquo;Terms&rdquo;). If you are accessing or using the Service
                on behalf of an organization, you represent and warrant that you
                have the authority to bind that organization to these Terms, and
                all references to &ldquo;you&rdquo; or &ldquo;your&rdquo;
                include that organization.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                If you do not agree to these Terms, you must not access or use
                the Service. Your continued use of the Service after any
                modifications to these Terms constitutes acceptance of those
                modifications.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                2. Description of Service
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally is a volunteer management platform designed for
                nonprofit organizations. The Service enables organizations to
                track volunteers, log hours, manage events, organize committees,
                and export data. We offer both free and paid subscription plans
                as described on our pricing page at{" "}
                <Link href="/pricing" className="text-blue-600 hover:underline">
                  goodtally.app/pricing
                </Link>
                . Plan features and pricing are subject to change with
                reasonable notice.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                3. User Accounts and Responsibilities
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                To access the Service, you must create an account using a valid
                email address and a secure password. You are solely responsible
                for maintaining the confidentiality of your account credentials
                and for all activity that occurs under your account, whether or
                not authorized by you. You agree to provide accurate, current,
                and complete information during registration and to update that
                information as necessary to keep it accurate.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                You must notify us immediately at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>{" "}
                if you suspect unauthorized access to or use of your account.
                GoodTally is not liable for any loss or damage arising from
                your failure to maintain the security of your credentials.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                4. Acceptable Use
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You agree to use the Service only for lawful purposes and in
                accordance with these Terms. You may not:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  Upload, transmit, or store malicious code, viruses, or any
                  software designed to damage or disrupt the Service or any
                  systems connected to it
                </li>
                <li>
                  Attempt to gain unauthorized access to any accounts, systems,
                  or networks related to the Service
                </li>
                <li>
                  Use the Service to harass, abuse, threaten, defame, or harm
                  any person or entity
                </li>
                <li>
                  Resell, sublicense, or redistribute access to the Service
                  without our prior written permission
                </li>
                <li>
                  Interfere with or disrupt the integrity, performance, or
                  security of the Service
                </li>
                <li>
                  Scrape, crawl, or systematically extract data from the Service
                  without written authorization
                </li>
                <li>
                  Use the Service to store, process, or transmit data in
                  violation of applicable laws, including privacy and data
                  protection laws
                </li>
                <li>
                  Reverse engineer, decompile, or attempt to derive source code
                  from the Service
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We reserve the right to investigate and take appropriate legal
                action against anyone who, in our sole discretion, violates
                these provisions.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                5. Data and Content Ownership
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You retain full ownership of all data, content, and information
                you upload, enter, or create through the Service, including
                volunteer records, event information, and hour logs (&ldquo;Your
                Content&rdquo;). GoodTally does not claim any intellectual
                property rights over Your Content.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                By using the Service, you grant GoodTally a limited,
                non-exclusive, royalty-free license to host, store, process, and
                display Your Content solely as necessary to provide and operate
                the Service for you. This license terminates when your account
                is closed, subject to our data retention practices described in
                our Privacy Policy.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                You represent and warrant that you have all rights necessary to
                upload Your Content to the Service and that doing so does not
                violate any applicable law or the rights of any third party,
                including the privacy rights of volunteers whose data you enter
                into the platform.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                6. Billing, Subscriptions, and Refunds
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">
                    Subscription Plans.
                  </span>{" "}
                  Paid plans are billed on an annual basis as described on our
                  pricing page. All fees are stated in U.S. dollars and are
                  exclusive of applicable taxes, which you are responsible for
                  paying.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Payment Processing.
                  </span>{" "}
                  All payments are processed by Stripe. By subscribing to a paid
                  plan, you authorize GoodTally to charge your payment method on
                  file for all applicable fees. You agree to keep your payment
                  information current and accurate.
                </p>
                <p>
                  <span className="font-medium text-gray-800">No Refunds.</span>{" "}
                  All subscription fees are non-refundable. We do not provide
                  refunds or credits for partial billing periods, unused time, or
                  unused features, except where expressly required by applicable
                  law. If you believe a charge was made in error, contact us at{" "}
                  <a
                    href="mailto:support@goodtally.app"
                    className="text-blue-600 hover:underline"
                  >
                    support@goodtally.app
                  </a>{" "}
                  within 30 days of the charge and we will investigate in good
                  faith.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Plan Downgrades.
                  </span>{" "}
                  If you choose to downgrade to a lower tier plan, the downgrade
                  will take effect at the end of your current annual billing
                  cycle. You will continue to have access to your current
                  plan&rsquo;s features until that date, at which point your
                  account will transition to the lower tier.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Cancellations.
                  </span>{" "}
                  You may cancel your subscription at any time. Cancellation will
                  take effect at the end of your current annual billing cycle.
                  You will retain access to the Service until that date.
                  Cancellation does not entitle you to a prorated refund for any
                  remaining period.
                </p>
                <p>
                  <span className="font-medium text-gray-800">Free Plans.</span>{" "}
                  Free plan users may access a limited version of the Service at
                  no charge. GoodTally reserves the right to modify, limit, or
                  discontinue the free plan at any time with reasonable notice.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Price Changes.
                  </span>{" "}
                  We reserve the right to change subscription pricing at any
                  time. We will notify you of any price changes at least 30 days
                  in advance. Your continued use of a paid plan after a price
                  change takes effect constitutes your acceptance of the new
                  pricing.
                </p>
              </div>
            </section>

            {/* 7 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                7. Service Availability
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis. While we strive to maintain reliable and
                continuous availability, we do not guarantee uninterrupted,
                error-free, or secure operation of the Service. We may perform
                scheduled or emergency maintenance, which may result in temporary
                unavailability. We do not offer formal service level agreements
                (SLAs) unless separately agreed in writing.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                8. Disclaimer of Warranties
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 uppercase font-medium">
                To the maximum extent permitted by applicable law, GoodTally
                expressly disclaims all warranties of any kind, whether express,
                implied, statutory, or otherwise, including but not limited to
                implied warranties of merchantability, fitness for a particular
                purpose, title, and non-infringement. GoodTally makes no
                warranty that the Service will meet your requirements, achieve
                any intended results, be compatible with any other software or
                systems, operate without interruption, or be error-free.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Some jurisdictions do not allow the exclusion of certain
                warranties, so some of the above exclusions may not apply to you.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                9. Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 uppercase font-medium">
                To the maximum extent permitted by applicable law, in no event
                shall GoodTally, its operators, employees, agents, licensors, or
                service providers be liable for any indirect, incidental,
                special, consequential, exemplary, or punitive damages,
                including but not limited to loss of data, loss of revenue, loss
                of profits, loss of goodwill, or business interruption, arising
                out of or in connection with your use of or inability to use the
                Service, even if GoodTally has been advised of the possibility
                of such damages.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 uppercase font-medium">
                Our total cumulative liability to you for all claims arising out
                of or relating to these Terms or the Service shall not exceed the
                greater of (a) the total fees you paid to GoodTally in the
                twelve (12) months immediately preceding the claim, or (b) one
                hundred dollars ($100.00).
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                The limitations in this section apply to all theories of
                liability, including contract, tort, strict liability, and any
                other legal or equitable theory. Some jurisdictions do not allow
                the limitation of liability for certain types of damages, so
                some of the above limitations may not apply to you.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                10. Indemnification
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You agree to defend, indemnify, and hold harmless GoodTally and
                its officers, directors, employees, contractors, agents,
                licensors, and service providers from and against any claims,
                liabilities, damages, judgments, awards, losses, costs,
                expenses, or fees (including reasonable attorneys&rsquo; fees)
                arising out of or relating to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  Your use of the Service or any activities conducted through
                  your account
                </li>
                <li>
                  Your Content, including any claim that Your Content violates
                  the rights of any third party
                </li>
                <li>Your violation of these Terms</li>
                <li>
                  Your violation of any applicable law, regulation, or
                  third-party right
                </li>
                <li>
                  Your failure to obtain proper consents from individuals whose
                  data you enter into the platform
                </li>
              </ul>
            </section>

            {/* 11 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                11. Termination
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You may close your account at any time by contacting us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                . We reserve the right to suspend or terminate your account and
                access to the Service, with or without notice, if you violate
                these Terms, engage in fraudulent or illegal activity, or use
                the Service in a manner that could harm other users, third
                parties, or GoodTally.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Upon termination or expiration of your account, you may request
                an export of Your Content within 30 days. After that period, we
                may permanently delete your data from our systems in accordance
                with our Privacy Policy. GoodTally is not liable for any loss of
                data following the 30-day export window.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                The following sections shall survive termination of your account
                or these Terms: Section 4 (Acceptable Use), Section 5 (Data and
                Content Ownership), Section 6 (Billing — payment obligations
                accrued prior to termination), Section 8 (Disclaimer of
                Warranties), Section 9 (Limitation of Liability), Section 10
                (Indemnification), Section 14 (Governing Law), and Section 15
                (General Provisions).
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                12. Force Majeure
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally shall not be liable for any failure or delay in
                performance under these Terms to the extent caused by
                circumstances beyond our reasonable control, including but not
                limited to acts of God, natural disasters, pandemic, war,
                terrorism, civil unrest, government actions, internet or
                telecommunications failures, power outages, third-party
                infrastructure failures (including those of cloud hosting
                providers), denial-of-service attacks, or any other event
                outside our reasonable control. In such circumstances, our
                obligations will be suspended for the duration of the event
                causing the failure or delay.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                13. Changes to These Terms
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We may update these Terms from time to time. For material
                changes &mdash; particularly those affecting billing, liability,
                or user rights &mdash; we will provide at least 14 days&rsquo;
                advance notice by email to the address on your account, or
                through a prominent notice within the Service, and may require
                affirmative re-acceptance before continued use.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                For non-material changes (such as clarifications or
                corrections), we will update the &ldquo;Last Updated&rdquo; date
                at the top of this page, and your continued use of the Service
                constitutes acceptance of those changes.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                14. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">
                    Governing Law.
                  </span>{" "}
                  These Terms and any dispute arising out of or relating to them
                  or the Service shall be governed by and construed in accordance
                  with the laws of the State of Oklahoma, without regard to its
                  conflict of law provisions.
                </p>
                <p>
                  <span className="font-medium text-gray-800">Venue.</span> You
                  agree that any legal action or proceeding between you and
                  GoodTally relating to these Terms or the Service shall be
                  brought exclusively in the state or federal courts located in
                  Cleveland County, Oklahoma. You consent to the personal
                  jurisdiction and venue of such courts and waive any objection
                  to such jurisdiction or venue.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Informal Resolution.
                  </span>{" "}
                  Before filing any formal legal claim, you agree to contact us
                  at{" "}
                  <a
                    href="mailto:support@goodtally.app"
                    className="text-blue-600 hover:underline"
                  >
                    support@goodtally.app
                  </a>{" "}
                  and attempt to resolve the dispute informally for at least 30
                  days. This does not limit either party&rsquo;s right to seek
                  emergency injunctive relief.
                </p>
                <p className="uppercase font-medium">
                  Waiver of Class Actions. To the extent permitted by law, you
                  agree that any dispute resolution proceedings will be conducted
                  only on an individual basis and not in a class, consolidated,
                  or representative action.
                </p>
              </div>
            </section>

            {/* 15 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                15. General Provisions
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">
                    Entire Agreement.
                  </span>{" "}
                  These Terms, together with our Privacy Policy and any other
                  agreements expressly incorporated by reference, constitute the
                  entire agreement between you and GoodTally with respect to the
                  Service and supersede all prior agreements, representations,
                  and understandings.
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Severability.
                  </span>{" "}
                  If any provision of these Terms is found to be unenforceable
                  or invalid under applicable law, that provision will be limited
                  or eliminated to the minimum extent necessary, and the
                  remaining provisions will continue in full force and effect.
                </p>
                <p>
                  <span className="font-medium text-gray-800">No Waiver.</span>{" "}
                  Our failure to enforce any right or provision of these Terms
                  will not be considered a waiver of those rights. Any waiver of
                  any provision of these Terms will be effective only if in
                  writing and signed by an authorized representative of
                  GoodTally.
                </p>
                <p>
                  <span className="font-medium text-gray-800">Assignment.</span>{" "}
                  You may not assign or transfer these Terms or your rights under
                  them without our prior written consent. GoodTally may assign
                  these Terms freely, including in connection with a merger,
                  acquisition, or sale of assets.
                </p>
                <p>
                  <span className="font-medium text-gray-800">Notices.</span>{" "}
                  Notices to GoodTally must be sent in writing to the contact
                  information below. We may provide notices to you via the email
                  address on your account or through the Service interface.
                </p>
              </div>
            </section>

            {/* 16 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                16. Contact Us
              </h2>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href="mailto:support@goodtally.app"
                    className="text-blue-600 hover:underline"
                  >
                    support@goodtally.app
                  </a>
                </p>
                <p>
                  <span className="font-medium">Company:</span> GoodTally, LLC
                </p>
                <p>
                  <span className="font-medium">Location:</span> Norman,
                  Oklahoma
                </p>
              </div>
            </section>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-6 text-xs text-gray-400">
            <p>
              GoodTally&trade; is a trademark of GoodTally, LLC, Norman,
              Oklahoma.
            </p>
            <p className="mt-1">
              &copy; 2026 GoodTally, LLC. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex gap-4">
              <Link href="/contact" className="hover:text-gray-600">
                Contact
              </Link>
              <Link href="/pricing" className="hover:text-gray-600">
                Pricing
              </Link>
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
              </Link>
              <Link href="/login" className="hover:text-gray-600">
                Sign In
              </Link>
            </div>
          </div>
          <p className="mt-3 text-center text-gray-300">
            &copy; {new Date().getFullYear()} GoodTally, LLC. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
