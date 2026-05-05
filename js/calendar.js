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
  let events = [];

  const formatDateLabel = (date) =>
    date.toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  const eventDateMap = () => {
    const map = new Map();

    events.forEach((eventItem) => {
      if (!eventItem || !eventItem.date) {
        return;
      }

      if (!map.has(eventItem.date)) {
        map.set(eventItem.date, []);
      }

      map.get(eventItem.date).push(eventItem);
    });

    return map;
  };

  const renderEvents = () => {
    if (!events.length) {
      eventList.innerHTML = '<li class="event-item">No events available yet.</li>';
      return;
    }

    const sortedEvents = [...events]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);

    eventList.innerHTML = sortedEvents
      .map((eventItem) => {
        const location = eventItem.location ? ` - ${eventItem.location}` : '';
        const time = eventItem.time || 'TBA';

        return `
          <li class="event-item">
            <p class="event-item__date">${formatDateLabel(new Date(eventItem.date))}</p>
            <h3 class="event-item__title">${eventItem.title || 'Untitled Event'}</h3>
            <p class="event-item__meta">${time}${location}</p>
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
    const datesWithEvents = eventDateMap();

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
      const dateKey = currentDate.toISOString().split('T')[0];
      const hasEvent = datesWithEvents.has(dateKey);

      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const modifierClass = [
        'calendar-day',
        isToday ? 'calendar-day--today' : '',
        hasEvent ? 'calendar-day--event' : ''
      ]
        .filter(Boolean)
        .join(' ');

      const badge = hasEvent
        ? `<span class="calendar-day__badge">${datesWithEvents.get(dateKey).length} event</span>`
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

  const loadEvents = async () => {
    try {
      const response = await fetch('data/events.json');

      if (!response.ok) {
        throw new Error('Unable to load events data');
      }

      const payload = await response.json();
      events = Array.isArray(payload.events) ? payload.events : [];
    } catch (error) {
      console.error(error);
      events = [];
    }

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

  loadEvents();
});