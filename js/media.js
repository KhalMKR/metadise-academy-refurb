/* ============================================================
   Media Page JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('[data-media-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-media-panel]'));
  let galleryLightbox;
  const NEWS_SOURCE = 'data/media-news.json';
  const PRESS_SOURCE = 'data/press-releases.json';

  const initLightbox = () => {
    if (typeof GLightbox !== 'function') return;

    if (galleryLightbox) {
      galleryLightbox.destroy();
    }

    galleryLightbox = GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      zoomable: true
    });
  };

  const formatPublishedDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const buildMediaCard = (item, options = {}) => {
    const {
      defaultSource = '',
      defaultTypeLabel = '',
    } = options;

    const title = item.title || 'Untitled';
    const excerpt = item.excerpt || '';
    const source = item.source || defaultSource;
    const thumbnail = item.thumbnail || '';
    const publishedDate = formatPublishedDate(item.publishedDate);
    const meta = [source, publishedDate].filter(Boolean).join(' · ');
    const typeLabel = item.type === 'internal' ? defaultTypeLabel : '';
    const href = item.type === 'internal'
      ? `press-release-detail.html?id=${encodeURIComponent(item.id || '')}`
      : (item.url || '#');
    const externalAttrs = item.type === 'internal'
      ? ''
      : ' target="_blank" rel="noopener noreferrer"';

    return `
      <a class="media-list__item media-news-card" href="${href}"${externalAttrs}>
        ${thumbnail ? `<img class="media-news-card__image" src="${thumbnail}" alt="${title}" loading="lazy">` : ''}
        ${typeLabel ? `<span class="media-news-card__badge">${typeLabel}</span>` : ''}
        <h4 class="media-news-card__title">${title}</h4>
        <p class="media-news-card__excerpt">${excerpt}</p>
        ${meta ? `<p class="media-news-card__meta">${meta}</p>` : ''}
      </a>
    `;
  };

  const renderPressReleases = async () => {
    const pressList = document.getElementById('mediaPressList');
    if (!pressList) return;

    try {
      const response = await fetch(PRESS_SOURCE);
      if (!response.ok) {
        throw new Error('Failed to load press releases.');
      }

      const payload = await response.json();
      const items = Array.isArray(payload.pressReleases) ? payload.pressReleases : [];

      if (!items.length) {
        pressList.innerHTML = '<div class="media-list__item media-placeholder">No press releases available yet.</div>';
        return;
      }

      pressList.innerHTML = items.map((item) => buildMediaCard(item, {
        defaultSource: 'Metadise Academy',
        defaultTypeLabel: 'Press Release',
      })).join('');
    } catch (error) {
      console.error(error);
      pressList.innerHTML = '<div class="media-list__item media-placeholder">Unable to load press releases right now.</div>';
    }
  };

  const renderNews = async () => {
    const newsList = document.getElementById('mediaNewsList');
    if (!newsList) return;

    try {
      const response = await fetch(NEWS_SOURCE);
      if (!response.ok) {
        throw new Error('Failed to load media news.');
      }

      const payload = await response.json();
      const newsItems = Array.isArray(payload.news) ? payload.news : [];

      if (!newsItems.length) {
        newsList.innerHTML = '<div class="media-list__item media-placeholder">No news updates available yet.</div>';
        return;
      }

      newsList.innerHTML = newsItems.map((item) => buildMediaCard({
        ...item,
        type: 'external',
      })).join('');
    } catch (error) {
      console.error(error);
      newsList.innerHTML = '<div class="media-list__item media-placeholder">Unable to load news right now.</div>';
    }
  };

  if (!tabButtons.length || !panels.length) return;

  const showPanel = (tabKey) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.mediaTab === tabKey;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.mediaPanel === tabKey;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showPanel(button.dataset.mediaTab);
    });
  });

  window.addEventListener('metadise:components-loaded', () => {
    initLightbox();
    renderPressReleases();
    renderNews();
  }, { once: true });
  initLightbox();
});
