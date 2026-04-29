"use client";

import * as React from "react";

import { SelectMenu } from "@/components/ui/SelectMenu";
import { TextField } from "@/components/ui/TextField";

type LanguageOption = { id: string; label: string };

const LANGUAGES: LanguageOption[] = [
  { id: "Arabic", label: "Arabic" },
  { id: "English", label: "English" },
  { id: "French", label: "French" },
  { id: "Urdu", label: "Urdu" },
  { id: "Spanish", label: "Spanish" },
  { id: "German", label: "German" },
];

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#eeedf5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="border-b border-[#eeedf5] bg-[#fdfcfc] px-6 pb-5 pt-5">
        <div className="text-base font-semibold leading-6 text-[#414651]">
          {title}
        </div>
        <div className="mt-1 text-[13px] leading-[19.5px] text-[#535862]">
          {description}
        </div>
      </div>
      <div className="px-6 pb-6 pt-6">{children}</div>
    </div>
  );
}

export function ProfileSettingsPanel() {
  const initial = React.useMemo(
    () => ({
      firstName: "Abdullah",
      lastName: "Al Harbi",
      email: "abdullah.h@mofa.gov.sa",
      spoken: "Arabic",
      target: "English",
      avatarUrl: null as string | null,
    }),
    [],
  );

  const [firstName, setFirstName] = React.useState(initial.firstName);
  const [lastName, setLastName] = React.useState(initial.lastName);
  const [spoken, setSpoken] = React.useState<string | null>(initial.spoken);
  const [target, setTarget] = React.useState<string | null>(initial.target);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    initial.avatarUrl,
  );
  const [saving, setSaving] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"idle" | "saved">("idle");

  const fileInputId = React.useId();

  const errors = React.useMemo(() => {
    const e: { firstName?: string; lastName?: string } = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    return e;
  }, [firstName, lastName]);

  const dirty =
    firstName !== initial.firstName ||
    lastName !== initial.lastName ||
    spoken !== initial.spoken ||
    target !== initial.target ||
    avatarUrl !== initial.avatarUrl;

  const canSave = dirty && !saving && Object.keys(errors).length === 0;

  const initials = `${firstName.trim()[0] ?? "A"}${lastName.trim()[0] ?? "H"}`
    .toUpperCase()
    .slice(0, 2);

  function onCancel() {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setSpoken(initial.spoken);
    setTarget(initial.target);
    setAvatarUrl(initial.avatarUrl);
    setSaveState("idle");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setSaveState("idle");
    // Simulate async save (wire to API later)
    await new Promise((r) => setTimeout(r, 450));
    setSaving(false);
    setSaveState("saved");
  }

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <SettingsCard
        title="Personal Information"
        description="Update your personal photo and details."
      >
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f3f3f7] text-[28px] font-semibold leading-[42px] text-[#6e6b8b]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <input
                id={fileInputId}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setAvatarUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                  });
                  setSaveState("idle");
                }}
              />
              <label
                htmlFor={fileInputId}
                className="cursor-pointer select-none rounded-lg border border-[#d5d7da] bg-white px-[17px] py-[7px] text-[13px] font-semibold leading-[19.5px] text-[#414651] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                Upload new avatar
              </label>
              <button
                type="button"
                className="text-[13px] font-semibold leading-[19.5px] text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!avatarUrl}
                onClick={() => {
                  if (avatarUrl) URL.revokeObjectURL(avatarUrl);
                  setAvatarUrl(null);
                  setSaveState("idle");
                }}
              >
                Remove
              </button>
            </div>
            <div className="text-[13px] leading-[19.5px] text-[#8c9196]">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <TextField
            id="settings-first-name"
            label="First name"
            value={firstName}
            onChange={(v) => {
              setFirstName(v);
              setSaveState("idle");
            }}
            error={errors.firstName ?? null}
          />
          <TextField
            id="settings-last-name"
            label="Last name"
            value={lastName}
            onChange={(v) => {
              setLastName(v);
              setSaveState("idle");
            }}
            error={errors.lastName ?? null}
          />
          <TextField
            id="settings-email"
            label="Email address"
            value={initial.email}
            onChange={() => {}}
            disabled
            className="md:col-span-2"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Translation Preferences"
        description="Manage your default language configurations for new meetings."
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <div className="text-[13px] font-medium leading-[19.5px] text-[#414651]">
              Default Spoken Language
            </div>
            <SelectMenu
              id="settings-default-spoken"
              value={spoken}
              options={LANGUAGES}
              placeholder="Select language"
              onChange={(v) => {
                setSpoken(v);
                setSaveState("idle");
              }}
            />
          </div>
          <div className="space-y-1.5">
            <div className="text-[13px] font-medium leading-[19.5px] text-[#414651]">
              Default Target Language
            </div>
            <SelectMenu
              id="settings-default-target"
              value={target}
              options={LANGUAGES}
              placeholder="Select language"
              onChange={(v) => {
                setTarget(v);
                setSaveState("idle");
              }}
            />
          </div>
        </div>
      </SettingsCard>

      <div className="flex items-center justify-end gap-3 pt-2">
        {saveState === "saved" ? (
          <div className="mr-auto text-[13px] font-medium text-[#008236]">
            Saved
          </div>
        ) : null}
        <button
          type="button"
          onClick={onCancel}
          disabled={!dirty || saving}
          className="h-10 rounded-lg border border-[#d5d7da] bg-white px-[18px] text-sm font-semibold leading-[21px] text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="h-10 rounded-lg bg-[#48476e] px-5 text-sm font-semibold leading-[21px] text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

