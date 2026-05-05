const renderFeaturedCourses = async () => {
  const grid = document.getElementById('indexCoursesGrid');
  if (!grid) return;

  try {
    const res = await fetch('data/courses.json');
    if (!res.ok) throw new Error('Failed to load courses');
    const data = await res.json();
    const courses = (data.courses || []).slice(0, 4);

    grid.innerHTML = '';
    courses.forEach(course => {
      const card = document.createElement('article');
      card.className = 'course-card';
      card.dataset.courseId = course.id;

      card.innerHTML = `
        <div class="course-card__image-wrapper">
          <img class="course-card__image" src="${course.thumbnail}" alt="${course.name} thumbnail" onerror="this.style.display='none'" />
          <span class="course-card__level">${course.level}</span>
        </div>
        <div class="course-card__body">
          <h3 class="course-card__title">${course.name}</h3>
          <p class="course-card__description">${course.description}</p>

          <div class="course-card__meta">
            <div class="course-card__meta-item"><strong>Duration:</strong><span class="course-card__duration">${course.duration}</span></div>
            <div class="course-card__meta-item"><strong>Trainer:</strong><span class="course-card__trainer">${course.trainer}</span></div>
          </div>

          <div class="course-card__footer">
            <span class="course-card__price">₱${course.price.toLocaleString()}</span>
            <button class="course-card__button">View Details →</button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `course-details.html?id=${course.id}`;
      });

      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="courses-empty__text">Unable to load featured courses.</p>';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('indexCoursesGrid')) {
    renderFeaturedCourses();
    return;
  }

  window.addEventListener('metadise:components-loaded', renderFeaturedCourses, { once: true });
});
