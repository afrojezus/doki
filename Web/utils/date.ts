const months = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec."
];

export function ParseUnixTime(ux: number) {
    return new Date(ux * 1e3);
}

export function formatDate(dt: Date) {
    return `${dt.getDate()}. ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}