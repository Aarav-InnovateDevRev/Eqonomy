"use client";

import Link from "next/link";
import styles from "./terms.module.scss";

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.back}>
          ← Back to Eqonomy
        </Link>

        <h1 className={styles.title}>Terms & Conditions</h1>
        <p className={styles.updated}>Last updated: September 2026</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. About Eqonomy</h2>
          <p className={styles.sectionText}>
            Eqonomy is an opportunity marketplace created and operated by a Class 9 student 
            as an independent project. It connects people who want to offer small projects, 
            guidance sessions, challenges and similar opportunities with people who want to 
            take them up, primarily in the Delhi-NCR region.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Nature of the Platform</h2>
          <p className={styles.sectionText}>
            Eqonomy is a technology platform only. We do not employ the users, we do not 
            guarantee work, payment, quality of work, or any outcome. All agreements are 
            directly between the Provider (person who posts the opportunity) and the Seeker 
            (person who applies).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Eligibility</h2>
          <p className={styles.sectionText}>
            You must be at least 13 years old to use Eqonomy. If you are under 18, you should 
            use the platform with the knowledge and guidance of a parent or guardian.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Payments & Fees</h2>
          <p className={styles.sectionText}>
            Currently, payments between users are handled directly by the users themselves 
            (UPI / other methods). Eqonomy may show a suggested 10% platform contribution. 
            Eqonomy does not hold user funds in escrow at this stage and is not responsible 
            for non-payment or disputes over money.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. User Conduct</h2>
          <p className={styles.sectionText}>
            You agree not to post illegal, harmful, abusive, or fraudulent content. 
            You are responsible for the accuracy of the information you provide 
            (name, phone, skills, etc.).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Limitation of Liability</h2>
          <p className={styles.sectionText}>
            Eqonomy and its creator are not liable for any loss, damage, dispute, 
            non-payment, injury, or any other issue arising from interactions between users. 
            Use of the platform is at your own risk.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Student Project Disclaimer</h2>
          <p className={styles.sectionText}>
            This platform is built and maintained by a Class 9 student as a learning and 
            entrepreneurial project. It is provided “as is” without warranties of any kind.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Contact & Reporting Problems</h2>
          <p className={styles.sectionText}>
            If you face any problem, please report it on Discord:{" "}
            <strong>hi_swift_96631</strong>
          </p>
          <p className={styles.sectionText}>
            Email: s27505@salwanpublicschool.com
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Changes</h2>
          <p className={styles.sectionText}>
            These terms may be updated from time to time. Continued use of Eqonomy 
            after changes means you accept the updated terms.
          </p>
        </section>

        <p className={styles.footerNote}>
          By using Eqonomy you agree to these Terms & Conditions.
        </p>
      </div>
    </div>
  );
}