"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Shield, CheckCircle, AlertCircle, User } from "lucide-react";

type MessageType = { text: string; type: "success" | "error" } | null;

function StatusMessage({ message }: { message: MessageType }) {
  if (!message) return null;
  const isError = message.type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
        isError
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
      ) : (
        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
      )}
      {message.text}
    </div>
  );
}

export default function AccountPage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  // Change display name state
  const [displayName, setDisplayName] = useState(profile?.full_name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<MessageType>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<MessageType>(null);

  // Change email state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<MessageType>(null);

  const handleChangeName = async () => {
    setNameMsg(null);
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setNameMsg({ text: "Name must be at least 2 characters.", type: "error" });
      return;
    }
    if (trimmed.includes("@")) {
      setNameMsg({ text: "Name cannot contain an @ symbol.", type: "error" });
      return;
    }
    if (trimmed === profile?.full_name) {
      setNameMsg({ text: "That's already your current name.", type: "error" });
      return;
    }
    setNameLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", user?.id ?? "");
    if (error) {
      setNameMsg({ text: error.message || "Failed to update name.", type: "error" });
    } else {
      await refreshProfile();
      setNameMsg({ text: "Display name updated.", type: "success" });
    }
    setNameLoading(false);
  };

  const handleChangePassword = async () => {
    setPasswordMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: "Please fill in all password fields.", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ text: "New password must be at least 8 characters.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMsg({ text: "New password must be different from your current password.", type: "error" });
      return;
    }

    setPasswordLoading(true);

    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPassword,
    });

    if (signInError) {
      setPasswordMsg({
        text: "Current password is incorrect.",
        type: "error",
      });
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMsg({
        text: error.message || "Failed to update password. Please try again.",
        type: "error",
      });
    } else {
      setPasswordMsg({ text: "Password updated successfully.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setPasswordLoading(false);
  };

  const handleChangeEmail = async () => {
    setEmailMsg(null);

    if (!newEmail) {
      setEmailMsg({ text: "Please enter a new email address.", type: "error" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailMsg({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setEmailMsg({ text: "New email is the same as your current email.", type: "error" });
      return;
    }

    setEmailLoading(true);

    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      setEmailMsg({
        text: error.message || "Failed to update email. Please try again.",
        type: "error",
      });
    } else {
      setEmailMsg({
        text: "Confirmation email sent to both your current and new email address. Please check your inbox and click the confirmation links to complete the change.",
        type: "success",
      });
      setNewEmail("");
      setEmailPassword("");
    }

    setEmailLoading(false);
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    if (error) {
      setEmailMsg({
        text: error.message || "Failed to resend verification email.",
        type: "error",
      });
    } else {
      setEmailMsg({
        text: "Verification email resent. Please check your inbox.",
        type: "success",
      });
    }
  };

  const isEmailConfirmed = user?.email_confirmed_at != null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Security</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your password and email address.
        </p>
      </div>

      {/* Current Account Info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Account Info</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="ml-auto">
            {isEmailConfirmed ? (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Unverified
                </span>
                <button
                  onClick={handleResendVerification}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Resend verification
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Change Display Name */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Display Name</h2>
        </div>

        <div className="max-w-md space-y-4">
          <Input
            label="Full Name"
            id="display_name"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setNameMsg(null);
            }}
          />

          <StatusMessage message={nameMsg} />

          <Button
            onClick={handleChangeName}
            loading={nameLoading}
            disabled={!displayName.trim()}
          >
            Update Name
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>

        <div className="max-w-md space-y-4">
          <Input
            label="Current Password"
            id="current_password"
            type="password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordMsg(null);
            }}
          />
          <Input
            label="New Password"
            id="new_password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordMsg(null);
            }}
          />
          <Input
            label="Confirm New Password"
            id="confirm_password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordMsg(null);
            }}
          />

          <StatusMessage message={passwordMsg} />

          <Button
            onClick={handleChangePassword}
            loading={passwordLoading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </Card>

      {/* Change Email */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Change Email</h2>
        </div>

        <div className="max-w-md space-y-4">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p className="text-sm text-gray-600">
              Current email: <span className="font-medium text-gray-900">{user?.email}</span>
            </p>
          </div>

          <Input
            label="New Email Address"
            id="new_email"
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setEmailMsg(null);
            }}
          />

          <StatusMessage message={emailMsg} />

          <div>
            <Button
              onClick={handleChangeEmail}
              loading={emailLoading}
              disabled={!newEmail}
            >
              Change Email
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              We&apos;ll send a verification link to your new email address. Once confirmed,
              your account will be updated. A security notification will be sent to your
              current email.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
