import { Appointment } from './appointmentService';
import { getGoogleAccessToken } from './googleAuthService';

export const pushEventToGoogleCalendar = async (appointment: Appointment) => {
    const token = getGoogleAccessToken();
    if (!token) {
        console.warn('No Google access token found, skipping sync');
        return null;
    }

    // Map internal types to Google Calendar colorId (1-11)
    // 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 7: Peacock, 8: Graphite, 9: Blueberry, 10: Basil, 11: Tomato
    const googleColors: Record<string, string> = {
        consulta: '7',   // Peacock (Blue)
        cirugia: '11',  // Tomato (Red)
        vacuna: '10',   // Basil (Green)
        exonerada: '5'  // Banana (Yellow)
    };

    const event = {
        'summary': `${appointment.title} (${appointment.type.toUpperCase()})`,
        'description': `${appointment.description || ''}\n\nType: ${appointment.type}`,
        'colorId': googleColors[appointment.type] || '1',
        'start': {
            'dateTime': appointment.start,
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
            'dateTime': appointment.end,
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    };

    try {
        const url = appointment.googleEventId
            ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.googleEventId}`
            : 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

        const method = appointment.googleEventId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Failed to ${method} event in Google Calendar`);
        }

        const data = await response.json();
        console.log(`Event ${appointment.googleEventId ? 'updated' : 'pushed'} to Google Calendar successfully`);
        return data.id; // Return the Google Event ID
    } catch (error) {
        console.error('Error syncing with Google Calendar:', error);
        throw error;
    }
};

export const deleteEventFromGoogleCalendar = async (googleEventId: string) => {
    const token = getGoogleAccessToken();
    if (!token) return;

    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok && response.status !== 404) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to delete event from Google Calendar');
        }

        console.log('Event deleted from Google Calendar');
    } catch (error) {
        console.error('Error deleting event from Google Calendar:', error);
    }
};
