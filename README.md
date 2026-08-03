# metadise-academy-refurb

Frontend for Metadise Academy.

## Project Overview

This project is a static, multi-page website built with vanilla HTML, CSS, and JavaScript. There is no frontend framework, build step, or bundler. Each page is a normal HTML file, shared UI blocks are fetched from the `components/` folder, and page content is filled from JSON files in `data/`.

The site is designed to be served over HTTP(S) from a local server or deployment platform such as Vercel. Opening pages directly with `file://` can break `fetch()` requests for components and data.

## Stack

The main stack is:

- HTML for page structure and content.
- CSS for all styling and responsive layout.
- Vanilla JavaScript for component loading, page behavior, filtering, animations, and data rendering.
- JSON files for course, event, media, and testimonial content.
- Third-party browser libraries loaded from CDN, mainly AOS for scroll animations, GLightbox for gallery viewing, Font Awesome for icons, and EmailJS on the contact page.

## How Pages Are Loaded

Every page is its own HTML entry point, for example `index.html`, `courses.html`, `coursedetail.html`, `calendar.html`, `media.html`, `contact.html`, and `testimonial-page.html`.

Most pages include placeholder elements like `<div data-component data-src="components/header.html"></div>`. The shared loader in `js/main.js` finds these placeholders after `DOMContentLoaded`, fetches the referenced HTML, and injects it into the page.

The hero component is handled slightly differently. `js/main.js` keeps the hero placeholder visible while the hero HTML and its images load, then reveals the carousel after the images are ready so the page does not flash or jump.

After all components finish loading, `js/main.js` dispatches a custom `metadise:components-loaded` event. Page scripts that depend on injected components, such as the featured-courses loader, listen for that event before rendering.

## Shared Component System

The reusable page sections live in `components/`:

- `header.html` and `footer.html` are shared across the site.
- `hero.html` provides the homepage carousel.
- `featured-courses.html`, `why-section.html`, `event-highlight.html`, `media-news.html`, `media-gallery.html`, `Impact.html`, `portfolios.html`, and `testimony.html` are inserted where needed.
- `whatsapp.html` is loaded globally by `js/main.js` and inserted directly into the `<body>` so the floating button stays outside the normal page flow.

If a component includes an inline `<script>`, `js/main.js` extracts it and re-attaches it to the document so the script still runs after injection.

## JavaScript Architecture

`js/main.js` is the shared runtime for site-wide behavior. It handles:

- Component fetching and injection.
- Hero slideshow behavior, including autoplay, arrow controls, hover pause, and bfcache-safe restart handling.
- Mobile navigation toggles and desktop dropdown behavior.
- Active-section highlighting for anchor links.
- AOS initialization.
- Scroll-reveal animations for cards and feature blocks.
- Global WhatsApp button injection.

The page-specific scripts then handle their own feature sets:

- `js/course-cards.js` fetches `data/courses.json`, caches it, filters it, and renders course cards. It also exposes `window.MetadiseCourseCards` so other pages can reuse the card renderer.
- `js/index-courses.js` waits for the shared components to load, then renders the featured courses grid on the homepage.
- `js/course-detail.js` reads `?id=<course id>` from the URL, fetches `data/courses.json`, finds the matching course, and renders the full detail view plus related course cards.
- `js/calendar.js` builds the calendar agenda from course session dates in `data/courses.json` and renders month navigation for the calendar page.
- `js/media.js` powers the media page tabs, fetches `data/media-news.json` for the news section, and fetches `data/media-gallery.json` for the gallery. It uses GLightbox for full-size image viewing.
- `js/testimony.js` lazily fetches `data/testimonies.json` when the testimonial section becomes visible, then builds the testimonial carousel cards.
- `js/contact.js` submits the contact form through EmailJS.
- `js/schema.js` injects JSON-LD into the page head for structured data.

## Data Flow

The project is data-driven. Most content is not hardcoded into the HTML and instead comes from JSON files:

- `data/courses.json` is the main course source. It stores course metadata such as id, name, category, featured flag, level, price, duration, thumbnails, poster images, description, learning outcomes, target audience, trainer, and sessions.
- `data/events.json` stores standalone event records for the calendar data set.
- `data/media-news.json` stores media/news cards and outbound article links.
- `data/media-gallery.json` stores gallery images grouped by category.
- `data/testimonies.json` stores testimonial entries, names, roles, quotes, and images.

The JavaScript side fetches these files with `fetch()`, parses the JSON, and then creates DOM nodes or HTML strings from the result. Most renderers also include fallback states so the page still shows a message when data is missing or the request fails.

## Page-Specific Notes

### Home

`index.html` loads the shared header, hero, featured courses, why section, event highlight, and footer. `js/course-cards.js` is loaded first so `js/index-courses.js` can render course cards into the homepage grid after components are ready.

### Courses

`courses.html` uses `js/course-cards.js` to render a searchable/filterable course list. The filter tabs and search input are wired in JavaScript, and clicking a card navigates to `coursedetail.html?id=<course id>`.

### Course Detail

`coursedetail.html` is a detail view driven by the URL query string. The page loads the matching course from `data/courses.json`, fills the poster, metadata, outcomes, sessions, and audience sections, and then renders related courses by reusing the shared course-card component.

### Calendar

`calendar.html` and `js/calendar.js` render a month-based agenda from the course session dates stored in `data/courses.json`.

### Media

`media.html` has two tabs: news and gallery. News cards come from `data/media-news.json`, and gallery thumbnails come from `data/media-gallery.json`. The gallery is loaded in batches and enhanced with GLightbox once the images are on the page.

### Testimonials

`testimonial-page.html` mostly uses hardcoded poster links, while `js/testimony.js` supports the separate testimonial carousel component by loading `data/testimonies.json` lazily.

### Contact

`contact.html` uses EmailJS through `js/contact.js` for form submission.

## Deployment Notes

`vercel.json` sets cache headers for HTML, JS/CSS, and image assets so the static site behaves predictably in production.

## Practical Handover Notes

- If a component or data fetch appears blank, first check that the site is being served over a local server instead of `file://`.
- If a page depends on injected components, make sure `js/main.js` is included before the page-specific script that renders into those components.
- If a course-related page is broken, check `data/courses.json` first because both the course listing and course detail view depend on it.


Special Thanks to these alumni/past contributors:
1. KhalMKR(Khalish) - original creator/maintainer
2. MHI0544(Haziq) - original creator/maintainer

All rights to material and content in this website rightfully belongs to Metadise Academy

