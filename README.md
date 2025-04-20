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
    *   Track how relationships evolve based on story events.
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

## Technical Structure (Proposed)

*   **Data Model:** Core entities (Characters, Lore, Events, Relationships) will be primarily stored as structured JSON objects. This allows for flexibility as the story evolves.
    *   *Example Character Snippet:*
        ```json
        {
          "id": "char_001",
          "name": "Elara",
          "description": "...",
          "attributes": {
            "static": { "species": "Elf", "birthplace": "Silverwood" },
            "dynamic_history": [
              { "timestamp": "y100_d1", "state": { "location": "Silverwood", "mood": "Hopeful" } },
              { "timestamp": "y102_d50", "state": { "location": "Iron Citadel", "mood": "Wary" } }
            ]
          },
          "relationships": [
            { "target_char_id": "char_002", "type": "Ally", "history": [...] }
          ]
        }
        ```
    *   *Example Event Snippet:*
        ```json
        {
          "id": "evt_001",
          "timestamp": "y102_d49",
          "description": "First encounter with Kaelen at the Citadel gates.",
          "participants": ["char_001", "char_002"],
          "location_id": "loc_005",
          "effects": [
            { "target": "char_001", "state_change": { "mood": "Wary" } },
            { "target": "relationship_char001_char002", "change": "Initiated" }
          ]
        }
        ```

