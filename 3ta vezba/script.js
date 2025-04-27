class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.currentView = "month";
    this.selectedEvent = null;
    this.events = this.loadEvents();
    this.initializeElements();
    this.addEventListeners();
    this.renderCalendar();
    this.dayPicker.value = this.currentDate.toISOString().split("T")[0];
  }

  initializeElements() {
    this.dayPicker = document.getElementById("dayPicker");
    this.daysGrid = document.getElementById("daysGrid");
    this.prevButton = document.getElementById("prevMonth");
    this.nextButton = document.getElementById("nextMonth");
    this.viewButtons = document.querySelectorAll(".view-btn");
    this.modal = document.getElementById("eventModal");
    this.closeButton = document.querySelector(".close-button");
    this.eventForm = document.getElementById("eventForm");
    this.modalTitle = document.getElementById("modalTitle");
    this.saveButton = document.getElementById("saveButton");
    this.deleteButton = document.getElementById("deleteButton");
  }

  addEventListeners() {
    this.prevButton.addEventListener("click", () => this.navigate(-1));
    this.nextButton.addEventListener("click", () => this.navigate(1));
    this.viewButtons.forEach((button) => {
      button.addEventListener("click", () => this.changeView(button));
    });

    this.closeButton.addEventListener("click", () => this.closeModal());
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    this.eventForm.addEventListener("submit", (e) => this.handleEventSubmit(e));
    this.deleteButton.addEventListener("click", () => this.deleteEvent());
    this.dayPicker.addEventListener("change", (e) => {
      if (e.target.value) {
        this.currentDate = new Date(e.target.value);
        this.renderCalendar();
      }
    });
  }

  navigate(direction) {
    const newDate = new Date(this.currentDate);
    switch (this.currentView) {
      case "day":
        newDate.setDate(newDate.getDate() + direction);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + direction * 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + direction);
        break;
    }
    this.currentDate = newDate;
    this.dayPicker.value = this.currentDate.toISOString().split("T")[0];
    this.renderCalendar();
  }

  changeView(button) {
    this.viewButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    this.currentView = button.dataset.view;

    if (this.currentView === "day") {
      this.dayPicker.value = this.currentDate.toISOString().split("T")[0];
    }

    this.renderCalendar();
  }

  loadEvents() {
    const savedEvents = localStorage.getItem("calendarEvents");
    const events = savedEvents
      ? JSON.parse(savedEvents).map((event) => ({
          ...event,
          date: new Date(event.date),
        }))
      : [];
    console.log("Loaded events:", events);
    return events;
  }

  saveEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(this.events));
  }

  openModal(date, event = null) {
    this.selectedDate = date;
    this.selectedEvent = event;
    this.modal.style.display = "block";

    const titleInput = document.getElementById("eventTitle");
    const timeInput = document.getElementById("eventTime");
    const eventIdInput = document.getElementById("eventId");

    if (event) {
      this.modalTitle.textContent = "Edit Event";
      this.saveButton.textContent = "Save Changes";
      this.deleteButton.style.display = "block";
      titleInput.value = event.title;
      timeInput.value = event.time;
      eventIdInput.value = event.id;
    } else {
      this.modalTitle.textContent = "Add New Event";
      this.saveButton.textContent = "Add Event";
      this.deleteButton.style.display = "none";
      titleInput.value = "";
      timeInput.value = "";
      eventIdInput.value = "";
    }
  }

  closeModal() {
    this.modal.style.display = "none";
    this.eventForm.reset();
    this.selectedEvent = null;
  }

  handleEventSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("eventTitle").value;
    const time = document.getElementById("eventTime").value;
    const eventId = document.getElementById("eventId").value;

    if (eventId) {
      const eventIndex = this.events.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        this.events[eventIndex] = {
          ...this.events[eventIndex],
          title,
          time,
        };
      }
    } else {
      this.events.push({
        id: Date.now().toString(),
        title,
        date: this.selectedDate,
        time,
      });
    }

    this.saveEvents();
    this.closeModal();
    this.renderCalendar();
  }

  deleteEvent() {
    if (
      this.selectedEvent &&
      confirm("Are you sure you want to delete this event?")
    ) {
      this.events = this.events.filter((e) => e.id !== this.selectedEvent.id);
      this.saveEvents();
      this.closeModal();
      this.renderCalendar();
    }
  }

  getMonthData() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const previousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = previousMonth.getDate();

    return {
      startingDayIndex,
      daysInMonth,
      daysInPreviousMonth,
      year,
      month,
    };
  }

  getWeekDates() {
    const curr = new Date(this.currentDate);
    curr.setDate(curr.getDate() - curr.getDay());

    return Array.from({ length: 7 }, () => {
      const date = new Date(curr);
      curr.setDate(curr.getDate() + 1);
      return date;
    });
  }

  getEventsForDate(date) {
    return this.events
      .filter(
        (event) =>
          event.date.getDate() === date.getDate() &&
          event.date.getMonth() === date.getMonth() &&
          event.date.getFullYear() === date.getFullYear()
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  formatEventTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  renderEvent(event, isWeekView = false) {
    const eventClass = isWeekView ? "week-event" : "event";
    return `
            <div class="${eventClass}" onclick="event.stopPropagation(); calendar.openModal(new Date(${event.date.getFullYear()}, ${event.date.getMonth()}, ${event.date.getDate()}), ${JSON.stringify(
      event
    ).replace(/"/g, "&quot;")})">
                <div class="event-content">
                    <span class="event-time">${this.formatEventTime(
                      event.time
                    )}</span>
                    <span class="event-title">${event.title}</span>
                </div>
            </div>
        `;
  }

  renderDayView() {
    const selectedDate = this.currentDate;
    const events = this.getEventsForDate(selectedDate);

    const eventsByTime = {};
    events.forEach((event) => {
      eventsByTime[event.time.slice(0, 2)] = event;
    });

    let dayHTML = `
            <div class="day-view-timeline">
                ${Array.from({ length: 24 }, (_, hour) => {
                  const hourString = hour.toString().padStart(2, "0");
                  const event = eventsByTime[hourString];
                  const isCurrentHour =
                    selectedDate.toDateString() === new Date().toDateString() &&
                    new Date().getHours() === hour;

                  return `
                        <div class="hour-block ${
                          isCurrentHour ? "current-hour" : ""
                        }" onclick="calendar.openModal(new Date(${selectedDate.getFullYear()}, ${selectedDate.getMonth()}, ${selectedDate.getDate()}))">
                            <div class="hour-label">${hourString}:00</div>
                            <div class="hour-event">
                                ${
                                  event
                                    ? `
                                    <div class="day-event" onclick="event.stopPropagation(); calendar.openModal(new Date(${event.date.getFullYear()}, ${event.date.getMonth()}, ${event.date.getDate()}), ${JSON.stringify(
                                        event
                                      ).replace(/"/g, "&quot;")})">
                                        <span class="event-time">${this.formatEventTime(
                                          event.time
                                        )}</span>
                                        <span class="event-title">${
                                          event.title
                                        }</span>
                                    </div>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

    this.daysGrid.innerHTML = dayHTML;
  }

  renderWeekView() {
    const weekDates = this.getWeekDates();

    let weekHTML = `
            <div class="week-view">
                ${weekDates
                  .map((date) => {
                    const events = this.getEventsForDate(date);
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    return `
                        <div class="week-day ${
                          isToday ? "current-day" : ""
                        }" onclick="calendar.openModal(new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}))">
                            <div class="week-date">
                                <div class="week-day-name">${date.toLocaleDateString(
                                  "default",
                                  { weekday: "short" }
                                )}</div>
                                <div class="week-day-number">${date.getDate()}</div>
                            </div>
                            <div class="week-events">
                                ${
                                  events
                                    .map((event) =>
                                      this.renderEvent(event, true)
                                    )
                                    .join("") ||
                                  '<div class="no-events">No events</div>'
                                }
                            </div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        `;

    this.daysGrid.innerHTML = weekHTML;
  }

  renderMonthView() {
    const { startingDayIndex, daysInMonth, daysInPreviousMonth, year, month } =
      this.getMonthData();

    let daysHTML = "";

    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dayNumber = daysInPreviousMonth - i;
      daysHTML += `<div class="calendar-day other-month"><span class="day-number">${dayNumber}</span></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const events = this.getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      let eventsHTML = events.map((event) => this.renderEvent(event)).join("");

      daysHTML += `
                <div class="calendar-day current-month ${
                  isToday ? "current-day" : ""
                }" onclick="calendar.openModal(new Date(${year}, ${month}, ${day}))">
                    <span class="day-number">${day}</span>
                    ${eventsHTML}
                </div>
            `;
    }

    const totalDays = startingDayIndex + daysInMonth;
    const remainingDays = 35 - totalDays;

    for (let day = 1; day <= remainingDays; day++) {
      daysHTML += `<div class="calendar-day other-month"><span class="day-number">${day}</span></div>`;
    }

    this.daysGrid.innerHTML = daysHTML;
  }

  renderCalendar() {
    this.daysGrid.className = "days-grid";

    switch (this.currentView) {
      case "day":
        this.daysGrid.classList.add("day-view-container");
        this.renderDayView();
        break;
      case "week":
        this.daysGrid.classList.add("week-view-container");
        this.renderWeekView();
        break;
      case "month":
        this.renderMonthView();
        break;
    }
  }
}

let calendar;
document.addEventListener("DOMContentLoaded", () => {
  calendar = new Calendar();
});
