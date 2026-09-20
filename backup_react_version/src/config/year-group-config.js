/**
 * year-group-config.js
 * Single source of truth for year + group mappings.
 */
export const YEAR_GROUP_MAP = {
    'year-1': {
        label: '1st Year',
        displayLabel: 'First Year',
        groups: [
            { id: 'group-a', label: 'Group A' },
            { id: 'group-b', label: 'Group B' }
        ]
    },
    'year-2': {
        label: '2nd Year',
        displayLabel: 'Second Year',
        groups: [
            { id: 'cse', label: 'CSE - Computer Science & Engineering' },
            { id: 'it',  label: 'IT - Information Technology' },
            { id: 'ds',  label: 'DS - Data Science' },
            { id: 'ecs', label: 'ECS - Electronics & Computer Science' }
        ]
    },
    'year-3': {
        label: '3rd Year',
        displayLabel: 'Third Year',
        groups: [
            { id: 'cse', label: 'CSE - Computer Science & Engineering' },
            { id: 'it',  label: 'IT - Information Technology' },
            { id: 'ds',  label: 'DS - Data Science' },
            { id: 'ecs', label: 'ECS - Electronics & Computer Science' }
        ]
    },
    'year-4': {
        label: '4th Year',
        displayLabel: 'Fourth Year',
        groups: [
            { id: 'cse', label: 'CSE - Computer Science & Engineering' },
            { id: 'it',  label: 'IT - Information Technology' },
            { id: 'ds',  label: 'DS - Data Science' },
            { id: 'ecs', label: 'ECS - Electronics & Computer Science' }
        ]
    }
};

export function getAllYears() {
    return Object.entries(YEAR_GROUP_MAP).map(([yearId, data]) => ({
        yearId,
        ...data
    }));
}

export function getGroupsForYear(yearId) {
    return YEAR_GROUP_MAP[yearId]?.groups ?? [];
}

export function getYearLabel(yearId) {
    return YEAR_GROUP_MAP[yearId]?.label ?? yearId;
}

export function getGroupLabel(yearId, groupId) {
    const groups = getGroupsForYear(yearId);
    return groups.find(g => g.id === groupId)?.label ?? groupId;
}

export function isValidYearGroup(yearId, groupId) {
    const groups = getGroupsForYear(yearId);
    return groups.some(g => g.id === groupId);
}
