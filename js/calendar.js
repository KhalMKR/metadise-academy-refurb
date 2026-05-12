document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendar-month-label');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayBtn');

  if (!calendarGrid || !monthLabel) {
    return;
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let calendarEvents = [];

  const parseDateParts = (dateString) => {
    if (!dateString) return null;

    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (date) =>
    date.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const createRangeDates = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const lastDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const normalizeCourseSessions = (courses) => {
    if (!Array.isArray(courses)) return [];

    return courses.flatMap((course) => {
      if (!course || !Array.isArray(course.sessions)) return [];

      return course.sessions
        .map((session, index) => {
          const startDate = parseDateParts(session.startDate);
          const endDate = parseDateParts(session.endDate || session.startDate);

          if (!startDate) return null;

          return {
            id: `${course.id}-session-${index + 1}`,
            title: course.name,
            type: 'course',
            category: course.level || 'Course',
            location: 'Metadise Academy',
            time: 'Training session',
            companyName: '',
            courseId: course.id,
            courseName: course.name,
            startDate,
            endDate: endDate || startDate,
            notes: course.trainer || '',
          };
        })
        .filter(Boolean);
    });
  };

  const buildCalendarEvents = async () => {
    try {
      const coursesResponse = await fetch('data/courses.json');

      if (!coursesResponse.ok) {
        throw new Error('Unable to load calendar course data');
      }

      const coursesPayload = await coursesResponse.json();

      const courseSessions = normalizeCourseSessions(coursesPayload.courses);

      calendarEvents = courseSessions.sort((a, b) => a.startDate - b.startDate);
    } catch (error) {
      console.error(error);
      calendarEvents = [];
    }
  };

  const buildDayIndex = () => {
    const map = new Map();

    calendarEvents.forEach((eventItem) => {
      const dates = createRangeDates(eventItem.startDate, eventItem.endDate || eventItem.startDate);

      dates.forEach((date) => {
        const dateKey = formatDateKey(date);

        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }

        map.get(dateKey).push(eventItem);
      });
    });

    return map;
  };

  const renderCalendar = () => {
    if (visibleMonth < currentMonthStart) {
      visibleMonth = new Date(currentMonthStart);
    }

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    monthLabel.textContent = visibleMonth.toLocaleDateString('en-MY', {
      month: 'long',
      year: 'numeric'
    });

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const visibleEvents = calendarEvents.filter((eventItem) => {
      const eventStart = eventItem.startDate;
      const eventEnd = eventItem.endDate || eventItem.startDate;
      return eventStart <= monthEnd && eventEnd >= monthStart;
    });

    if (!visibleEvents.length) {
      calendarGrid.innerHTML = '<div class="calendar-agenda__empty">No course sessions found for this month.</div>';
    } else {
      const agendaRows = visibleEvents
        .sort((a, b) => a.startDate - b.startDate)
        .map((eventItem) => {
          const location = eventItem.location || 'Metadise Academy';
          const start = eventItem.startDate;
          const end = eventItem.endDate || eventItem.startDate;
          const monthText = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const isRange = formatDateKey(start) !== formatDateKey(end);
          const dayValue = isRange
            ? `${String(start.getDate()).padStart(2, '0')} - ${String(end.getDate()).padStart(2, '0')}`
            : String(start.getDate()).padStart(2, '0');

          return `
            <article class="calendar-agenda__item calendar-agenda__item--course">
              <div class="calendar-agenda__date">
                <span class="calendar-agenda__month">${monthText}</span>
                <span class="calendar-agenda__day">${dayValue}</span>
              </div>
              <div class="calendar-agenda__content">
                <h3 class="calendar-agenda__title">${eventItem.title || 'Untitled Event'}</h3>
                <p class="calendar-agenda__meta">${location}</p>
              </div>
            </article>
          `;
        })
        .join('');

      calendarGrid.innerHTML = `<div class="calendar-agenda">${agendaRows}</div>`;
    }

    if (prevMonthBtn) {
      const isAtCurrentMonth =
        visibleMonth.getFullYear() === currentMonthStart.getFullYear() &&
        visibleMonth.getMonth() === currentMonthStart.getMonth();
      prevMonthBtn.disabled = isAtCurrentMonth;
      prevMonthBtn.setAttribute('aria-disabled', String(isAtCurrentMonth));
    }
  };

  const loadCalendar = async () => {
    await buildCalendarEvents();
    renderCalendar();
  };

  prevMonthBtn?.addEventListener('click', () => {
    const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    if (previousMonth < currentMonthStart) {
      return;
    }
    visibleMonth = previousMonth;
    renderCalendar();
  });

  nextMonthBtn?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  todayBtn?.addEventListener('click', () => {
    visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });

  loadCalendar();
});