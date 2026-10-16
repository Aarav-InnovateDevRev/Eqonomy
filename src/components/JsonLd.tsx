export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://eqonomy.vercel.app/#organization",
        name: "Eqonomy",
        alternateName: "Eqonomy Delhi-NCR",
        url: "https://eqonomy.vercel.app",
        logo: "https://eqonomy.vercel.app/logo.png",
        description:
          "A hyper-local proof-of-work and micro-project marketplace connecting students and freelancers with verified startup tasks in Delhi-NCR.",
        areaServed: {
          "@type": "Place",
          name: "Delhi-NCR, India",
        },
        founder: {
          "@type": "Person",
          name: "Aarav Singh",
          jobTitle: "Founder",
          url: "https://www.youtube.com/@Aarav-InnovateDevRev",
        },
        sameAs: [
          "https://www.youtube.com/@Aarav-InnovateDevRev",
          "https://eqonomy.vercel.app",
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://eqonomy.vercel.app/#app",
        name: "Eqonomy",
        alternateName: "Eqonomy Delhi-NCR",
        url: "https://eqonomy.vercel.app",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "A hyper-local proof-of-work and micro-project marketplace connecting students and freelancers with verified startup tasks in Delhi-NCR.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        areaServed: {
          "@type": "Place",
          name: "Delhi-NCR, India",
        },
        creator: {
          "@type": "Person",
          name: "Aarav Singh",
        },
        publisher: {
          "@id": "https://eqonomy.vercel.app/#organization",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://eqonomy.vercel.app/#website",
        url: "https://eqonomy.vercel.app",
        name: "Eqonomy",
        description:
          "Find paid projects, internships, challenges and guidance sessions in Delhi-NCR.",
        publisher: {
          "@id": "https://eqonomy.vercel.app/#organization",
        },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}