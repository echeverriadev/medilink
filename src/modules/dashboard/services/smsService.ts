/**
 * SMS Service (Mock/Infrastructure)
 * 
 * To implement real SMS, you would integrate a provider like Twilio, Vonage, or AWS SNS here.
 */

interface SMSParams {
    to: string;
    message: string;
}

export const sendSMS = async ({ to, message }: SMSParams) => {
    // This is where you would call your SMS API
    console.log(`[SMS MOCK] Sending message to ${to}: ${message}`);

    // In a real implementation:
    // const response = await fetch('https://api.twilio.com/v1/messages', { ... });
    // return response.ok;

    return true;
};

export const sendAppointmentReminderSMS = async (patientPhone: string, patientName: string, date: string, time: string, confirmLink: string) => {
    const message = `Hola ${patientName}, recordatorio de tu cita médica el ${date} a las ${time}. Confirma aquí: ${confirmLink}`;
    return sendSMS({ to: patientPhone, message });
};
