"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Zyra</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-slate-700 dark:text-slate-200 hover:text-primary transition-colors px-2 py-1 rounded-md",
                pathname === link.href && "bg-primary/10 text-primary font-semibold"
              )}
            >
              {link.name}
            </Link>
          ))}
          {status === "loading" ? (
            <Button variant="ghost" disabled>
              Loading...
            </Button>
          ) : session ? (
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="ml-2"
            >
              Login
            </Button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block text-slate-700 dark:text-slate-200 hover:text-primary transition-colors px-2 py-2 rounded-md",
                  pathname === link.href && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {status === "loading" ? (
              <Button variant="ghost" disabled className="w-full mt-2">
                Loading...
              </Button>
            ) : session ? (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                className="w-full mt-2"
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/login");
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
