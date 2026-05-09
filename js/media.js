/* ============================================================
   Media Page JavaScript
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const NEWS_SOURCE = "data/media-news.json";
  const PRESS_SOURCE = "data/press-releases.json";

  let galleryLightbox;

  initMediaTabs();
  initAOS();
  initLightbox();

  waitForElement("#mediaPressList", () => {
    renderPressReleases(PRESS_SOURCE);
  });

  waitForElement("#mediaNewsList", () => {
    renderNews(NEWS_SOURCE);
  });

  /* ===================== RESIZE HANDLER ===================== */
  window.addEventListener('resize', () => {
  if (galleryLightbox && galleryLightbox.activeSlide) {
    // A small delay allows the browser to finish its zoom calculation
    setTimeout(() => {
      galleryLightbox.reload(); 
    }, 100);
  }
});

  /* ===================== TABS ===================== */

  function initMediaTabs() {
    const tabButtons = Array.from(document.querySelectorAll("[data-media-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-media-panel]"));

    if (!tabButtons.length || !panels.length) return;

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.mediaTab;

        tabButtons.forEach((btn) => {
          const isActive = btn.dataset.mediaTab === target;

          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-selected", String(isActive));
        });

        panels.forEach((panel) => {
          const isActive = panel.dataset.mediaPanel === target;

          panel.classList.toggle("is-active", isActive);
          panel.hidden = !isActive;
        });

        // Inside initMediaTabs() in media.js
if (target === "gallery") {
    setTimeout(() => {
        initLightbox();
        // Force a recalculation of the viewport to ensure the lightbox sizes correctly after tab switch
        window.dispatchEvent(new Event('resize'));
    }, 50); 
}
      });
    });
  }

  /* ===================== LIBRARIES ===================== */

  function initAOS() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 700,
        once: true
      });
    }
  }

  function initLightbox() {
    if (typeof GLightbox !== "function") return;

    if (galleryLightbox) {
      galleryLightbox.destroy();
    }

    galleryLightbox = GLightbox({
      selector: ".glightbox",
    touchNavigation: true,
    loop: true,
    zoomable: true,
    draggable: true, // Allows moving the image if it's larger than the screen
    width: 'auto',
    height: 'auto',
    autosize: true
    });
  }

  /* ===================== WAIT FOR COMPONENTS ===================== */

  function waitForElement(selector, callback) {
    let attempts = 0;
    const maxAttempts = 80;

    const interval = setInterval(() => {
      const element = document.querySelector(selector);

      if (element) {
        clearInterval(interval);
        callback(element);
        return;
      }

      attempts++;

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn(`Element not found: ${selector}`);
      }
    }, 100);
  }

  /* ===================== PRESS RELEASES ===================== */

  async function renderPressReleases(source) {
    const pressList = document.getElementById("mediaPressList");

    if (!pressList) return;

    try {
      const response = await fetch(source, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Failed to load press releases: ${response.status}`);
      }

      const payload = await response.json();

      const items = Array.isArray(payload.pressReleases)
        ? payload.pressReleases
        : [];

      if (!items.length) {
        pressList.innerHTML = `
          <div class="media-list__item media-placeholder">
            No press releases available yet.
          </div>
        `;
        return;
      }

      pressList.innerHTML = items
        .map((item) =>
          buildMediaCard(item, {
            defaultSource: "Metadise Academy",
            defaultTypeLabel: "Press Release"
          })
        )
        .join("");
    } catch (error) {
      console.error("Press release loading error:", error);

      pressList.innerHTML = `
        <div class="media-list__item media-placeholder media-error">
          Unable to load press releases right now. Please check data/press-releases.json.
        </div>
      `;
    }
  }

  /* ===================== NEWS ===================== */

  async function renderNews(source) {
    const newsList = document.getElementById("mediaNewsList");

    if (!newsList) return;

    try {
      const response = await fetch(source, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Failed to load media news: ${response.status}`);
      }

      const payload = await response.json();

      const newsItems = Array.isArray(payload.news)
        ? payload.news
        : [];

      if (!newsItems.length) {
        newsList.innerHTML = `
          <div class="media-list__item media-placeholder">
            No news updates available yet.
          </div>
        `;
        return;
      }

      newsList.innerHTML = newsItems
        .map((item) =>
          buildMediaCard(
            {
              ...item,
              type: "external"
            },
            {
              defaultSource: "Metadise Academy",
              defaultTypeLabel: "News"
            }
          )
        )
        .join("");
    } catch (error) {
      console.error("News loading error:", error);

      newsList.innerHTML = `
        <div class="media-list__item media-placeholder media-error">
          Unable to load news right now.
        </div>
      `;
    }
  }

  /* ===================== CARD BUILDER ===================== */

  function buildMediaCard(item, options = {}) {
    const {
      defaultSource = "",
      defaultTypeLabel = ""
    } = options;

    const title = escapeHTML(item.title || "Untitled");
    const excerpt = escapeHTML(item.excerpt || "");
    const source = escapeHTML(item.source || defaultSource);
    const category = escapeHTML(item.category || defaultTypeLabel);
    const thumbnail = item.thumbnail || "";
    const publishedDate = formatPublishedDate(item.publishedDate);
    const meta = [source, publishedDate].filter(Boolean).join(" · ");

    const href =
      item.type === "internal"
        ? `press-release-detail.html?id=${encodeURIComponent(item.id || "")}`
        : item.url || "#";

    const externalAttrs =
      item.type === "internal"
        ? ""
        : ' target="_blank" rel="noopener noreferrer"';

    return `
      <a class="media-list__item media-news-card" href="${href}"${externalAttrs}>
        ${
          thumbnail
            ? `<img class="media-news-card__image" src="${escapeHTML(thumbnail)}" alt="${title}" loading="lazy">`
            : ""
        }

        ${
          category
            ? `<span class="media-news-card__badge">${category}</span>`
            : ""
        }

        <h4 class="media-news-card__title">${title}</h4>

        ${
          excerpt
            ? `<p class="media-news-card__excerpt">${excerpt}</p>`
            : ""
        }

        ${
          meta
            ? `<p class="media-news-card__meta">${meta}</p>`
            : ""
        }
      </a>
    `;
  }

  /* ===================== HELPERS ===================== */

  function formatPublishedDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});