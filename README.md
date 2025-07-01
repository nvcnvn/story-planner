# Story Planner

A web-based tool designed to help authors meticulously plan and track the intricate details of their novels and stories.

## Vision

Writing a complex story with deep lore, evolving characters, and intricate plotlines can be challenging to manage. Story Planner aims to be the author's digital companion, providing a structured way to organize worldbuilding elements, track character development and relationships, map out events, and visualize the narrative timeline. No more scattered notes or continuity errors – keep your entire story world at your fingertips.

## Core Features

*   **Lore Management:** Create and organize entries for locations, historical events, magical systems, factions, items, and any other worldbuilding element. Link related lore entries together.
*   **Character Tracking:**
    *   Define characters with core attributes (name, description, motivations).
    *   Track dynamic character states (e.g., health, location, emotional state, inventory) that change over time.
    *   Record character backstories and development arcs.
*   **Relationship Mapping:**
    *   Define different types of relationships between characters (e.g., family, friend, rival, romantic).
    *   Track relationship dynamics with numerical values across multiple dimensions (trust, affection, respect, resentment, etc.).
    *   Record the history of relationship changes over time, including timestamps and labels for significant events.
    *   Watch relationships evolve organically as story events affect these emotional dimensions.
    *   Visualize relationship networks dynamically, showing how they change over time and highlighting key moments.
*   **Event Chronology:**
    *   Log key plot points and scenes as events with specific timestamps or chronological order.
    *   Link events to involved characters, locations, and lore elements.
    *   Describe the impact of events on character states and relationships.
*   **Interactive Timeline:**
    *   Visualize all recorded events on a dynamic timeline.
    *   Filter the timeline by character, location, or event type.
    *   Gain a clear overview of the narrative structure and pacing.
*   **Point-in-Time State Query:**
    *   Select any point on the timeline.
    *   Instantly view the calculated state of all characters (attributes, location, relationships) at that specific moment in the story.

## Data Structure Overview

The story data is stored as a structured JSON file with the following main components:

### Top-Level Structure
```json
{
  "story_title": "String - The title of your story",
  "characters": [ /* Array of character objects */ ],
  "locations": [ /* Array of location objects */ ],
  "events": [ /* Array of event objects */ ]
}
```

### Characters
Each character contains:
- **Basic Info**: `id`, `name`, `description`
- **Attributes**: 
  - `static`: Unchanging properties (species, class, background)
  - `dynamic_history`: Array of state changes over time
- **Relationships**: Array of relationships with other characters

```json
{
  "id": "char_001",
  "name": "Valerius Stonehand",
  "description": "Human Fighter, stoic and protective...",
  "attributes": {
    "static": { "species": "Human", "class": "Fighter", "background": "City Guard" },
    "dynamic_history": [
      {
        "event_id": "evt_001",
        "state": { "mood": "Focused", "location": "loc_001", "health": "Full" }
      }
    ]
  },
  "relationships": [
    {
      "target_char_id": "char_002",
      "dynamics": { "trust": 50, "respect": 55, "affection": 10, "resentment": -20 },
      "history": [
        {
          "event_id": "evt_001",
          "dynamics": { "trust": 30, "respect": 40, "affection": 0, "resentment": 0 },
          "label": "Initial acquaintance"
        }
      ]
    }
  ]
}
```

### Events
Events drive the narrative and dynamically modify character states and relationships through their effects:

```json
{
  "id": "evt_001",
  "timestamp": "2025-01-01",
  "description": "The group receives their assignment...",
  "participants": ["char_001", "char_002", "char_003"],
  "location_id": "loc_001",
  "effects": [
    {
      "target": "char_001",
      "state_change": { "mood": "Focused", "location": "loc_001", "health": "Full" }
    },
    {
      "target": "relationship_char_001_char_002",
      "change": {
        "dynamics": { "trust": 30, "respect": 40, "affection": 0, "resentment": 0 },
        "label": "Initial acquaintance"
      }
    }
  ]
}
```

**Effect Types:**
- **Character State Changes**: Update mood, location, health, or any custom attributes
- **Relationship Changes**: Modify trust, respect, affection, resentment, or other relationship dimensions
- **Incremental Updates**: Effects can specify absolute values (initial states) or relative changes (+/-)

### Locations
Simple objects with unique identifiers:

```json
{
  "id": "loc_001",
  "name": "Capital City - Ministry of Exploration"
}
```

### Key Design Principles

1. **Event-Driven Changes**: All character state and relationship changes are tied to specific events
2. **Dynamic Construction**: Character states and relationship values are dynamically calculated by applying event effects in chronological order
3. **Historical Tracking**: Both character states and relationships maintain complete history, allowing point-in-time queries
4. **Bidirectional Relationships**: Each character maintains their perspective on relationships
5. **Referential Integrity**: Characters, events, and locations reference each other by ID
6. **Incremental Updates**: Relationship dynamics and character states are updated incrementally through event effects rather than being stored as absolute values

### Dynamic State Calculation

The system reconstructs character states and relationships dynamically by:

1. **Starting from Base Values**: Characters begin with initial static attributes
2. **Applying Events Chronologically**: Each event's effects modify character states and relationship dynamics
3. **Incremental Changes**: Event effects specify deltas (e.g., `trust: +15`, `resentment: -5`) that are applied to current values
4. **Point-in-Time Queries**: Any moment in the timeline can be reconstructed by applying all events up to that timestamp
5. **Consistency Validation**: The verification script ensures that stored history entries match the calculated results from event effects

This approach ensures data consistency and allows for complex timeline analysis while maintaining a complete audit trail of all changes.

## Getting Started

### Explore the Demo
The project includes a complete demo story (`demo_story.json`) featuring a D&D-style adventure with 5 characters exploring a shifting dungeon. This demonstrates the full data structure and relationship dynamics in action.

### Data Validation

The project includes a comprehensive verification script (`verify_story_data.js`) that checks:

- **Structure Integrity**: Validates required fields and data types
- **Reference Consistency**: Ensures all character, event, and location references are valid
- **Historical Accuracy**: Verifies that dynamic history entries match their corresponding event effects
- **Chronological Order**: Confirms events and history entries are in correct temporal sequence
- **Relationship Symmetry**: Identifies missing reciprocal relationships

Run validation with:
```bash
node verify_story_data.js          # Basic validation
node verify_story_data.js --verbose # Detailed verification report
```

### Running the Application
```bash
npm install
npm start
```

The web interface will be available at `http://localhost:3000` where you can visualize the timeline and explore character relationships interactively.

