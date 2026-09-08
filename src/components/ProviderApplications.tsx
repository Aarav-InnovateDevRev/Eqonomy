"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@/app/dashboard/opportunity/[id]/opportunity.module.scss";

interface Application {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerPhone?: string;
  coverMessage?: string;
  status: string;
  liked?: boolean;
}

interface Props {
  opportunityId: string;
  opportunityTitle: string;
}

export default function ProviderApplications({
  opportunityId,
  opportunityTitle,
}: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "applications"),
          where("opportunityId", "==", opportunityId)
        );
        const snap = await getDocs(q);
        const list: Application[] = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            seekerId: data.seekerId,
            seekerName: data.seekerName || "Anonymous",
            seekerPhone: data.seekerPhone || "Not provided",
            coverMessage: data.coverMessage || "",
            status: data.status || "pending",
            liked: data.liked || false,
          });
        });
        setApplications(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [opportunityId]);

  const handleLike = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, "applications", app.id), {
        liked: true,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: app.seekerId,
        title: "Your application was liked!",
        body: `The provider liked your application for "${opportunityTitle}".`,
        type: "like",
        read: false,
        link: `/dashboard/opportunity/${opportunityId}`,
        createdAt: serverTimestamp(),
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, liked: true } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const router = useRouter();

  const handleSelect = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, "applications", app.id), {
        status: "selected",
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: app.seekerId,
        title: "You have been selected!",
        body: `Great news! You have been selected for "${opportunityTitle}". The provider will contact you soon.`,
        type: "selected",
        read: false,
        link: `/dashboard/opportunity/${opportunityId}`,
        createdAt: serverTimestamp(),
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "selected" } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (app: Application) => {
    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, "applications", app.id), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: app.seekerId,
        title: "Work marked as completed",
        body: `The provider marked the work for "${opportunityTitle}" as completed. Payment will be processed next.`,
        type: "completed",
        read: false,
        link: `/dashboard/opportunity/${opportunityId}`,
        createdAt: serverTimestamp(),
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "completed" } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

 const handlePayment = (app: Application) => {
  router.push(`/dashboard/payment/${app.id}`);
};

  if (loading) return <p>Loading applications…</p>;

  return (
    <div>
      <h3 className={styles.sectionTitle}>
        Applications ({applications.length})
      </h3>

      {applications.length === 0 ? (
        <p style={{ color: "#64748b" }}>No applications yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1rem",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>{app.seekerName}</strong>
                <span
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "20px",
                    background:
                      app.status === "completed"
                        ? "#d1fae5"
                        : app.status === "selected"
                        ? "#dbeafe"
                        : "#e0e7ff",
                    color:
                      app.status === "completed"
                        ? "#065f46"
                        : app.status === "selected"
                        ? "#1e40af"
                        : "#3730a3",
                    textTransform: "capitalize",
                  }}
                >
                  {app.status}
                </span>
              </div>

              <p style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                📞 {app.seekerPhone}
              </p>

              {app.coverMessage && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    marginBottom: "0.8rem",
                  }}
                >
                  “{app.coverMessage}”
                </p>
              )}

              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {/* Like */}
                <button
                  onClick={() => handleLike(app)}
                  disabled={app.liked || actionLoading === app.id}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    background: app.liked ? "#fef3c7" : "white",
                    cursor: app.liked ? "default" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  {app.liked ? "♥ Liked" : "♡ Like"}
                </button>

                {/* Select */}
                {app.status === "pending" && (
                  <button
                    onClick={() => handleSelect(app)}
                    disabled={actionLoading === app.id}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Select & Reply
                  </button>
                )}

                {/* Mark as Completed */}
                {app.status === "selected" && (
                  <button
                    onClick={() => handleMarkCompleted(app)}
                    disabled={actionLoading === app.id}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#059669",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Mark as Completed
                  </button>
                )}

                {/* Payment (placeholder) */}
                {app.status === "completed" && (
                  <button
                    onClick={() => handlePayment(app)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "#7c3aed",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}