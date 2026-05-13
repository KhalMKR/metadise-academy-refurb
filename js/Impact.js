/* ============================================================
   Impact Section Animation
   For hardcoded Impact.html review cards
   ============================================================ */

function initImpactAnimation() {
  console.log("Initializing Impact animation...");

  const section = document.querySelector(".Impact-section");

  if (!section) {
    console.warn("No .Impact-section found");
    return;
  }

  const animatedItems = section.querySelectorAll(
    ".Impact-header, .Impact-review-summary, .Impact-review-card"
  );

  if (!animatedItems.length) {
    console.warn("No Impact animation items found");
    return;
  }

  animatedItems.forEach((item, index) => {
    item.setAttribute("data-aos", "fade-up");
    item.setAttribute("data-aos-duration", "800");
    item.setAttribute("data-aos-delay", String(index * 100));
  });

  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
}

function lazyLoadImpactAnimation() {
  const section = document.querySelector(".Impact-section");

  if (!section) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initImpactAnimation();
            currentObserver.disconnect();
          }
        });
      },
      {
        rootMargin: "200px"
      }
    );

    observer.observe(section);
  } else {
    initImpactAnimation();
  }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  lazyLoadImpactAnimation();
} else {
  window.addEventListener("DOMContentLoaded", lazyLoadImpactAnimation);
}