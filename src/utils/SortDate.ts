export default function sortDateDesc<T extends { createdAt?: string | Date }>(
    data: T[]
): T[] {
    if (!Array.isArray(data) || data.length < 2) return data;

    return [...data].sort((a, b) => {
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
    });
}
