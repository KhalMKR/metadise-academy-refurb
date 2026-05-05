document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendar-month-label');
  const eventList = document.getElementById('eventList');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayBtn');

  if (!calendarGrid || !monthLabel || !eventList) {
    return;
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
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

  const getEventType = (eventItem) => {
    if (!eventItem || !eventItem.type) return 'event';
    return eventItem.type;
  };

  const getTypePriority = (eventType) => {
    if (eventType === 'booking') return 3;
    if (eventType === 'course') return 2;
    return 1;
  };

  const getEventTypeLabel = (eventType) => {
    if (eventType === 'booking') return 'Private booking';
    if (eventType === 'course') return 'Course session';
    return 'Event';
  };

  const getEventTypeClass = (eventType) => {
    if (eventType === 'booking') return 'calendar-day--booking';
    if (eventType === 'course') return 'calendar-day--course';
    return 'calendar-day--event';
  };

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

  const normalizeStandaloneEvents = (payloadEvents) => {
    if (!Array.isArray(payloadEvents)) return [];

    return payloadEvents
      .map((eventItem) => {
        const startDate = parseDateParts(eventItem.date || eventItem.startDate);
        const endDate = parseDateParts(eventItem.endDate || eventItem.date);

        if (!startDate) return null;

        return {
          id: eventItem.id,
          title: eventItem.title || eventItem.companyName || 'Untitled Event',
          type: eventItem.type || 'event',
          category: eventItem.category || '',
          location: eventItem.location || '',
          time: eventItem.time || 'TBA',
          companyName: eventItem.companyName || '',
          startDate,
          endDate: endDate || startDate,
          notes: eventItem.notes || '',
        };
      })
      .filter(Boolean);
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
      const [eventsResponse, coursesResponse] = await Promise.all([
        fetch('data/events.json'),
        fetch('data/courses.json'),
      ]);

      if (!eventsResponse.ok || !coursesResponse.ok) {
        throw new Error('Unable to load calendar source data');
      }

      const eventsPayload = await eventsResponse.json();
      const coursesPayload = await coursesResponse.json();

      const standaloneEvents = normalizeStandaloneEvents(eventsPayload.events);
      const courseSessions = normalizeCourseSessions(coursesPayload.courses);

      calendarEvents = [...standaloneEvents, ...courseSessions].sort(
        (a, b) => a.startDate - b.startDate || getTypePriority(getEventType(b)) - getTypePriority(getEventType(a))
      );
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

  const renderEvents = () => {
    if (!calendarEvents.length) {
      eventList.innerHTML = '<li class="event-item">No events available yet.</li>';
      return;
    }

    const sortedEvents = [...calendarEvents]
      .sort((a, b) => a.startDate - b.startDate || getTypePriority(getEventType(b)) - getTypePriority(getEventType(a)))
      .slice(0, 8);

    eventList.innerHTML = sortedEvents
      .map((eventItem) => {
        const location = eventItem.location ? ` - ${eventItem.location}` : '';
        const time = eventItem.time || 'TBA';
        const typeLabel = getEventTypeLabel(getEventType(eventItem));
        const dateLabel = eventItem.endDate && formatDateKey(eventItem.endDate) !== formatDateKey(eventItem.startDate)
          ? `${formatDateLabel(eventItem.startDate)} - ${formatDateLabel(eventItem.endDate)}`
          : formatDateLabel(eventItem.startDate);

        return `
          <li class="event-item">
            <p class="event-item__date">${dateLabel}</p>
            <h3 class="event-item__title">${eventItem.title || 'Untitled Event'}</h3>
            <p class="event-item__meta">${typeLabel} · ${time}${location}</p>
          </li>
        `;
      })
      .join('');
  };

  const renderCalendar = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    monthLabel.textContent = visibleMonth.toLocaleDateString('en-MY', {
      month: 'long',
      year: 'numeric'
    });

    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const dayIndex = buildDayIndex();

    const cells = [];

    weekdayNames.forEach((dayName) => {
      cells.push(`<div class="calendar-weekday" role="columnheader">${dayName}</div>`);
    });

    for (let i = startWeekday - 1; i >= 0; i -= 1) {
      const dateNumber = prevMonthDays - i;
      cells.push(`
        <div class="calendar-day calendar-day--outside" role="gridcell" aria-disabled="true">
          <span class="calendar-day__date">${dateNumber}</span>
        </div>
      `);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, month, day);
      const dateKey = formatDateKey(currentDate);
      const eventsForDay = dayIndex.get(dateKey) || [];
      const eventType = eventsForDay.length ? getEventType(eventsForDay.reduce((winner, candidate) => {
        return getTypePriority(getEventType(candidate)) > getTypePriority(getEventType(winner)) ? candidate : winner;
      }, eventsForDay[0])) : '';

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const modifierClass = [
        'calendar-day',
        isToday ? 'calendar-day--today' : '',
        eventType ? getEventTypeClass(eventType) : ''
      ]
        .filter(Boolean)
        .join(' ');

      const badge = eventsForDay.length
        ? `<span class="calendar-day__badge">${eventsForDay.length} item${eventsForDay.length > 1 ? 's' : ''}</span>`
        : '';

      cells.push(`
        <div class="${modifierClass}" role="gridcell" aria-label="${formatDateLabel(currentDate)}">
          <span class="calendar-day__date">${day}</span>
          ${badge}
        </div>
      `);
    }

    const usedCells = startWeekday + daysInMonth;
    const trailingDays = (7 - (usedCells % 7)) % 7;

    for (let i = 1; i <= trailingDays; i += 1) {
      cells.push(`
        <div class="calendar-day calendar-day--outside" role="gridcell" aria-disabled="true">
          <span class="calendar-day__date">${i}</span>
        </div>
      `);
    }

    calendarGrid.innerHTML = cells.join('');
  };

  const loadCalendar = async () => {
    await buildCalendarEvents();
    renderEvents();
    renderCalendar();
  };

  prevMonthBtn?.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
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