const form = document.getElementById('meetingForm');
const messageDiv = document.getElementById('message');
const filterSala1 = document.getElementById('filterSala1');
const filterSala2 = document.getElementById('filterSala2');

let calendar;

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'pt-br',
    headerToolbar: {
      left: 'prev today next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: fetchMeetings,
  });
  calendar.render();
});

// Adicionar reunião
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const roomId = parseInt(document.getElementById('roomId').value);

  if (!title || !start || !end) {
    showMessage('Por favor, preencha todos os campos.', 'danger');
    return;
  }

  if (new Date(start) >= new Date(end)) {
    showMessage('A data de início deve ser antes da data de fim.', 'danger');
    return;
  }

  axios.post('https://agendador-reuniao-nicopel.onrender.com/', {
    title,
    start,
    end,
    roomId
  })
  .then(response => {
    showMessage('Reunião adicionada com sucesso!', 'success');
    this.reset();
    calendar.refetchEvents();
  })
  .catch(error => {
    console.error(error);
    showMessage('Erro ao adicionar reunião.', 'danger');
  });
});

// Mensagem de feedback
function showMessage(message, type) {
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type} mt-3`;
  messageDiv.classList.remove('d-none');
  
  setTimeout(() => {
    messageDiv.classList.add('d-none');
  }, 5000);
}

// Carregar eventos (reuniões)
function fetchMeetings(info, successCallback, failureCallback) {
  axios.get('https://agendador-reuniao-nicopel.onrender.com/meetings')
    .then(response => {
      let meetings = response.data;

      // Filtra por sala
      meetings = meetings.filter(meeting => {
        if (meeting.roomId === 1 && filterSala1.checked) return true;
        if (meeting.roomId === 2 && filterSala2.checked) return true;
        return false;
      });

      const events = meetings.map(meeting => ({
        title: meeting.title,
        start: meeting.start,
        end: meeting.end,
        color: meeting.roomId === 1 ? '#28a745' : '#007bff'
      }));

      successCallback(events);
    })
    .catch(error => {
      console.error('Erro ao carregar reuniões:', error);
      failureCallback(error);
    });
}

// Atualiza o calendário ao mudar filtros
filterSala1.addEventListener('change', () => calendar.refetchEvents());
filterSala2.addEventListener('change', () => calendar.refetchEvents());
