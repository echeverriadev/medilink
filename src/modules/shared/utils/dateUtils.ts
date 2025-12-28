/**
 * Calculates age from a birth date string (YYYY-MM-DD or similar ISO format)
 * @param birthDate string
 * @returns number
 */
export const calculateAge = (birthDate: string | undefined): number | string => {
    if (!birthDate) return 'N/A';

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};
