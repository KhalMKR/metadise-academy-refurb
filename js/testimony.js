// testimony.js

let testimonialsData = []; // Store the data globally after fetching

function getPlaceholderImageUrl() {
    let scriptEl = document.currentScript;
    if (!scriptEl) {
        scriptEl = document.querySelector('script[src$="testimony.js"]');
    }

    try {
        if (scriptEl && scriptEl.src) {
            return new URL('../assets/images/testimonies/placeholder%20person%20image.png', scriptEl.src).href;
        }
    } catch (e) {
        // fallthrough to defaults
    }

    return '/assets/images/testimonies/placeholder%20person%20image.png';
}

function getRoleLabel(testimony) {
    if (Array.isArray(testimony.roles) && testimony.roles.length > 0) {
        return testimony.roles.join(' • ');
    }

    if (typeof testimony.roles === 'string' && testimony.roles.trim()) {
        return testimony.roles.trim();
    }

    if (typeof testimony.role === 'string' && testimony.role.trim()) {
        return testimony.role.trim();
    }

    return 'Trainee';
}

function getImageUrl(testimony, placeholderImage) {
    if (typeof testimony.picture === 'string' && testimony.picture.trim()) {
        return testimony.picture.trim();
    }

    return placeholderImage;
}

function getDataUrl() {
    // Try to resolve the JSON path relative to this script tag so it works
    // when the site is served from a subpath (e.g., GitHub Pages /repo/)
    let scriptEl = document.currentScript;
    if (!scriptEl) {
        scriptEl = document.querySelector('script[src$="testimony.js"]');
    }

    try {
        if (scriptEl && scriptEl.src) {
            return new URL('../data/testimonies.json', scriptEl.src).href;
        }
    } catch (e) {
        // fallthrough to defaults
    }

    // Fallbacks: try root-relative then relative to location
    return '/data/testimonies.json';
}

async function loadData() {
    const url = getDataUrl();
    console.log('Fetching testimonials from', url);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        testimonialsData = data.testimonies || [];

        const container = document.querySelector('.testimony-carousel');
        if (!container) {
            console.warn('No .testimony-carousel container found');
            return;
        }

        container.innerHTML = '';
        testimonialsData.forEach(displayTestimonial);
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

function displayTestimonial(testimony) {
    const container = document.querySelector('.testimony-carousel');
    if (!container) return;

    const placeholderImage = getPlaceholderImageUrl();
    const profileImage = getImageUrl(testimony, placeholderImage);
    const authorRole = getRoleLabel(testimony);

    const testimonialItem = document.createElement('div');
    testimonialItem.className = 'testimony-item';

    testimonialItem.innerHTML = `
        <div class="testimony-card" data-aos="fade-up" data-aos-duration="800">
            <span class="testimony-quote" aria-hidden="true">“</span>
            <blockquote class="testimony-text">${testimony.testimony}</blockquote>
            <div class="testimony-divider"></div>
            <div class="testimony-author">
                <img class="testimony-avatar" src="${profileImage}" alt="${testimony.name}" onerror="if (this.src !== '${placeholderImage}') { this.src='${placeholderImage}'; }">
                <div class="testimony-meta">
                    <cite class="testimony-name">${testimony.name}</cite>
                    <span class="testimony-handle">${authorRole}</span>
                </div>
            </div>
        </div>
    `;

    container.appendChild(testimonialItem);
}

// Function to kick off the logic
function initTestimonials() {
    console.log('Initializing Testimonials (lazy)...');

    const section = document.querySelector('.testimony-section');
    if (!section) {
        // No section on the page — still try to load data immediately
        loadData();
        return;
    }

    // If IntersectionObserver is supported, lazy-load when section becomes visible
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadData();
                    observer.disconnect();
                }
            });
        }, { rootMargin: '200px' });

        io.observe(section);
    } else {
        // Fallback: load immediately
        loadData();
    }
}

// Check if DOM is already ready, otherwise wait for it
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initTestimonials();
} else {
    window.addEventListener('DOMContentLoaded', initTestimonials);
}