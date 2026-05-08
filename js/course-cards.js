(() => {
  const COURSE_SOURCE = "data/courses.json";

  const coursesPromise = fetch(COURSE_SOURCE)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load courses.");
      }

      return response.json();
    })
    .catch((error) => {
      console.error("Course loading error:", error);
      return { courses: [] };
    });

  let allCourses = [];
  let activeFilterType = "category";
  let activeFilterValue = "featured";
  let activeSearchQuery = "";

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHTML(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isFeaturedCourse(course) {
    return course.featured === true || course.featured === "true";
  }

  function matchesSearch(course, query) {
    if (!query) return true;

    const haystack = [
      course.name,
      course.level,
      course.trainer,
      course.category,
      course.description
    ]
      .map(normalizeText)
      .join(" ");

    return haystack.includes(query);
  }

  function matchesFilter(course) {
    if (activeFilterType === "category") {
      if (activeFilterValue === "featured") {
        return isFeaturedCourse(course);
      }

      if (activeFilterValue === "!featured" || activeFilterValue === "others") {
        return !isFeaturedCourse(course);
      }

      return normalizeText(course.category) === normalizeText(activeFilterValue);
    }

    if (activeFilterType === "level") {
      return normalizeText(course.level) === normalizeText(activeFilterValue);
    }

    return true;
  }

  function getFilteredCourses() {
    return allCourses.filter((course) => {
      const filterMatch = matchesFilter(course);
      const searchMatch = matchesSearch(course, activeSearchQuery);

      return filterMatch && searchMatch;
    });
  }

  function createCourseCard(course) {
    const card = document.createElement("article");
    card.className = "course-card";
    card.dataset.courseId = course.id || "";

    card.addEventListener("click", () => {
      window.location.href = `coursedetail.html?id=${encodeURIComponent(course.id || "")}`;
    });

    const thumbnail = course.thumbnail || "assets/images/body-background.png";
    const name = escapeHTML(course.name || "Untitled Course");
    const level = escapeHTML(course.level || "General");
    const description = escapeHTML(course.description || "");

    card.innerHTML = `
      <div class="course-card__image-wrapper">
        <img
          class="course-card__image"
          src="${thumbnail}"
          alt="${name}"
          loading="lazy"
          decoding="async"
          onerror="this.src='assets/images/body-background.png'"
        />

        <span class="course-card__level">
          ${level}
        </span>
      </div>

      <div class="course-card__body">
        <h3 class="course-card__title">
          ${name}
        </h3>

        <p class="course-card__description">
          ${description}
        </p>

        <div class="course-card__footer">
          <button class="course-card__button" type="button">
            View Details
          </button>
        </div>
      </div>
    `;

    const button = card.querySelector(".course-card__button");

    if (button) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        window.location.href = `coursedetail.html?id=${encodeURIComponent(course.id || "")}`;
      });
    }

    return card;
  }

  function renderCourseGrid(grid, courses, emptyMessage) {
    grid.innerHTML = "";

    if (!courses || !courses.length) {
      grid.innerHTML = `
        <div class="courses-empty">
          <p class="courses-empty__text">${emptyMessage}</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    courses.forEach((course) => {
      fragment.appendChild(createCourseCard(course));
    });

    grid.appendChild(fragment);
  }

  function getFilterLabel() {
    if (activeFilterType === "category") {
      if (activeFilterValue === "featured") return "Featured";
      if (activeFilterValue === "!featured" || activeFilterValue === "others") return "Others";
    }

    return String(activeFilterValue || "")
      .replace("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function updateResultsLabel(resultsLabel, filteredCourses) {
    if (!resultsLabel) return;

    const filterName = getFilterLabel();

    if (activeSearchQuery) {
      resultsLabel.textContent = `Found ${filteredCourses.length} course(s) in ${filterName}.`;
      return;
    }

    resultsLabel.textContent = `Showing ${filteredCourses.length} ${filterName} course(s).`;
  }

  function updateActiveTab(tabs, selectedTab) {
    tabs.forEach((tab) => {
      const isActive = tab === selectedTab;

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  }

  function closeMobileCourseFilter() {
    const filterToggle = document.getElementById("courseFilterToggle");
    const filterPanel = document.getElementById("courseFilterPanel");

    if (!filterToggle || !filterPanel) return;

    filterPanel.classList.remove("is-open");
    filterToggle.classList.remove("is-open");
    filterToggle.setAttribute("aria-expanded", "false");
  }

  function renderFilteredCourses(options) {
    const { grid, resultsLabel, emptyMessage } = options;

    const filteredCourses = getFilteredCourses();

    renderCourseGrid(
      grid,
      filteredCourses,
      emptyMessage || "No courses found."
    );

    updateResultsLabel(resultsLabel, filteredCourses);
  }

  async function getCourses() {
    const data = await coursesPromise;
    return Array.isArray(data) ? data : data.courses || [];
  }

  function initMobileCourseFilter() {
    const filterToggle = document.getElementById("courseFilterToggle");
    const filterPanel = document.getElementById("courseFilterPanel");

    if (!filterToggle || !filterPanel) return;

    filterToggle.addEventListener("click", () => {
      const isOpen = filterPanel.classList.toggle("is-open");

      filterToggle.classList.toggle("is-open", isOpen);
      filterToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  window.MetadiseCourseCards = {
    createCourseCard,

    renderCoursesIntoGrid: async (grid, options = {}) => {
      const {
        limit,
        emptyMessage = "No courses available.",
        featuredOnly = false
      } = options;

      const courses = await getCourses();

      let toRender = featuredOnly
        ? courses.filter((course) => isFeaturedCourse(course))
        : courses;

      if (limit) {
        toRender = toRender.slice(0, limit);
      }

      renderCourseGrid(grid, toRender, emptyMessage);
    },

    initCourseSearch: async (options) => {
      const {
        grid,
        searchInput,
        clearButton,
        resultsLabel,
        emptyMessage = "No courses found."
      } = options;

      if (!grid) return;

      allCourses = await getCourses();

      const tabs = Array.from(
        document.querySelectorAll("[data-course-category], [data-course-level]")
      );

      const updateResults = () => {
        activeSearchQuery = normalizeText(searchInput?.value || "");

        renderFilteredCourses({
          grid,
          resultsLabel,
          emptyMessage
        });
      };

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          if (tab.dataset.courseCategory) {
            activeFilterType = "category";
            activeFilterValue = tab.dataset.courseCategory;
          }

          if (tab.dataset.courseLevel) {
            activeFilterType = "level";
            activeFilterValue = tab.dataset.courseLevel;
          }

          updateActiveTab(tabs, tab);
          updateResults();

          if (window.innerWidth <= 768) {
            closeMobileCourseFilter();
          }
        });
      });

      if (searchInput) {
        searchInput.addEventListener("input", updateResults);
      }

      if (clearButton) {
        clearButton.addEventListener("click", () => {
          if (searchInput) {
            searchInput.value = "";
          }

          activeSearchQuery = "";
          updateResults();
        });
      }

      updateResults();
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMobileCourseFilter();
  });
})();