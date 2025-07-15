// Manual type definitions for German idiom filtering
// This will be replaced by auto-generated types once the build process is fixed

export interface GermanIdiomFilter {
    regions?: string[];
    difficulty?: DifficultyLevel;
    tags?: string[];
    hasLiteralTranslation?: boolean;
    hasTransliteration?: boolean;
}

export enum DifficultyLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export interface QueryIdiomsArgsWithGermanFilter {
    cursor?: string | null;
    filter?: string | null;
    locale?: string | null;
    limit?: number | null;
    germanFilter?: GermanIdiomFilter | null;
}