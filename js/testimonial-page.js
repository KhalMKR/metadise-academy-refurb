document.addEventListener("DOMContentLoaded", () => {
  if (typeof GLightbox !== "function") return;

  const lightboxLinks = document.querySelectorAll(".testimonial__lightbox.glightbox");

  if (!lightboxLinks.length) return;

  GLightbox({
    selector: ".testimonial__lightbox.glightbox",
    touchNavigation: true,
    loop: true,
    zoomable: true,
    draggable: true,
    width: "auto",
    height: "auto",
    autosize: true
  });
});