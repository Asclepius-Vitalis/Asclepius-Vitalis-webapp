// Format date to display format
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// Format time to 12-hour format
export function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get today's date in YYYY-MM-DD format
export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// Generate WhatsApp URL
export function generateWhatsAppUrl(phone: string, message: string): string {
    // Remove any non-numeric characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Add country code if not present (assuming India)
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodedMessage}`;
}

// Generate default WhatsApp templates
export function getDefaultWhatsAppTemplates() {
    return {
        followUpReminder: 'Hi {patientName}, this is a reminder for your follow-up appointment with Dr. {doctorName} on {date}. Please confirm your availability.',
        appointmentReminder: 'Hi {patientName}, you have an appointment with Dr. {doctorName} tomorrow at {time}. Please arrive 10 minutes early.',
        labTestReminder: 'Hi {patientName}, please remember to get your lab tests done as prescribed by Dr. {doctorName}. Tests: {testNames}.',
    };
}

// Replace template placeholders
export function fillTemplate(template: string, values: Record<string, string>): string {
    return Object.entries(values).reduce(
        (result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), value),
        template
    );
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Class name helper
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
