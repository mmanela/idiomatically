# German Idiom Filtering Documentation

## Overview
Enhanced GraphQL endpoint for filtering German idioms with advanced parameters.

## New Query Parameters

The existing `idioms` query now supports an additional `germanFilter` parameter when querying German idioms (locale: "de").

### GraphQL Schema Addition

```graphql
type Query {
  idioms(
    cursor: String, 
    filter: String, 
    locale: String, 
    limit: Int, 
    germanFilter: GermanIdiomFilter
  ): IdiomConnection!
}

input GermanIdiomFilter {
  # Filter by specific German regions
  regions: [String!]
  
  # Filter by difficulty level for German learners
  difficulty: DifficultyLevel
  
  # Filter by specific German-related tags
  tags: [String!]
  
  # Filter idioms that have literal translations
  hasLiteralTranslation: Boolean
  
  # Filter idioms that have phonetic transliterations
  hasTransliteration: Boolean
  
  # Filter by whether the idiom is commonly used in modern German
  isModernUsage: Boolean
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

## Usage Examples

### Basic German Idiom Query
```graphql
query {
  idioms(locale: "de", limit: 10) {
    edges {
      node {
        id
        title
        description
        tags
        literalTranslation
      }
    }
  }
}
```

### Filter by German Regions
```graphql
query {
  idioms(
    locale: "de", 
    germanFilter: { 
      regions: ["bavarian", "austrian"] 
    }
  ) {
    edges {
      node {
        id
        title
        description
        language {
          languageName
        }
      }
    }
  }
}
```

### Filter by Difficulty Level
```graphql
query {
  idioms(
    locale: "de", 
    germanFilter: { 
      difficulty: BEGINNER 
    }
  ) {
    edges {
      node {
        id
        title
        description
        tags
      }
    }
  }
}
```

### Filter for Modern Usage with Translations
```graphql
query {
  idioms(
    locale: "de", 
    germanFilter: { 
      isModernUsage: true,
      hasLiteralTranslation: true
    }
  ) {
    edges {
      node {
        id
        title
        description
        literalTranslation
        tags
      }
    }
  }
}
```

### Advanced Filtering
```graphql
query {
  idioms(
    locale: "de", 
    germanFilter: { 
      regions: ["swiss"],
      difficulty: INTERMEDIATE,
      tags: ["common", "business"],
      hasLiteralTranslation: true,
      isModernUsage: true
    }
  ) {
    edges {
      node {
        id
        title
        description
        literalTranslation
        tags
        language {
          countries {
            countryKey
            countryName
          }
        }
      }
    }
  }
}
```

## Supported Region Values
- `"northern"` - Northern Germany (DE)
- `"southern"` - Southern Germany (DE)  
- `"bavarian"` - Bavaria region (DE)
- `"austrian"` - Austria (AT)
- `"swiss"` - Switzerland (CH)

## Difficulty Level Mapping
- `BEGINNER`: Idioms tagged with "beginner", "easy", "simple", "basic"
- `INTERMEDIATE`: Idioms tagged with "intermediate", "medium", "common"
- `ADVANCED`: Idioms tagged with "advanced", "difficult", "complex", "archaic", "literary"

## Modern Usage Classification
- `isModernUsage: true`: Excludes idioms tagged as "archaic", "obsolete", "historical", "old-fashioned"
- `isModernUsage: false`: Includes only idioms specifically marked with archaic/historical tags