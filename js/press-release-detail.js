document.addEventListener('DOMContentLoaded', async () => {
  const DATA_SOURCE = 'data/press-releases.json';

  const titleEl = document.getElementById('pressReleaseTitle');
  const excerptEl = document.getElementById('pressReleaseExcerpt');
  const metaEl = document.getElementById('pressReleaseMeta');
  const contentEl = document.getElementById('pressReleaseContent');
  const imageWrapEl = document.getElementById('pressReleaseImageWrap');
  const imageEl = document.getElementById('pressReleaseImage');

  const params = new URLSearchParams(window.location.search);
  const pressId = params.get('id');

  const setNotFound = (message) => {
    if (titleEl) titleEl.textContent = 'Press release not found';
    if (excerptEl) excerptEl.textContent = message;
    if (metaEl) metaEl.textContent = '';
    if (contentEl) contentEl.innerHTML = '';
    if (imageWrapEl) imageWrapEl.hidden = true;
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

  if (!pressId) {
    setNotFound('No press release id provided.');
    return;
  }

  try {
    const response = await fetch(DATA_SOURCE);
    if (!response.ok) {
      throw new Error('Failed to load press release data');
    }

    const payload = await response.json();
    const items = Array.isArray(payload.pressReleases) ? payload.pressReleases : [];
    const pressItem = items.find((item) => item.id === pressId && item.type === 'internal');

    if (!pressItem) {
      setNotFound('The requested press release is unavailable or external only.');
      return;
    }

    const title = pressItem.title || 'Untitled Press Release';
    const excerpt = pressItem.excerpt || '';
    const meta = [pressItem.source || 'Metadise Academy', formatPublishedDate(pressItem.publishedDate)]
      .filter(Boolean)
      .join(' · ');
    const paragraphs = Array.isArray(pressItem.content) ? pressItem.content : [];

    document.title = `${title} - Metadise Academy`;
    if (titleEl) titleEl.textContent = title;
    if (excerptEl) excerptEl.textContent = excerpt;
    if (metaEl) metaEl.textContent = meta;
    if (contentEl) {
      contentEl.innerHTML = paragraphs.length
        ? paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')
        : '<p>Full release text will be published soon.</p>';
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
    setNotFound('Unable to load this press release right now.');
  }
});
