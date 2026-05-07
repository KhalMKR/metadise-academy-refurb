document.addEventListener("DOMContentLoaded", () => {
  const DATA_SOURCE = "data/press-releases.json";

  waitForPressReleaseList(DATA_SOURCE);
  loadPressReleaseDetail(DATA_SOURCE);
});

/* ============================================================
   PRESS RELEASE LIST FOR media.html
   ============================================================ */

function waitForPressReleaseList(DATA_SOURCE) {
  let attempts = 0;
  const maxAttempts = 30;

  const interval = setInterval(() => {
    const pressList = document.getElementById("pressReleaseList");

    if (pressList) {
      clearInterval(interval);
      loadPressReleaseList(DATA_SOURCE, pressList);
      return;
    }

    attempts++;

    if (attempts >= maxAttempts) {
      clearInterval(interval);
      console.warn("pressReleaseList container not found.");
    }
  }, 100);
}

async function loadPressReleaseList(DATA_SOURCE, pressList) {
  try {
    const response = await fetch(DATA_SOURCE);

    if (!response.ok) {
      throw new Error(`Failed to load press releases: ${response.status}`);
    }

    const payload = await response.json();

    const pressReleases = Array.isArray(payload.pressReleases)
      ? payload.pressReleases
      : [];

    if (!pressReleases.length) {
      pressList.innerHTML = `
        <p class="media-empty">No press releases available yet.</p>
      `;
      return;
    }

    pressList.innerHTML = pressReleases
      .map((item) => createPressReleaseCard(item))
      .join("");
  } catch (error) {
    console.error("Press release list error:", error);

    pressList.innerHTML = `
      <p class="media-error">
        Failed to load press releases. Please check data/press-releases.json.
      </p>
    `;
  }
}

function createPressReleaseCard(item) {
  const title = escapeHTML(item.title || "Untitled Press Release");
  const excerpt = escapeHTML(item.excerpt || "");
  const category = escapeHTML(item.category || "Update");
  const source = escapeHTML(item.source || "Metadise Academy");
  const date = formatPublishedDate(item.publishedDate);

  const meta = date ? `${source} · ${date}` : source;

  let href = "#";
  let target = "";
  let rel = "";

  if (item.type === "external" && item.url) {
    href = item.url;
    target = `target="_blank"`;
    rel = `rel="noreferrer"`;
  }

  if (item.type === "internal") {
    href = `press-release.html?id=${encodeURIComponent(item.id)}`;
  }

  return `
    <a
      href="${href}"
      class="media-news-card press-card"
      ${target}
      ${rel}
    >
      <span class="media-news-card__badge">${category}</span>

      <h4 class="media-news-card__title">${title}</h4>

      <p class="media-news-card__excerpt">${excerpt}</p>

      <p class="media-news-card__meta">${meta}</p>
    </a>
  `;
}

/* ============================================================
   PRESS RELEASE DETAIL PAGE
   Only runs if the detail page elements exist
   ============================================================ */

async function loadPressReleaseDetail(DATA_SOURCE) {
  const titleEl = document.getElementById("pressReleaseTitle");
  const excerptEl = document.getElementById("pressReleaseExcerpt");
  const metaEl = document.getElementById("pressReleaseMeta");
  const contentEl = document.getElementById("pressReleaseContent");
  const imageWrapEl = document.getElementById("pressReleaseImageWrap");
  const imageEl = document.getElementById("pressReleaseImage");

  const isDetailPage =
    titleEl || excerptEl || metaEl || contentEl || imageWrapEl || imageEl;

  if (!isDetailPage) return;

  const params = new URLSearchParams(window.location.search);
  const pressId = params.get("id");

  const setNotFound = (message) => {
    if (titleEl) titleEl.textContent = "Press release not found";
    if (excerptEl) excerptEl.textContent = message;
    if (metaEl) metaEl.textContent = "";
    if (contentEl) contentEl.innerHTML = "";
    if (imageWrapEl) imageWrapEl.hidden = true;
  };

  if (!pressId) {
    setNotFound("No press release id provided.");
    return;
  }

  try {
    const response = await fetch(DATA_SOURCE);

    if (!response.ok) {
      throw new Error("Failed to load press release data");
    }

    const payload = await response.json();

    const items = Array.isArray(payload.pressReleases)
      ? payload.pressReleases
      : [];

    const pressItem = items.find(
      (item) => item.id === pressId && item.type === "internal"
    );

    if (!pressItem) {
      setNotFound("The requested press release is unavailable or external only.");
      return;
    }

    const title = pressItem.title || "Untitled Press Release";
    const excerpt = pressItem.excerpt || "";

    const meta = [
      pressItem.source || "Metadise Academy",
      formatPublishedDate(pressItem.publishedDate)
    ]
      .filter(Boolean)
      .join(" · ");

    const paragraphs = Array.isArray(pressItem.content)
      ? pressItem.content
      : [];

    document.title = `${title} - Metadise Academy`;

    if (titleEl) titleEl.textContent = title;
    if (excerptEl) excerptEl.textContent = excerpt;
    if (metaEl) metaEl.textContent = meta;

    if (contentEl) {
      contentEl.innerHTML = paragraphs.length
        ? paragraphs
            .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
            .join("")
        : "<p>Full release text will be published soon.</p>";
    }

    if (imageWrapEl && imageEl && pressItem.thumbnail) {
      imageEl.src = pressItem.thumbnail;
      imageEl.alt = `${title} image`;
      imageWrapEl.hidden = false;
    } else if (imageWrapEl) {
      imageWrapEl.hidden = true;
    }
  } catch (error) {
    console.error(error);
    setNotFound("Unable to load this press release right now.");
  }
}

/* ============================================================
   HELPERS
   ============================================================ */

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