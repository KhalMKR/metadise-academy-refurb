(() => {
  const COURSE_SOURCE = 'data/courses.json';

  const elements = {
    status: document.getElementById('courseDetailStatus'),
    title: document.getElementById('course-detail-title'),
    summary: document.getElementById('courseDetailSummary'),
    tags: document.getElementById('courseDetailTags'),
    meta: document.getElementById('courseDetailMeta'),
    poster: document.getElementById('courseDetailPoster'),
    description: document.getElementById('courseDetailDescription'),
    audience: document.getElementById('courseDetailAudience'),
    outcomes: document.getElementById('courseDetailOutcomes'),
    sessions: document.getElementById('courseDetailSessions'),
    snapshot: document.getElementById('courseDetailSnapshot'),
    relatedGrid: document.getElementById('courseDetailRelatedGrid'),
  };

  const currency = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  /**
   * Helper to ensure we don't display empty strings or nulls
   */
  function fallback(value, message = 'TBA') {
    return value && String(value).trim() ? value : message;
  }

  function getTrainerLabel(course) {
    return fallback(course.trainer, 'TBA');
  }

  function setStatus(message, isError = false) {
    if (!elements.status) return;
    elements.status.textContent = message;
    elements.status.style.color = isError ? '#fca5a5' : '#fde68a';
  }

  function formatSession(session) {
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
  }

  function normalizeAudienceList(audience) {
    if (Array.isArray(audience)) {
      return audience.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof audience === 'string' && audience.trim()) {
      return audience.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
  }

  function formatAudienceSummary(audience) {
    const audienceItems = normalizeAudienceList(audience);
    return audienceItems.length ? audienceItems.join(', ') : 'Open to all';
  }

  function buildAudience(course) {
    if (!elements.audience) return;

    const audienceItems = normalizeAudienceList(course.targetAudience);

    if (!audienceItems.length) {
      elements.audience.innerHTML = '<li>Information coming soon.</li>';
      return;
    }

    elements.audience.innerHTML = audienceItems.map((item) => `<li>${item}</li>`).join('');
  }

  function buildSnapshot(course) {
    const trainerLabel = getTrainerLabel(course);
    const priceLabel = course.price ? currency.format(course.price) : 'Contact for Price';
    
    const entries = [
      ['Level', fallback(course.level)],
      ['Duration', fallback(course.duration)],
      ['Price', priceLabel],
      ['Trainer', trainerLabel],
      ['Audience', formatAudienceSummary(course.targetAudience)],
    ];

    if (elements.snapshot) {
      elements.snapshot.innerHTML = entries.map(([label, value]) => `
        <div class="course-detail-snapshot__item">
          <span class="course-detail-snapshot__label">${label}</span>
          <span class="course-detail-snapshot__value">${value}</span>
        </div>
      `).join('');
    }
  }

  function buildMeta(course) {
    const priceLabel = course.price ? currency.format(course.price) : 'TBA';
    const metaItems = [
      { icon: 'fa-solid fa-clock', label: fallback(course.duration) },
      { icon: 'fa-solid fa-signal', label: fallback(course.level) },
      { icon: 'fa-solid fa-wallet', label: priceLabel },
    ];

    if (elements.meta) {
      elements.meta.innerHTML = metaItems.map((item) => `
        <span class="course-detail__meta-item">
          <i class="${item.icon}" aria-hidden="true"></i>
          ${item.label}
        </span>
      `).join('');
    }
  }

  function buildTags(course) {
    const trainerLabel = getTrainerLabel(course);
    const tags = [
      fallback(course.level), 
      fallback(course.duration), 
      `Trainer: ${trainerLabel}`
    ];

    if (elements.tags) {
      elements.tags.innerHTML = tags.map((tag) => `
        <span class="course-detail__tag">${tag}</span>
      `).join('');
    }
  }

  function buildOutcomes(course) {
    if (!elements.outcomes) return;

    const outcomes = Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [];

    if (outcomes.length === 0) {
      elements.outcomes.innerHTML = `<li>Learning outcomes to be announced.</li>`;
      return;
    }

    elements.outcomes.innerHTML = outcomes.map((outcome) => `<li>${outcome}</li>`).join('');
  }

  function buildSessions(course) {
    if (!elements.sessions) return;

    const sessions = Array.isArray(course.sessions) ? course.sessions : [];

    if (!sessions.length) {
      elements.sessions.innerHTML = `
      <article class="course-detail-session course-detail-session--tba">
        <p class="course-detail-session__month">Coming soon</p>
        <p>Dates to be announced. Contact us to register your interest.</p>
      </article>
    `;
      return;
    }

    elements.sessions.innerHTML = sessions.map((session) => `
      <article class="course-detail-session">
        <p class="course-detail-session__month">${session.month}</p>
        <p>${formatSession(session)}</p>
      </article>
    `).join('');
  }

  function buildRelatedCourses(course, courses) {
    if (!elements.relatedGrid || !window.MetadiseCourseCards) return;

    const relatedCourses = courses.filter((item) => item.id !== course.id).slice(0, 3);

    elements.relatedGrid.innerHTML = '';

    if (!relatedCourses.length) {
      elements.relatedGrid.innerHTML = '<p class="course-detail__empty">No related courses available right now.</p>';
      return;
    }

    relatedCourses.forEach((relatedCourse) => {
      elements.relatedGrid.appendChild(window.MetadiseCourseCards.createCourseCard(relatedCourse));
    });
  }

  function renderNotFound() {
    if (elements.title) elements.title.textContent = 'Course not found';
    if (elements.summary) {
      elements.summary.textContent = 'We could not find the course you requested. Browse the full course list to continue.';
    }
    if (elements.poster) {
      elements.poster.src = 'assets/images/body-background.png';
      elements.poster.alt = 'Course placeholder image';
    }
    if (elements.tags) elements.tags.innerHTML = '';
    if (elements.meta) elements.meta.innerHTML = '';
    if (elements.description) elements.description.textContent = '';
    if (elements.audience) elements.audience.innerHTML = '';
    if (elements.outcomes) elements.outcomes.innerHTML = '';
    if (elements.sessions) elements.sessions.innerHTML = '';
    if (elements.snapshot) elements.snapshot.innerHTML = '';
    if (elements.relatedGrid) {
      elements.relatedGrid.innerHTML = '<p class="course-detail__empty">Please return to the courses page and select a course.</p>';
    }
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (!courseId) {
      setStatus('No course id provided.', true);
      renderNotFound();
      return;
    }

    try {
      const response = await fetch(COURSE_SOURCE);
      if (!response.ok) {
        throw new Error('Failed to load courses');
      }

      const data = await response.json();
      const courses = data.courses || [];
      const course = courses.find((item) => item.id === courseId);

      if (!course) {
        setStatus('Course not found.', true);
        renderNotFound();
        return;
      }

      document.title = `${course.name} – Metadise Academy`;

      if (elements.status) elements.status.textContent = `Now viewing ${course.name}`;
      if (elements.title) elements.title.textContent = course.name;
      
      // Applying text fallbacks here
      if (elements.summary) elements.summary.textContent = fallback(course.description, 'No description provided.');
      if (elements.description) elements.description.textContent = fallback(course.description, 'No additional details available.');
      buildAudience(course);
      
      if (elements.poster) {
        elements.poster.src = course.poster || course.thumbnail || 'assets/images/body-background.png';
        elements.poster.alt = `${course.name} course poster`;
      }

      buildTags(course);
      buildMeta(course);
      buildSnapshot(course);
      buildOutcomes(course);
      buildSessions(course);
      buildRelatedCourses(course, courses);
    } catch (error) {
      console.error(error);
      setStatus('Unable to load course details.', true);
      renderNotFound();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();