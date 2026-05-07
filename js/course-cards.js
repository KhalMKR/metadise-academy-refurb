(() => {
  const COURSE_SOURCE = 'data/courses.json';

  // --- PERFORMANCE FIX: Start fetching IMMEDIATELY ---
  const coursesPromise = fetch(COURSE_SOURCE)
    .then(response => response.ok ? response.json() : [])
    .catch(() => []);

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchesSearch(course, query) {
    if (!query) return true;
    const haystack = [course.name, course.level, course.trainer].map(normalizeText).join(' ');
    return haystack.includes(query);
  }

  function createCourseCard(course) {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.dataset.courseId = course.id;

    // We add a click listener to the whole card as your CSS suggests (cursor: pointer)
    card.addEventListener('click', () => {
      window.location.href = `coursedetail.html?id=${course.id}`;
    });

    // --- DESIGN MATCH: Using your exact CSS classes ---
    card.innerHTML = `
      <div class="course-card__image-wrapper">
        <img
          class="course-card__image"
          src="${course.thumbnail}"
          alt="${course.name}"
          loading="lazy" 
          decoding="async"
          onerror="this.src='assets/images/body-background.png'"
        />
        <span class="course-card__level">${course.level || 'General'}</span>
      </div>
      <div class="course-card__body">
        <h3 class="course-card__title">${course.name}</h3>
        <p class="course-card__description">${course.description || ''}</p>
        
        

        <div class="course-card__footer">
          
          <button class="course-card__button">View Details</button>
        </div>
      </div>
    `;
    return card;
  }

  function renderCourseGrid(grid, courses, emptyMessage) {
    grid.innerHTML = '';
    if (!courses || !courses.length) {
      grid.innerHTML = `<div class="courses-empty"><p class="courses-empty__text">${emptyMessage}</p></div>`;
      return;
    }

    // --- PERFORMANCE FIX: DocumentFragment (Prevents layout thrashing) ---
    const fragment = document.createDocumentFragment();
    courses.forEach(course => fragment.appendChild(createCourseCard(course)));
    grid.appendChild(fragment);
  }

  window.MetadiseCourseCards = {
    renderCoursesIntoGrid: async (grid, options = {}) => {
      const { limit, emptyMessage = 'No courses available.' } = options;
      const data = await coursesPromise;
      const courses = Array.isArray(data) ? data : (data.courses || []);
      const toRender = limit ? courses.slice(0, limit) : courses;
      renderCourseGrid(grid, toRender, emptyMessage);
    },

    initCourseSearch: async (options) => {
      const { grid, searchInput, clearButton, resultsLabel, emptyMessage } = options;
      const data = await coursesPromise;
      const courses = Array.isArray(data) ? data : (data.courses || []);

      const updateResults = () => {
        const query = normalizeText(searchInput.value);
        const filtered = courses.filter(c => matchesSearch(c, query));
        renderCourseGrid(grid, filtered, emptyMessage);
        if (resultsLabel) {
          resultsLabel.textContent = query ? `Found ${filtered.length} courses.` : `Showing all ${courses.length} courses.`;
        }
      };

      searchInput.addEventListener('input', updateResults);
      clearButton?.addEventListener('click', () => { searchInput.value = ''; updateResults(); });
      updateResults();
    }
  };
})();