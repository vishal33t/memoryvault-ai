"use client";

import { useState } from "react";

export default function ProfileForm({
  initialName,
  email,
  createdAt,
}) {
  const [name, setName] = useState(initialName);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  async function handleProfileSubmit(event) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile."
        );
      }

      setName(data.user.name);
      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(
        "/api/profile/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setChangingPassword(false);
    }
  }

  const formattedDate = new Date(
    createdAt
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              {name || "User"}
            </h2>

            <p className="text-sm text-gray-500">
              MemoryVault Account
            </p>
          </div>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="space-y-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              maxLength={100}
              required
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-gray-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-4 py-3 text-gray-500"
            />

            <p className="mt-2 text-xs text-gray-400">
              Email changes will require account
              verification.
            </p>
          </div>

          {/* Account Created */}
          <div>
            <p className="mb-2 text-sm font-medium">
              Account created
            </p>

            <p className="rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {formattedDate}
            </p>
          </div>

          {/* Messages */}
          {profileMessage && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {profileError}
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingProfile
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Security */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Security
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Change your MemoryVault account password.
          </p>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-5"
        >
          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium"
            >
              Current Password
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              autoComplete="current-password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-gray-500"
              placeholder="Enter current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium"
            >
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-gray-500"
              placeholder="Enter new password"
            />

            <p className="mt-2 text-xs text-gray-400">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-gray-500"
              placeholder="Confirm new password"
            />
          </div>

          {/* Messages */}
          {passwordMessage && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {passwordError}
            </div>
          )}

          {/* Change Password */}
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPassword
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}