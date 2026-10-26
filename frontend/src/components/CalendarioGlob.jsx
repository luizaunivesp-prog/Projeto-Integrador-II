// Arquivo: frontend/src/components/CalendarioGlob.jsx
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';

export default function CalendarioGlob({ onVoltar }) {
  const eventosIniciais = [
    {
      id: '1',
      calendarId: 'cal1',
      title: 'Reunião de Pais e Mestres',
      category: 'time',
      start: '2026-04-05T10:00:00',
      end: '2026-04-05T12:00:00',
      backgroundColor: '#3b82f6', 
      color: '#ffffff'
    },
    {
      id: '2',
      calendarId: 'cal2',
      title: 'Capacitação Inclusiva (Equipe)',
      category: 'time',
      start: '2026-04-10T14:00:00',
      end: '2026-04-10T17:00:00',
      backgroundColor: '#10b981', 
      color: '#ffffff'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Calendário Global</h2>
          <p className="text-gray-600">Eventos e atividades do Ponto.Cosmópolis.Edu</p>
        </div>
        <button 
          onClick={onVoltar}
          className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition shadow-lg"
        >
          ⬅ Voltar ao Menu
        </button>
      </div>

      <div className="w-full max-w-6xl flex-grow bg-white rounded-2xl shadow-xl overflow-hidden p-4 border border-gray-200">
        <Calendar
          height="700px"
          view="month"
          useCreationPopup={true}
          useDetailPopup={true}
          events={eventosIniciais}
          calendars={[
            { id: 'cal1', name: 'Geral', backgroundColor: '#3b82f6' },
            { id: 'cal2', name: 'Pedagógico', backgroundColor: '#10b981' }
          ]}
        />
      </div>
    </div>
  );
}