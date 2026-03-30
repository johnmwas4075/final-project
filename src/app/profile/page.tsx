"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageBell } from "@/components/message-bell";
import { NotificationBell } from "@/components/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const AUTH_KEY = "authUserId";
const AUTH_NAME_KEY = "authUserFirstName";
const AUTH_EMAIL_KEY = "authUserEmail";
const AUTH_PHONE_KEY = "authUserPhone";
const AUTH_USERNAME_KEY = "authUserUsername";

type Profile = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  username: string | null;
  avatarUrl: string | null;
  email: string;
  phoneNumber: string;
  createdAt: string;
  hasAcceptedTerms: boolean;
  hasAcceptedHostTerms: boolean;
  walletBalance: number;
  defaultMpesaPhone: string;
};

function formatMemberSince(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function initialsFromProfile(profile: Partial<Profile>) {
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) {
    return fullName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  return (profile.username || "U").slice(0, 2).toUpperCase();
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-muted/30 p-4">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="break-words text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [firstName, setFirstName] = useState("there");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingFinancial, setIsSavingFinancial] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    avatarUrl: "",
    email: "",
    phoneNumber: "",
  });
  const [financialForm, setFinancialForm] = useState({
    defaultMpesaPhone: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userId = window.localStorage.getItem(AUTH_KEY);
    const storedName = window.localStorage.getItem(AUTH_NAME_KEY);
    if (!userId) {
      router.replace("/login");
      return;
    }

    if (storedName) setFirstName(storedName);
    setIsReady(true);
  }, [router]);

  useEffect(() => {
    if (!isReady) return;
    const userId = window.localStorage.getItem(AUTH_KEY);
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const response = await fetch(
          `/api/users/profile?userId=${encodeURIComponent(userId)}`,
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data?.error || "Unable to load your profile.");
          return;
        }

        setProfile(data.user);
        setFirstName(data.user.firstName || firstName);
        setPersonalForm({
          firstName: data.user.firstName || "",
          middleName: data.user.middleName || "",
          lastName: data.user.lastName || "",
          username: data.user.username || "",
          avatarUrl: data.user.avatarUrl || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || "",
        });
        setFinancialForm({
          defaultMpesaPhone:
            data.user.defaultMpesaPhone || data.user.phoneNumber || "",
        });

        if (data?.user?.firstName)
          window.localStorage.setItem(
            AUTH_NAME_KEY,
            String(data.user.firstName),
          );
        if (data?.user?.email)
          window.localStorage.setItem(AUTH_EMAIL_KEY, String(data.user.email));
        if (data?.user?.phoneNumber)
          window.localStorage.setItem(
            AUTH_PHONE_KEY,
            String(data.user.phoneNumber),
          );
        if (data?.user?.username)
          window.localStorage.setItem(
            AUTH_USERNAME_KEY,
            String(data.user.username),
          );
      } catch {
        setError("Unable to load your profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [isReady]);

  const fullName = useMemo(() => {
    if (!profile) return "";
    return [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(" ");
  }, [profile]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
      window.localStorage.removeItem(AUTH_NAME_KEY);
    }
    router.push("/login");
  };

  const saveProfile = async (
    payload: {
      firstName: string;
      middleName: string;
      lastName: string;
      avatarUrl: string;
      email: string;
      phoneNumber: string;
      defaultMpesaPhone: string;
    },
    mode: "personal" | "financial",
  ) => {
    if (!profile) return;

    if (mode === "personal") setIsSavingPersonal(true);
    if (mode === "financial") setIsSavingFinancial(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          ...payload,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || "Unable to save your profile.");
        return;
      }

      setProfile(data.user);
      setFirstName(data.user.firstName || "there");
      setPersonalForm({
        firstName: data.user.firstName || "",
        middleName: data.user.middleName || "",
        lastName: data.user.lastName || "",
        username: data.user.username || "",
        avatarUrl: data.user.avatarUrl || "",
        email: data.user.email || "",
        phoneNumber: data.user.phoneNumber || "",
      });
      setFinancialForm({
        defaultMpesaPhone:
          data.user.defaultMpesaPhone || data.user.phoneNumber || "",
      });

      window.localStorage.setItem(
        AUTH_NAME_KEY,
        String(data.user.firstName || ""),
      );
      window.localStorage.setItem(
        AUTH_EMAIL_KEY,
        String(data.user.email || ""),
      );
      window.localStorage.setItem(
        AUTH_PHONE_KEY,
        String(data.user.phoneNumber || ""),
      );
      if (data.user.username)
        window.localStorage.setItem(
          AUTH_USERNAME_KEY,
          String(data.user.username),
        );

      setSuccess(
        mode === "personal"
          ? "Personal details updated."
          : "Financial details updated.",
      );
      if (mode === "personal") setIsPersonalModalOpen(false);
      if (mode === "financial") setIsFinancialModalOpen(false);
    } catch {
      setError("Unable to save your profile.");
    } finally {
      if (mode === "personal") setIsSavingPersonal(false);
      if (mode === "financial") setIsSavingFinancial(false);
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-rose-500 font-brand">Dwellify</span>
          </div>

          <div className="flex items-center gap-3">
            <MessageBell
              role="client"
              className="rounded-full"
              href="/messages"
            />
            <NotificationBell
              role="client"
              className="rounded-full"
              href="/notifications"
            />

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
                <div className="border-b border-border mt-2 mx-4" />
                <nav className="space-y-1 p-4">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm font-medium"
                      onClick={() => router.push("/userpage")}
                    >
                      Dashboard
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/profile")}
                    >
                      Profile settings
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm"
                      onClick={() => router.push("/")}
                    >
                      Main page
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="w-full justify-start rounded-md px-3 py-2 text-sm bg-rose-500 text-white hover:bg-rose-600"
                      onClick={() => router.push("/host/verify")}
                    >
                      Become a Host
                    </Button>
                  </SheetClose>

                  <div className="my-2 border-t border-border" />

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              className="hidden rounded-full text-sm font-medium md:inline-flex"
              onClick={() => router.push("/host/verify")}
            >
              Become a Host
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden rounded-full gap-2 px-3 md:inline-flex"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Hi, {firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/")}>
                  Main page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden lg:flex-row">
          <aside className="hidden h-full w-full flex-shrink-0 border-b border-rose-400/60 bg-rose-500 p-4 text-white lg:block lg:w-[240px] lg:border-b-0 lg:border-r">
            <nav className="space-y-0 text-sm">
              <button
                onClick={() => router.push("/userpage")}
                className="w-full rounded-md px-3 py-2 text-left font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              >
                Dashboard
              </button>
              <div className="my-2 border-b border-white/30" />
              <button
                onClick={() => router.push("/userpage")}
                className="w-full rounded-md px-3 py-2 text-left transition-colors text-white/90 hover:bg-white/15 hover:text-white"
              >
                My bookings
              </button>
              <div className="my-2 border-b border-white/30" />
              <button
                onClick={() => router.push("/userpage")}
                className="w-full rounded-md px-3 py-2 text-left transition-colors text-white/90 hover:bg-white/15 hover:text-white"
              >
                Reviews
              </button>
              <div className="my-2 border-b border-white/30" />
              <button
                onClick={() => router.push("/userpage")}
                className="w-full rounded-md px-3 py-2 text-left transition-colors text-white/90 hover:bg-white/15 hover:text-white"
              >
                Payments and invoices
              </button>
              <div className="my-2 border-b border-white/30" />
              <button
                onClick={() => router.push("/userpage")}
                className="w-full rounded-md px-3 py-2 text-left transition-colors text-white/90 hover:bg-white/15 hover:text-white"
              >
                Help and support
              </button>
              <div className="my-2 border-b border-white/30" />
              
            </nav>
          </aside>

          <section className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold text-foreground">
                  Profile settings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account details and the payout number used by
                  default in wallet actions.
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <Card className="overflow-hidden">
                <CardContent className="grid gap-6 p-6 md:grid-cols-[240px_1fr] md:p-8">
                  <div className="flex flex-col items-start gap-4">
                  <Avatar className="h-20 w-20 border border-border">
                    {profile?.avatarUrl ? (
                      <AvatarImage
                        src={profile.avatarUrl}
                        alt={fullName || "Profile"}
                      />
                    ) : null}
                    <AvatarFallback className="bg-rose-100 text-xl font-semibold text-rose-600">
                      {initialsFromProfile(profile || {})}
                    </AvatarFallback>
                  </Avatar>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold text-foreground">
                        {fullName || profile?.username || "Your profile"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {profile?.username
                          ? `@${profile.username}`
                          : "Username not set"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {profile?.hasAcceptedTerms
                          ? "Terms accepted"
                          : "Terms pending"}
                      </Badge>
                      <Badge
                        variant={
                          profile?.hasAcceptedHostTerms ? "default" : "outline"
                        }
                      >
                        {profile?.hasAcceptedHostTerms
                          ? "Host verified"
                          : "Guest account"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-background p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Personal details
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Name, email, account phone, and your fixed username.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setIsPersonalModalOpen(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <DetailRow
                          label="Full name"
                          value={fullName || "Not available"}
                        />
                        <DetailRow
                          label="Username"
                          value={
                            profile?.username
                              ? `@${profile.username}`
                              : "Not set"
                          }
                        />
                        <DetailRow
                          label="Email"
                          value={profile?.email || "Not available"}
                        />
                        <DetailRow
                          label="Phone number"
                          value={profile?.phoneNumber || "Not available"}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="rounded-2xl border border-border bg-background p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Financial details
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Default M-PESA number used during deposits and
                            withdrawals unless changed for one transaction.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setIsFinancialModalOpen(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <DetailRow
                          label="Default M-PESA number"
                          value={profile?.defaultMpesaPhone || "Not available"}
                        />
                        <DetailRow
                          label="Member since"
                          value={
                            profile?.createdAt
                              ? formatMemberSince(profile.createdAt)
                              : isLoading
                                ? "Loading..."
                                : "Not available"
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailRow
                        label="Wallet balance"
                        value={`KES ${Number(profile?.walletBalance || 0).toLocaleString()}`}
                      />
                      <DetailRow
                        label="Account type"
                        value={
                          profile?.hasAcceptedHostTerms
                            ? "Host and guest"
                            : "Guest"
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      {isPersonalModalOpen && profile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Edit personal details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update your account information.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPersonalModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  First name
                </label>
                <Input
                  value={personalForm.firstName}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Middle name
                </label>
                <Input
                  value={personalForm.middleName}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      middleName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Last name
                </label>
                <Input
                  value={personalForm.lastName}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Username
                </label>
                <Input
                  value={
                    personalForm.username ? `@${personalForm.username}` : ""
                  }
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Profile photo URL
                </label>
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={personalForm.avatarUrl}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      avatarUrl: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  This photo is shared for both host and client views.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={personalForm.email}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone number
                </label>
                <Input
                  type="tel"
                  value={personalForm.phoneNumber}
                  onChange={(e) =>
                    setPersonalForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPersonalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-500 text-white hover:bg-rose-600"
                disabled={isSavingPersonal}
                onClick={() =>
                  saveProfile(
                    {
                      firstName: personalForm.firstName,
                      middleName: personalForm.middleName,
                      lastName: personalForm.lastName,
                      avatarUrl: personalForm.avatarUrl,
                      email: personalForm.email,
                      phoneNumber: personalForm.phoneNumber,
                      defaultMpesaPhone:
                        financialForm.defaultMpesaPhone ||
                        personalForm.phoneNumber,
                    },
                    "personal",
                  )
                }
              >
                {isSavingPersonal ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isFinancialModalOpen && profile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Edit financial details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set the M-PESA number used by default for deposit and
                  withdrawal.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFinancialModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Default M-PESA number
              </label>
              <Input
                type="tel"
                value={financialForm.defaultMpesaPhone}
                onChange={(e) =>
                  setFinancialForm({ defaultMpesaPhone: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Users can still enter another number during a specific
                transaction without changing this saved default.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFinancialModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-rose-500 text-white hover:bg-rose-600"
                disabled={isSavingFinancial}
                onClick={() =>
                  saveProfile(
                    {
                      firstName: personalForm.firstName,
                      middleName: personalForm.middleName,
                      lastName: personalForm.lastName,
                      avatarUrl: personalForm.avatarUrl,
                      email: personalForm.email,
                      phoneNumber: personalForm.phoneNumber,
                      defaultMpesaPhone: financialForm.defaultMpesaPhone,
                    },
                    "financial",
                  )
                }
              >
                {isSavingFinancial ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

