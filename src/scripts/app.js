const year = 2025;
const calendarContainer = document.getElementById('calendar');
const exerciseDays = JSON.parse(localStorage.getItem('exerciseDays')) || {};

function renderCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    monthNames.forEach((month, monthIndex) => {
        const monthDiv = document.createElement('div');
        monthDiv.classList.add('month');
        const monthHeader = document.createElement('h3');
        monthHeader.innerText = month;
        monthDiv.appendChild(monthHeader);

        const daysGrid = document.createElement('div');
        daysGrid.classList.add('days-grid');

        const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
        const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Adjust Sunday to be the last day

        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day-cell', 'empty');
            daysGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth[monthIndex]; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.innerText = day;
            dayCell.classList.toggle('exercised', exerciseDays[`${monthIndex + 1}-${day}`]);

            dayCell.addEventListener('click', () => {
                exerciseDays[`${monthIndex + 1}-${day}`] = !exerciseDays[`${monthIndex + 1}-${day}`];
                dayCell.classList.toggle('exercised');
                saveExerciseDays();
            });

            daysGrid.appendChild(dayCell);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    });
}

function saveExerciseDays() {
    localStorage.setItem('exerciseDays', JSON.stringify(exerciseDays));
}

document.addEventListener('DOMContentLoaded', renderCalendar);