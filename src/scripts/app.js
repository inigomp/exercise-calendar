import { rutinasPorDia } from './rutinas.js';

const year = 2025;
const calendarContainer = document.getElementById('calendar');
const exerciseDays = JSON.parse(localStorage.getItem('exerciseDays')) || {};

function renderCalendar() {
    calendarContainer.innerHTML = '';
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
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
        const adjustedFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

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
                const fecha = new Date(year, monthIndex, day);
                const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ...
                mostrarModalRutina(diaSemana, monthIndex + 1, day, dayCell);
            });

            daysGrid.appendChild(dayCell);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    });
}

function mostrarModalRutina(diaSemana, mes, dia, dayCell) {
    const rutina = rutinasPorDia[diaSemana];
    if (!rutina) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${rutina.titulo}</h2>
        ${rutina.contenido}
        <button id="completar-btn">Marcar como completado</button>
        <button id="cerrar-btn">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cerrar-btn').onclick = () => modal.remove();
    document.getElementById('completar-btn').onclick = () => {
        exerciseDays[`${mes}-${dia}`] = true;
        saveExerciseDays();
        dayCell.classList.add('exercised');
        modal.remove();
    };
}

function saveExerciseDays() {
    localStorage.setItem('exerciseDays', JSON.stringify(exerciseDays));
}

document.addEventListener('DOMContentLoaded', renderCalendar);