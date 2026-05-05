/* ============================================================
   Media Page JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = Array.from(document.querySelectorAll('[data-media-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-media-panel]'));
  let galleryLightbox;

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

  window.addEventListener('metadise:components-loaded', initLightbox, { once: true });
  initLightbox();
});
