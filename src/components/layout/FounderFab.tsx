"use client";

import { useState } from "react";
import styles from "./FounderFab.module.scss";

export default function FounderFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Founder Info"
      >
        A
      </button>

      {/* Overlay + Card */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div className={styles.photoWrap}>
              <img
                src="/founder.jpg"
                alt="Aarav Singh"
                className={styles.photo}
              />
            </div>

            <h2 className={styles.name}>Aarav Singh</h2>
            <p className={styles.classInfo}>Class 9 · 2026-27</p>

            <div className={styles.details}>
              <div className={styles.row}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>8285757406</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Email</span>
                <a
                  href="mailto:s27505@salwanpublicschool.com"
                  className={styles.value}
                >
                  s27505@salwanpublicschool.com
                </a>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Discord</span>
                <span className={styles.value}>hi_swift_96631</span>
              </div>
            </div>

            <p className={styles.note}>
              Founder of Eqonomy · Please don’t call unnecessarily
            </p>
          </div>
        </div>
      )}
    </>
  );
}