// Central mapping constants for Activar_app API integration
export const ACTIVAR_SECTION_TO_GROUP = {
    moto: 1,
    cuatri: 3,
} as const

export const ACTIVAR_SECTION_TO_API_SECTION = {
    moto: 'moto',
    cuatri: 'quad',
} as const

export type ActivarSection = keyof typeof ACTIVAR_SECTION_TO_GROUP

// Helper functions
export function getGroupCode(section: string): number {
    const validSection = section as ActivarSection
    return ACTIVAR_SECTION_TO_GROUP[validSection] || ACTIVAR_SECTION_TO_GROUP.moto
}

export function getApiSection(section: string): string {
    const validSection = section as ActivarSection
    return ACTIVAR_SECTION_TO_API_SECTION[validSection] || ACTIVAR_SECTION_TO_API_SECTION.moto
}

export function isValidSection(section: string): section is ActivarSection {
    return section in ACTIVAR_SECTION_TO_GROUP
}