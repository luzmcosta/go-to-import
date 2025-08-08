export function processData(data) {
    return data.map(item => ({ ...item, processed: true }));
}

export function formatDate(date) {
    return date.toISOString().split('T')[0];
}
