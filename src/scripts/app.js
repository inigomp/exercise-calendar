import { rutinasPorDia } from './rutinas.js';

const year = 2025;
const calendarContainer = document.getElementById('calendar');

function getExerciseDays() {
    return JSON.parse(localStorage.getItem('exerciseDays')) || {};
}

function renderCalendar() {
    calendarContainer.innerHTML = '';
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    const exerciseDays = getExerciseDays();
    console.log('Días ejercitados cargados:', exerciseDays);

    // Obtén la fecha de hoy
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

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
            // Aplica la clase si el día está marcado
            if (exerciseDays[`${monthIndex + 1}-${day}`]) {
                dayCell.classList.add('exercised');
            }
            // Marca el día de hoy con un id especial si corresponde al año del calendario
            if (year === todayYear && monthIndex === todayMonth && day === todayDate) {
                dayCell.id = 'today-cell';
            }

            dayCell.addEventListener('click', () => {
                const fecha = new Date(year, monthIndex, day);
                const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ...
                mostrarModalRutina(diaSemana, monthIndex + 1, day);
            });

            daysGrid.appendChild(dayCell);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    });

    // Desplaza la vista al día de hoy si existe en el calendario
    setTimeout(() => {
        const todayElem = document.getElementById('today-cell');
        if (todayElem) {
            todayElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 0);
}

function mostrarModalRutina(diaSemana, mes, dia) {
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
        // Recarga los días ejercitados antes de modificar
        const exerciseDays = getExerciseDays();
        exerciseDays[`${mes}-${dia}`] = true;
        saveExerciseDays(exerciseDays);
        modal.remove();
        renderCalendar();
    };
}

function saveExerciseDays(daysObj) {
    localStorage.setItem('exerciseDays', JSON.stringify(daysObj));
}

document.addEventListener('DOMContentLoaded', renderCalendar);