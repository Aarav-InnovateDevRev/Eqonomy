"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.scss";

const AURA_TRACK_URL = "https://ur-aura-track.vercel.app";

const navItems = [
  { href: "/dashboard", label: "Feed", icon: "feed" },
  { href: AURA_TRACK_URL, label: "Aura Track", icon: "aura", external: true },
  { href: "/dashboard/create", label: "Add", icon: "add", isCenter: true },
  { href: "/dashboard/notifications", label: "Alerts", icon: "bell" },
  { href: "/dashboard/profile", label: "Profile", icon: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

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

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ""} ${
              item.isCenter ? styles.center : ""
            }`}
          >
            <span className={styles.icon} data-icon={item.icon} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}