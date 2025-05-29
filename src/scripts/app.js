// Inicializa Supabase
// Quita el import y usa la versión global de la CDN
// import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://yebahcpnxsdhfbqgexon.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllYmFoY3BueHNkaGZicWdleG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MTM3NTEsImV4cCI6MjA2NDA4OTc1MX0.sdqlH7APvwQkWW9f5iRmxKEL9uMO46nTklVkQTiWNKc'; // <-- Pega aquí tu clave pública
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Usa un UUID válido para user_id
const user_id = '00000000-0000-0000-0000-000000000001';
const year = 2025;
const calendarContainer = document.getElementById('calendar');

// Guarda un día como ejercitado en Supabase
async function saveExerciseDaySupabase(year, month, day) {
    await supabase.from('exercise_days').upsert([
        { user_id, year, month, day, done: true }
    ]);
}

// Elimina un día ejercitado en Supabase
async function removeExerciseDaySupabase(year, month, day) {
    await supabase
        .from('exercise_days')
        .delete()
        .match({ user_id, year, month, day });
}

// Obtiene todos los días ejercitados del usuario
async function getExerciseDaysSupabase(year) {
    try {
        const { data, error } = await supabase
            .from('exercise_days')
            .select('*')
            .eq('user_id', user_id)
            .eq('year', year);
        if (error) {
            console.error("Error al obtener días de ejercicio de Supabase:", error);
            return {};
        }
        return Object.fromEntries(
            data.filter(r => r.done).map(r => [`${r.month}-${r.day}`, true])
        );
    } catch (e) {
        console.error("Error de conexión con Supabase:", e);
        return {};
    }
}

async function renderCalendar() {
    if (!calendarContainer) {
        console.error("No se encontró el contenedor #calendar");
        return;
    }
    calendarContainer.innerHTML = '';
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const daysInMonth = [31, (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let exerciseDays = {};
    try {
        exerciseDays = await getExerciseDaysSupabase(year);
    } catch (e) {
        exerciseDays = {};
    }

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
            const key = `${monthIndex + 1}-${day}`;
            if (exerciseDays[key]) {
                dayCell.classList.add('exercised');
            }
            if (year === todayYear && monthIndex === todayMonth && day === todayDate) {
                dayCell.id = 'today-cell';
            }
            const cellDate = new Date(year, monthIndex, day);
            if (
                cellDate < new Date(todayYear, todayMonth, todayDate) &&
                !exerciseDays[key]
            ) {
                dayCell.classList.add('missed');
            }

            dayCell.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (exerciseDays[key]) {
                    // Si ya está marcado, desmarcar y actualizar calendario
                    await removeExerciseDaySupabase(year, monthIndex + 1, day);
                    await renderCalendar();
                } else {
                    const fecha = new Date(year, monthIndex, day);
                    const diaSemana = fecha.getDay();
                    mostrarModalRutina(diaSemana, monthIndex + 1, day);
                }
            });

            daysGrid.appendChild(dayCell);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    });

    setTimeout(() => {
        const todayElem = document.getElementById('today-cell');
        if (todayElem) {
            todayElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 0);
}

async function mostrarModalRutina(diaSemana, mes, dia) {
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
    document.getElementById('completar-btn').onclick = async () => {
        await saveExerciseDaySupabase(year, mes, dia);
        modal.remove();
        renderCalendar();
    };
}

document.addEventListener('DOMContentLoaded', renderCalendar);