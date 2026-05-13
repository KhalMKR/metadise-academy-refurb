/* ============================================================
   Media Page JavaScript
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const NEWS_SOURCE = "data/media-news.json";
  const GALLERY_SOURCE = "data/media-gallery.json";

  let galleryLightbox = null;
  let galleryCache = null;
  let galleryRenderToken = 0;

  initMediaTabs();
  initAOS();

  waitForElement("#mediaNewsList", () => {
    renderNews(NEWS_SOURCE);
  });

  waitForElement("[data-open-gallery-category]", () => {
    initGalleryCategoryView(GALLERY_SOURCE);
  });

  /* ===================== RESIZE HANDLER ===================== */

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      if (galleryLightbox && galleryLightbox.activeSlide) {
        galleryLightbox.reload();
      }
    }, 150);
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

        if (target === "gallery") {
          setTimeout(() => {
            initGalleryCategoryView(GALLERY_SOURCE);
          }, 100);
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

    destroyLightbox();

    galleryLightbox = GLightbox({
      selector: ".glightbox",
      touchNavigation: true,
      loop: true,
      zoomable: true,
      draggable: true,
      width: "auto",
      height: "auto",
      autosize: true
    });
  }

  function destroyLightbox() {
    if (galleryLightbox) {
      galleryLightbox.destroy();
      galleryLightbox = null;
    }
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


  /* ===================== GALLERY CATEGORY VIEW ===================== */

  function initGalleryCategoryView(source) {
    const categoryButtons = document.querySelectorAll("[data-open-gallery-category]");
    const categoryContainer = document.getElementById("galleryCategories");
    const selectedSection = document.getElementById("gallerySelectedSection");
    const selectedTitle = document.getElementById("gallerySelectedTitle");
    const imageGrid = document.getElementById("galleryImageGrid");
    const backButton = document.getElementById("galleryBackButton");

    if (
      !categoryButtons.length ||
      !categoryContainer ||
      !selectedSection ||
      !selectedTitle ||
      !imageGrid ||
      !backButton
    ) {
      return;
    }

    categoryButtons.forEach((button) => {
      if (button.dataset.galleryListenerAttached === "true") return;

      button.dataset.galleryListenerAttached = "true";

      button.addEventListener("click", () => {
        const category = button.dataset.openGalleryCategory;
        loadGalleryImages(source, category);
      });
    });

    if (backButton.dataset.galleryListenerAttached !== "true") {
      backButton.dataset.galleryListenerAttached = "true";

      backButton.addEventListener("click", () => {
        galleryRenderToken++;

        selectedSection.classList.add("is-hidden");
        categoryContainer.classList.remove("is-hidden");
        imageGrid.innerHTML = "";

        destroyLightbox();
      });
    }
  }

  async function getGalleryData(source) {
    if (galleryCache) {
      return galleryCache;
    }

    const response = await fetch(source, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to load gallery: ${response.status}`);
    }

    const payload = await response.json();

    galleryCache = Array.isArray(payload.gallery)
      ? payload.gallery
      : [];

    return galleryCache;
  }

  async function loadGalleryImages(source, category) {
    const categoryContainer = document.getElementById("galleryCategories");
    const selectedSection = document.getElementById("gallerySelectedSection");
    const selectedTitle = document.getElementById("gallerySelectedTitle");
    const imageGrid = document.getElementById("galleryImageGrid");

    if (!categoryContainer || !selectedSection || !selectedTitle || !imageGrid) {
      return;
    }

    const currentToken = ++galleryRenderToken;

    try {
      selectedTitle.textContent = category;
      categoryContainer.classList.add("is-hidden");
      selectedSection.classList.remove("is-hidden");

      imageGrid.innerHTML = `
        <p class="media-loading">
          Loading ${escapeHTML(category)} gallery...
        </p>
      `;

      destroyLightbox();

      const galleryItems = await getGalleryData(source);

      if (currentToken !== galleryRenderToken) return;

      const filteredImages = galleryItems.filter((item) => {
        return normalizeText(item.category) === normalizeText(category);
      });

      if (!filteredImages.length) {
        imageGrid.innerHTML = `
          <p class="media-empty">
            No images available for ${escapeHTML(category)} yet.
          </p>
        `;
        return;
      }

      imageGrid.innerHTML = "";

      await renderGalleryInBatches({
        container: imageGrid,
        items: filteredImages,
        category,
        batchSize: 4,
        token: currentToken
      });

      if (currentToken !== galleryRenderToken) return;

      requestAnimationFrame(() => {
        initLightbox();
      });
    } catch (error) {
      console.error("Gallery loading error:", error);

      selectedTitle.textContent = category;
      categoryContainer.classList.add("is-hidden");
      selectedSection.classList.remove("is-hidden");

      imageGrid.innerHTML = `
        <p class="media-error">
          Unable to load gallery images right now.
        </p>
      `;
    }
  }

  async function renderGalleryInBatches({ container, items, category, batchSize, token }) {
    container.innerHTML = "";

    for (let i = 0; i < items.length; i += batchSize) {
      if (token !== galleryRenderToken) return;

      const batch = items.slice(i, i + batchSize);
      const fragment = document.createDocumentFragment();

      batch.forEach((item, batchIndex) => {
        const index = i + batchIndex;

        const fullImage = item.image || "";
        const thumbnail = item.thumbnail || item.image || "";

        if (!fullImage || !thumbnail) return;

        const title = item.title || `${category} Gallery Image ${index + 1}`;

        const link = document.createElement("a");
        link.className = "media-gallery__link glightbox";
        link.href = fullImage;
        link.dataset.gallery = `media-gallery-${normalizeText(category)}`;
        link.dataset.title = title;

        const img = document.createElement("img");
        img.className = "media-gallery__item";
        img.src = thumbnail;
        img.alt = title;
        img.loading = "lazy";
        img.decoding = "async";
        img.fetchPriority = index < 4 ? "high" : "low";

        link.appendChild(img);
        fragment.appendChild(link);
      });

      container.appendChild(fragment);

      await waitForNextFrame();
    }
  }

  function waitForNextFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
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

    const href = item.type === "internal" ? "#" : item.url || "#";

    const externalAttrs =
      item.type === "internal"
        ? ""
        : ' target="_blank" rel="noopener noreferrer"';

    return `
      <a class="media-list__item media-news-card" href="${href}"${externalAttrs}>
        ${
          thumbnail
            ? `<img class="media-news-card__image" src="${escapeHTML(thumbnail)}" alt="${title}" loading="lazy" decoding="async">`
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

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});