// assets/js/schema.js

// 1. Base Organization Data (Metadise Academy)
const baseOrg = {
  "@type": "EducationalOrganization",
  "name": "Metadise Academy",
  "url": "https://metadiseacademy.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "The Podium, Block C-2-7 & C-2-8",
    "addressLocality": "Kuching",
    "addressRegion": "Sarawak",
    "addressCountry": "MY"
  },
  "description": "HRD Corp claimable technology, AI, and cybersecurity courses in Kuching, Sarawak."
};

let schemaData;

// 2. Check current URL path to decide which schema to load
const path = window.location.pathname;

if (path.includes("course") || document.querySelector("h1")) {
  // If viewing a course page, build Course Schema
  const pageTitle = document.querySelector("h1")?.innerText || "Tech & AI Training Course";
  
  schemaData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": pageTitle,
    "description": "HRD Corp claimable training program hosted by Metadise Academy in Kuching, Sarawak.",
    "provider": baseOrg
  };
} else {
  // For index.html, about.html, or contact.html, build Organization Schema
  schemaData = {
    "@context": "https://schema.org",
    ...baseOrg
  };
}

// 3. Inject the JSON-LD <script> into the <head>
const script = document.createElement("script");
script.type = "application/ld+json";
script.text = JSON.stringify(schemaData);
document.head.appendChild(script);