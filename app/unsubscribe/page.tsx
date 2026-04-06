import { createClient as createServiceClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Unsubscribe — GoodTally",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ u?: string; c?: string; e?: string }>;
}

/**
 * One-click unsubscribe landing. Honors CAN-SPAM's one-click requirement:
 * the record is written on GET so users don't need a second confirmation.
 * Uses the service role key because these users may not be logged in.
 */
export default async function UnsubscribePage({ searchParams }: Props) {
  const { u: userId, c: category, e: email } = await searchParams;

  let state: "ok" | "error" | "missing" = "missing";
  let message = "";

  if (!category) {
    message = "Missing category.";
  } else if (!userId && !email) {
    message = "Missing recipient.";
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      state = "error";
      message = "Unsubscribe temporarily unavailable. Reply to the email and we'll remove you manually.";
    } else {
      const supabase = createServiceClient(url, serviceKey, { auth: { persistSession: false } });
      const { error } = await supabase
        .from("email_unsubscribes")
        .upsert(
          { user_id: userId ?? null, email: email ?? null, category },
          { onConflict: userId ? "user_id,category" : "email,category" }
        );
      if (error) {
        state = "error";
        message = error.message;
      } else {
        state = "ok";
        message = `You'll stop receiving "${category.replace(/_/g, " ")}" emails from GoodTally.`;
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-2xl font-bold text-blue-600 mb-6">GoodTally</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          {state === "ok" ? "You're unsubscribed" : "Unsubscribe"}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Back to GoodTally →
        </a>
      </div>
    </main>
  );
}
