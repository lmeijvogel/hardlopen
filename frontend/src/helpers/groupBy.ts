export function groupBy<T, U>(elements: T[], grouper: (element: T) => U): { group: U, elements: T[] }[] {
    const result: { group: U, elements: T[] }[] = [];

    for (const element of elements) {
        const groupValue = grouper(element);

        let group = result.find(r => r.group === groupValue);

        if (!group) {
            group = { group: groupValue, elements: [] };
            result.push(group);
        }

        group.elements.push(element);
    }

    return result;
}
