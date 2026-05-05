const renderFeaturedCourses = () => {
  const grid = document.getElementById('indexCoursesGrid');
  if (!grid || !window.MetadiseCourseCards) return;

  window.MetadiseCourseCards.renderCoursesIntoGrid(grid, {
    limit: 4,
    emptyMessage: 'Unable to load featured courses.',
  });
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('indexCoursesGrid')) {
    renderFeaturedCourses();
    return;
  }

  window.addEventListener('metadise:components-loaded', renderFeaturedCourses, { once: true });
});
