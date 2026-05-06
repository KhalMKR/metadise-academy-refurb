(() => {
  const COURSE_SOURCE = 'data/courses.json';

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function matchesSearch(course, query) {
    if (!query) return true;

    const haystack = [course.name, course.level, course.trainer]
      .map(normalizeText)
      .join(' ');

    return haystack.includes(query);
  }

  function renderCourseGrid(grid, courses, emptyMessage) {
    grid.innerHTML = '';

    if (!courses.length) {
      grid.innerHTML = `<p class="courses-empty__text">${emptyMessage}</p>`;
      return;
    }

    courses.forEach((course) => {
      grid.appendChild(createCourseCard(course));
    });
  }

  function createCourseCard(course) {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.dataset.courseId = course.id;

    card.innerHTML = `
      <div class="course-card__image-wrapper">
        <img
          class="course-card__image"
          src="${course.thumbnail}"
          alt="${course.name} thumbnail"
          onerror="this.style.display='none'"
        />
        <span class="course-card__level">${course.level}</span>
      </div>

      <div class="course-card__body">
        <h3 class="course-card__title">${course.name}</h3>
        <p class="course-card__description">${course.description}</p>

        <div class="course-card__footer">
          <button class="course-card__button" aria-label="View ${course.name} course details">
            View Details →
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `coursedetail.html?id=${course.id}`;
    });

    return card;
  }

  async function fetchCourses() {
    const response = await fetch(COURSE_SOURCE);
    if (!response.ok) {
      throw new Error('Failed to load courses');
    }

    const data = await response.json();
    return data.courses || [];
  }

  async function renderCoursesIntoGrid(grid, options = {}) {
    if (!grid) return;

    const { limit = null, emptyMessage = 'Unable to load courses. Please try again later.' } = options;

    try {
      const courses = await fetchCourses();
      const visibleCourses = limit ? courses.slice(0, limit) : courses;

      grid.innerHTML = '';
      visibleCourses.forEach((course) => {
        grid.appendChild(createCourseCard(course));
      });
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<p class="courses-empty__text">${emptyMessage}</p>`;
    }
  }

  async function initCourseSearch(options = {}) {
    const {
      grid,
      searchInput,
      clearButton,
      resultsLabel,
      emptyMessage = 'No courses match your search.',
    } = options;

    if (!grid || !searchInput) return;

    try {
      const courses = await fetchCourses();

      const updateResults = () => {
        const query = normalizeText(searchInput.value);
        const visibleCourses = courses.filter((course) => matchesSearch(course, query));

        renderCourseGrid(grid, visibleCourses, emptyMessage);

        if (resultsLabel) {
          if (query) {
            resultsLabel.textContent = `Showing ${visibleCourses.length} of ${courses.length} courses for "${searchInput.value.trim()}".`;
          } else {
            resultsLabel.textContent = `Showing all ${courses.length} courses.`;
          }
        }
      };

      searchInput.addEventListener('input', updateResults);

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          searchInput.value = '';
          searchInput.focus();
          updateResults();
        });
      }

      updateResults();
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<p class="courses-empty__text">Unable to load courses. Please try again later.</p>`;
      if (resultsLabel) {
        resultsLabel.textContent = 'Unable to load courses right now.';
      }
    }
  }

  window.MetadiseCourseCards = {
    createCourseCard,
    fetchCourses,
    renderCoursesIntoGrid,
    initCourseSearch,
  };
})();