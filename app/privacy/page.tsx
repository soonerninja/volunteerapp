import Link from "next/link";

export default function PrivacyPolicyPage() {
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
            GoodTally &mdash; Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-400">Last Updated: March 2026</p>

          <p className="mt-6 text-sm leading-relaxed text-gray-600">
            GoodTally (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;),
            operated by GoodTally, LLC, an Oklahoma limited liability company,
            operates the goodtally.app platform. This Privacy Policy explains
            how we collect, use, share, and protect your information when you
            use our Service. By using GoodTally, you agree to the practices
            described in this policy.
          </p>

          <div className="mt-8 space-y-8">
            {/* 1 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                1. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We collect the following categories of information:
              </p>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Account information:</strong> Your name, email
                  address, and hashed password when you create an account.
                </li>
                <li>
                  <strong>Organization data:</strong> Information you enter
                  about your nonprofit, including volunteer names, contact
                  details, event records, committee assignments, and logged
                  volunteer hours.
                </li>
                <li>
                  <strong>Location data:</strong> Location information you
                  provide in connection with your organization&rsquo;s address,
                  event locations, or other features that use geographic
                  information. We do not collect your device&rsquo;s GPS
                  location without explicit permission.
                </li>
                <li>
                  <strong>Usage analytics:</strong> Aggregated,
                  non-personally-identifiable data such as page views, feature
                  usage patterns, and session duration, used to improve the
                  Service. This data does not include your volunteers&rsquo;
                  personal records.
                </li>
                <li>
                  <strong>Payment information:</strong> If you subscribe to a
                  paid plan, your payment details are collected and processed
                  directly by Stripe, Inc. We do not store your full credit card
                  number or sensitive payment credentials on our servers. We
                  retain billing records such as transaction IDs and amounts for
                  accounting purposes.
                </li>
                <li>
                  <strong>Communications:</strong> Records of your
                  correspondence with our support team, including emails and any
                  information you voluntarily provide when contacting us.
                </li>
              </ul>
            </section>

            {/* 2 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                2. How We Use Your Information
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We use the information we collect for the following purposes:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  To provide, operate, maintain, and improve the Service
                </li>
                <li>
                  To create and manage your account and authenticate your access
                </li>
                <li>
                  To process payments and send billing-related communications
                </li>
                <li>
                  To send transactional notices such as account confirmations,
                  security alerts, and policy updates
                </li>
                <li>
                  To send service-related and marketing communications (see
                  Section 6 for your opt-out rights)
                </li>
                <li>To respond to your support requests and inquiries</li>
                <li>
                  To analyze aggregate usage patterns to improve and develop new
                  features
                </li>
                <li>
                  To comply with applicable legal obligations and enforce our
                  Terms of Service
                </li>
                <li>
                  To detect, investigate, and prevent fraudulent activity or
                  security incidents
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                3. Organizational Data and Volunteer Privacy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                When your organization uses GoodTally to manage volunteers, you
                may enter personal information about individuals who are not
                account holders &mdash; such as volunteer names, contact
                information, and participation records
                (&ldquo;Volunteer Data&rdquo;).
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                <span className="font-medium text-gray-800">
                  Your Responsibility as Data Controller.
                </span>{" "}
                Your organization acts as the data controller for Volunteer
                Data. GoodTally processes this data solely on your behalf and
                per your instructions as a data processor. You are responsible
                for ensuring that you have obtained all necessary consents,
                authorizations, or other legal bases required to collect and
                store your volunteers&rsquo; personal information through the
                platform, in accordance with applicable law.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                <span className="font-medium text-gray-800">
                  Our Commitment.
                </span>{" "}
                GoodTally will not use, sell, or disclose Volunteer Data for
                any purpose other than operating the Service for your
                organization. Volunteer Data is treated with the same security
                and confidentiality standards as all other user data.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                If a volunteer contacts us directly regarding their data, we
                will direct them to the organization that manages their records,
                as we cannot fulfill data subject requests on behalf of
                organizations without their authorization.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                4. Data Storage and Security
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Your data is stored on cloud infrastructure provided by
                Supabase, which utilizes Amazon Web Services (AWS) data centers.
                All data is encrypted in transit using TLS and encrypted at
                rest. We select infrastructure providers based on their strong
                security practices and compliance posture.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                5. Data Sharing
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We do not sell, rent, trade, or share your personal information
                or organization data with third parties for their own commercial
                purposes. We share data only with the following categories of
                service providers, strictly as necessary to operate the Service:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Supabase:</strong> Database hosting, storage, and
                  authentication services
                </li>
                <li>
                  <strong>Stripe, Inc.:</strong> Payment processing for paid
                  subscription plans
                </li>
                <li>
                  <strong>Email service providers:</strong> Transactional and
                  service-related email delivery
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We require all service providers to maintain appropriate
                confidentiality and security obligations consistent with this
                Privacy Policy. We do not permit them to use your data for their
                own purposes.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We may also disclose your information when required by law,
                court order, or government authority, or when we have a
                good-faith belief that disclosure is necessary to protect the
                rights, safety, or property of GoodTally, our users, or the
                public.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                In the event of a merger, acquisition, or sale of all or
                substantially all of our assets, your information may be
                transferred as part of that transaction. We will notify you via
                email or a prominent notice within the Service prior to your
                information becoming subject to a materially different privacy
                policy.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                6. Email Communications
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                <span className="font-medium text-gray-800">
                  Transactional Emails.
                </span>{" "}
                We will send you emails that are necessary to operate your
                account, including account confirmations, password resets,
                security alerts, billing receipts, and material updates to our
                Terms or Privacy Policy. These emails are not optional as they
                are required for the functioning of the Service.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                <span className="font-medium text-gray-800">
                  Marketing and Product Emails.
                </span>{" "}
                From time to time, we may send you emails about new features,
                tips for using GoodTally, or other product-related information.
                You may opt out of these communications at any time by clicking
                the unsubscribe link in any marketing email or by contacting us
                at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                . Opting out of marketing emails will not affect delivery of
                transactional emails.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We comply with the federal CAN-SPAM Act and all applicable email
                marketing regulations.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                7. Data Retention and Deletion
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We retain your account data and organization data for as long as
                your account is active or as otherwise necessary to provide the
                Service. If you delete your account, we will remove your
                personal information and organization data from our active
                systems within 30 days of your request. Residual data may remain
                in encrypted backup systems for up to 90 days following
                deletion, after which it will be permanently purged.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We may retain certain records where required by law (such as
                billing and transaction records) for the legally required
                retention period, even after account deletion.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                8. Cookies and Tracking
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally currently uses only essential session cookies that are
                strictly necessary for the Service to function, including
                maintaining your authenticated session while you are logged in.
                We do not currently use advertising cookies or third-party
                behavioral tracking cookies.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                We may introduce analytics or performance cookies in the future
                to help us improve the Service. If we do so, we will update this
                policy with advance notice and, where required by law, provide
                appropriate consent mechanisms.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                You may disable cookies through your browser settings, but doing
                so may prevent some features of the Service from functioning
                correctly.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally is not directed at individuals under the age of 13. We
                do not knowingly collect personal information from children
                under 13. If we become aware that we have inadvertently
                collected personal information from a child under 13, we will
                take prompt steps to delete that information from our systems.
                If you believe a child under 13 has provided us with personal
                information, please contact us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                .
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                10. Security Measures
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We implement reasonable and industry-standard technical and
                organizational measures to protect your information, including:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>Encryption of data in transit (TLS) and at rest</li>
                <li>
                  Secure authentication infrastructure provided by Supabase
                </li>
                <li>
                  Role-based access controls limiting data access to authorized
                  personnel and functions
                </li>
                <li>
                  Regular review of our security practices and infrastructure
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                While we take security seriously and use industry-standard
                practices, no system is completely secure, and we cannot
                guarantee the absolute security of your information. In the
                event of a data breach that poses a risk to your rights or
                interests, we will notify affected users in accordance with
                applicable law.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                11. Your Rights
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You have the following rights with respect to your personal
                information:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about your account
                </li>
                <li>
                  <strong>Correction:</strong> Update or correct inaccurate
                  information through your account settings or by contacting us
                </li>
                <li>
                  <strong>Export:</strong> Download your organization&rsquo;s
                  data at any time using our built-in CSV export feature
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and associated personal data by contacting us
                </li>
                <li>
                  <strong>Opt-Out:</strong> Opt out of marketing communications
                  at any time (see Section 6)
                </li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                . We will respond to verified requests within 30 days. Note that
                certain data may be retained as required by law.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                If you are acting on behalf of volunteers whose data is stored
                in the platform, please be aware that their rights must be
                exercised through your organization as the data controller (see
                Section 3).
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                12. Changes to This Policy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We may update this Privacy Policy from time to time. For
                material changes, we will provide at least 14 days&rsquo;
                advance notice by email or through a prominent notice within the
                Service. For non-material changes, we will update the
                &ldquo;Last Updated&rdquo; date at the top of this page. We
                encourage you to review this page periodically. Your continued
                use of the Service after changes take effect constitutes
                acceptance of the updated policy.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                13. Contact Us
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
              <Link href="/pricing" className="hover:text-gray-600">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
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
