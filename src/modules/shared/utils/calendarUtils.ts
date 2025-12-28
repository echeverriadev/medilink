export const generateGoogleCalendarLink = (title: string, description: string, start: string, end: string) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const s = formatDate(start);
    const e = formatDate(end);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${s}/${e}`;
};

export const generateOutlookCalendarLink = (title: string, description: string, start: string, end: string) => {
    const s = new Date(start).toISOString();
    const e = new Date(end).toISOString();
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}&startdt=${s}&enddt=${e}`;
};

export const generateICSFileContent = (title: string, description: string, start: string, end: string) => {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const s = formatDate(start);
    const e = formatDate(end);
    const now = formatDate(new Date().toISOString());

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PROID:-//MediLink//NONSGML v1.0//EN',
        'BEGIN:VEVENT',
        `DTSTAMP:${now}`,
        `DTSTART:${s}`,
        `DTEND:${e}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
};

export const downloadICSFile = (title: string, description: string, start: string, end: string) => {
    const content = generateICSFileContent(title, description, start, end);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'appointment.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
