"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./BottomNav.module.scss";

const AURA_TRACK_URL = "https://ur-aura-track.vercel.app";

const navItems = [
  { href: "/dashboard", label: "Feed", icon: "feed" },
  { href: AURA_TRACK_URL, label: "Aura", icon: "aura", external: true },
  { href: "/dashboard/create", label: "Add", icon: "add", isCenter: true },
  { href: "/dashboard/clients", label: "Clients", icon: "clients" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/dashboard/notifications", label: "Alerts", icon: "bell" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUnread(0);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        where("read", "==", false)
      );

      const unsubNotif = onSnapshot(
        q,
        (snap) => setUnread(snap.size),
        () => setUnread(0)
      );

      return () => unsubNotif();
    });

    return () => unsubAuth();
  }, []);

  return (
    <nav className={styles.bottomNav} aria-label="Mobile primary navigation">
      {navItems.map((item) => {
        const isActive =
          !item.external &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));

        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navItem}
            >
              <span className={styles.icon} data-icon={item.icon} />
              <span className={styles.label}>{item.label}</span>
            </a>
          );
        }

        const isAlerts = item.href === "/dashboard/notifications";

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""} ${
              item.isCenter ? styles.center : ""
            }`}
          >
            <span className={styles.icon} data-icon={item.icon} />
            <span className={styles.label}>
              {item.label}
              {isAlerts && unread > 0 && (
                <span className={styles.badge}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}