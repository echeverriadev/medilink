import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AppointmentModal from '../components/AppointmentModal';
import { getDoctorAppointments, Appointment } from '../services/appointmentService';
import { useAuth } from '../../auth/context/AuthContext';

const Appointments: React.FC = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const fetchAppointments = async () => {
        if (!user) return;
        try {
            const data = await getDoctorAppointments(user.uid);
            console.log("Fetched appointments for UI:", data);

            // Map to FullCalendar expected format explicitly
            const fcEvents = data.map(apt => ({
                id: apt.id,
                title: apt.title,
                start: apt.start,
                end: apt.end,
                extendedProps: { ...apt }
            }));

            setEvents(fcEvents);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const handleDateSelect = (selectInfo: any) => {
        setSelectedSlot(selectInfo.startStr);
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo: any) => {
        if (window.confirm(`Are you sure you want to delete the appointment '${clickInfo.event.title}'?`)) {
            // Logic for deletion or viewing details could go here
            console.log("Event clicked:", clickInfo.event.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Medical Agenda</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your consultations and patient appointments</p>
                </div>
                <button
                    onClick={() => { setSelectedSlot(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Quick Add
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <style>{`
                    .fc .fc-toolbar-title { font-weight: 700; font-size: 1.25rem; color: #1e293b; }
                    .fc .fc-button-primary { background-color: #2563eb; border-color: #2563eb; font-weight: 600; text-transform: capitalize; }
                    .fc .fc-button-primary:hover { background-color: #1d4ed8; border-color: #1d4ed8; }
                    .fc .fc-button-primary:disabled { background-color: #93c5fd; border-color: #93c5fd; }
                    .fc .fc-daygrid-day-number { font-weight: 600; color: #64748b; padding: 8px; }
                    .fc .fc-col-header-cell-cushion { font-weight: 700; color: #1e293b; padding: 12px 0; }
                    .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
                    .fc .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 0.85rem; border: none; shadow: 0 1px 2px rgba(0,0,0,0.05); }
                `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={events}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    slotMinTime="07:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    height="auto"
                />
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAppointmentCreated={fetchAppointments}
                initialStart={selectedSlot}
            />
        </div>
    );
};

export default Appointments;
