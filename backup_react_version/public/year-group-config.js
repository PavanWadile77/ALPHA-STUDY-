/**
 * year-group-config.js
 * Single source of truth for year → group mappings.
 * Used by admin-upload.html, admin-materials.html, and user-facing pages.
 * Use stable IDs (not display labels) for Firestore field values.
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
            { id: 'cse', label: 'CSE — Computer Science & Engineering' },
            { id: 'it',  label: 'IT — Information Technology' },
            { id: 'ds',  label: 'DS — Data Science' },
            { id: 'ecs', label: 'ECS — Electronics & Computer Science' }
        ]
    },
    'year-3': {
        label: '3rd Year',
        displayLabel: 'Third Year',
        groups: [
            { id: 'cse', label: 'CSE — Computer Science & Engineering' },
            { id: 'it',  label: 'IT — Information Technology' },
            { id: 'ds',  label: 'DS — Data Science' },
            { id: 'ecs', label: 'ECS — Electronics & Computer Science' }
        ]
    },
    'year-4': {
        label: '4th Year',
        displayLabel: 'Fourth Year',
        groups: [
            { id: 'cse', label: 'CSE — Computer Science & Engineering' },
            { id: 'it',  label: 'IT — Information Technology' },
            { id: 'ds',  label: 'DS — Data Science' },
            { id: 'ecs', label: 'ECS — Electronics & Computer Science' }
        ]
    }
};

/**
 * Returns all years as an array of { yearId, label, displayLabel, groups } objects.
 */
export function getAllYears() {
    return Object.entries(YEAR_GROUP_MAP).map(([yearId, data]) => ({
        yearId,
        ...data
    }));
}

/**
 * Returns groups for a given yearId, or empty array if yearId is unknown.
 * @param {string} yearId  e.g. 'year-1'
 */
export function getGroupsForYear(yearId) {
    return YEAR_GROUP_MAP[yearId]?.groups ?? [];
}

/**
 * Returns the display label for a yearId.
 * @param {string} yearId
 */
export function getYearLabel(yearId) {
    return YEAR_GROUP_MAP[yearId]?.label ?? yearId;
}

/**
 * Returns the display label for a groupId within a yearId.
 * @param {string} yearId
 * @param {string} groupId
 */
export function getGroupLabel(yearId, groupId) {
    const groups = getGroupsForYear(yearId);
    return groups.find(g => g.id === groupId)?.label ?? groupId;
}

/**
 * Validates that yearId and groupId are a known combination.
 * @param {string} yearId
 * @param {string} groupId
 * @returns {boolean}
 */
export function isValidYearGroup(yearId, groupId) {
    const groups = getGroupsForYear(yearId);
    return groups.some(g => g.id === groupId);
}
