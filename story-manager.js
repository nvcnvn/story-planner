const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StoryManager {
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
        this.storyFile = path.join(dataDir, 'story.json');
        this.eventsDir = path.join(dataDir, 'events');
        this.initializeDirectories();
    }

    initializeDirectories() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.eventsDir)) {
            fs.mkdirSync(this.eventsDir, { recursive: true });
        }
    }

    // Load the main story data
    loadStory() {
        try {
            if (fs.existsSync(this.storyFile)) {
                const data = fs.readFileSync(this.storyFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading story:', error);
        }
        return this.createEmptyStory();
    }

    // Create a new empty story structure
    createEmptyStory() {
        return {
            story_title: "",
            metadata: {
                created: new Date().toISOString(),
                last_modified: new Date().toISOString(),
                author: "",
                genre: "",
                description: ""
            },
            characters: [],
            locations: [],
            lore: [],
            events: []
        };
    }

    // Save the main story data
    saveStory(storyData) {
        try {
            storyData.metadata.last_modified = new Date().toISOString();
            fs.writeFileSync(this.storyFile, JSON.stringify(storyData, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving story:', error);
            return false;
        }
    }

    // Character management
    addCharacter(characterData) {
        const story = this.loadStory();
        const character = {
            id: `char_${Date.now()}`,
            name: characterData.name || "",
            description: characterData.description || "",
            attributes: {
                static: characterData.static || {},
                dynamic_history: []
            },
            relationships: []
        };
        
        story.characters.push(character);
        this.saveStory(story);
        return character;
    }

    updateCharacter(characterId, updates) {
        const story = this.loadStory();
        const charIndex = story.characters.findIndex(c => c.id === characterId);
        if (charIndex !== -1) {
            story.characters[charIndex] = { ...story.characters[charIndex], ...updates };
            this.saveStory(story);
            return story.characters[charIndex];
        }
        return null;
    }

    deleteCharacter(characterId) {
        const story = this.loadStory();
        story.characters = story.characters.filter(c => c.id !== characterId);
        
        // Remove relationships involving this character
        story.characters.forEach(char => {
            char.relationships = char.relationships.filter(rel => rel.target_char_id !== characterId);
        });
        
        this.saveStory(story);
        return true;
    }

    // Location management
    addLocation(locationData) {
        const story = this.loadStory();
        const location = {
            id: `loc_${Date.now()}`,
            name: locationData.name || "",
            description: locationData.description || "",
            type: locationData.type || "",
            properties: locationData.properties || {}
        };
        
        story.locations.push(location);
        this.saveStory(story);
        return location;
    }

    updateLocation(locationId, updates) {
        const story = this.loadStory();
        const locIndex = story.locations.findIndex(l => l.id === locationId);
        if (locIndex !== -1) {
            story.locations[locIndex] = { ...story.locations[locIndex], ...updates };
            this.saveStory(story);
            return story.locations[locIndex];
        }
        return null;
    }

    deleteLocation(locationId) {
        const story = this.loadStory();
        story.locations = story.locations.filter(l => l.id !== locationId);
        this.saveStory(story);
        return true;
    }

    // Lore management
    addLoreEntry(loreData) {
        const story = this.loadStory();
        const lore = {
            id: `lore_${Date.now()}`,
            title: loreData.title || "",
            category: loreData.category || "",
            description: loreData.description || "",
            content: loreData.content || "",
            tags: loreData.tags || [],
            related_entries: loreData.related_entries || []
        };
        
        story.lore.push(lore);
        this.saveStory(story);
        return lore;
    }

    updateLoreEntry(loreId, updates) {
        const story = this.loadStory();
        const loreIndex = story.lore.findIndex(l => l.id === loreId);
        if (loreIndex !== -1) {
            story.lore[loreIndex] = { ...story.lore[loreIndex], ...updates };
            this.saveStory(story);
            return story.lore[loreIndex];
        }
        return null;
    }

    deleteLoreEntry(loreId) {
        const story = this.loadStory();
        story.lore = story.lore.filter(l => l.id !== loreId);
        this.saveStory(story);
        return true;
    }

    // Event management (separate files)
    saveEvent(eventData) {
        const eventId = eventData.id || `evt_${Date.now()}`;
        const eventFile = path.join(this.eventsDir, `${eventId}.json`);
        
        const event = {
            id: eventId,
            timestamp: eventData.timestamp || new Date().toISOString(),
            title: eventData.title || "",
            description: eventData.description || "",
            participants: eventData.participants || [],
            location_id: eventData.location_id || "",
            effects: eventData.effects || [],
            notes: eventData.notes || "",
            tags: eventData.tags || []
        };

        try {
            fs.writeFileSync(eventFile, JSON.stringify(event, null, 2));
            
            // Update the main story file with event reference
            const story = this.loadStory();
            const existingEventIndex = story.events.findIndex(e => e.id === eventId);
            const eventRef = {
                id: eventId,
                timestamp: event.timestamp,
                title: event.title,
                file: `${eventId}.json`
            };
            
            if (existingEventIndex !== -1) {
                story.events[existingEventIndex] = eventRef;
            } else {
                story.events.push(eventRef);
            }
            
            this.saveStory(story);
            return event;
        } catch (error) {
            console.error('Error saving event:', error);
            return null;
        }
    }

    loadEvent(eventId) {
        const eventFile = path.join(this.eventsDir, `${eventId}.json`);
        try {
            if (fs.existsSync(eventFile)) {
                const data = fs.readFileSync(eventFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading event:', error);
        }
        return null;
    }

    loadAllEvents() {
        const story = this.loadStory();
        const events = [];
        
        for (const eventRef of story.events) {
            const event = this.loadEvent(eventRef.id);
            if (event) {
                events.push(event);
            }
        }
        
        // Sort by timestamp
        return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    deleteEvent(eventId) {
        const eventFile = path.join(this.eventsDir, `${eventId}.json`);
        try {
            if (fs.existsSync(eventFile)) {
                fs.unlinkSync(eventFile);
            }
            
            // Remove from main story file
            const story = this.loadStory();
            story.events = story.events.filter(e => e.id !== eventId);
            this.saveStory(story);
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            return false;
        }
    }

    // Relationship management
    addRelationship(fromCharId, toCharId, relationshipData) {
        const story = this.loadStory();
        const fromChar = story.characters.find(c => c.id === fromCharId);
        
        if (!fromChar) return null;
        
        const relationship = {
            target_char_id: toCharId,
            type: relationshipData.type || "",
            dynamics: relationshipData.dynamics || {
                trust: 0,
                respect: 0,
                affection: 0,
                resentment: 0
            },
            history: []
        };
        
        // Remove existing relationship if it exists
        fromChar.relationships = fromChar.relationships.filter(r => r.target_char_id !== toCharId);
        fromChar.relationships.push(relationship);
        
        this.saveStory(story);
        return relationship;
    }

    // Calculate character state at a specific timestamp
    calculateCharacterStateAtTime(characterId, timestamp) {
        const story = this.loadStory();
        const character = story.characters.find(c => c.id === characterId);
        if (!character) return null;

        const events = this.loadAllEvents();
        const relevantEvents = events.filter(e => 
            new Date(e.timestamp) <= new Date(timestamp) &&
            (e.participants.includes(characterId) || 
             e.effects.some(effect => effect.target === characterId))
        );

        let state = { ...character.attributes.static };
        
        // Apply effects from events in chronological order
        relevantEvents.forEach(event => {
            event.effects.forEach(effect => {
                if (effect.target === characterId && effect.state_change) {
                    state = { ...state, ...effect.state_change };
                }
            });
        });

        return state;
    }

    // Calculate relationship dynamics at a specific timestamp
    calculateRelationshipStateAtTime(fromCharId, toCharId, timestamp) {
        const story = this.loadStory();
        const character = story.characters.find(c => c.id === fromCharId);
        if (!character) return null;

        const relationship = character.relationships.find(r => r.target_char_id === toCharId);
        if (!relationship) return null;

        const events = this.loadAllEvents();
        const relationshipKey = `relationship_${fromCharId}_${toCharId}`;
        
        let dynamics = { trust: 0, respect: 0, affection: 0, resentment: 0 };
        
        // Apply relationship changes from events
        events.forEach(event => {
            if (new Date(event.timestamp) <= new Date(timestamp)) {
                event.effects.forEach(effect => {
                    if (effect.target === relationshipKey && effect.change && effect.change.dynamics) {
                        Object.keys(effect.change.dynamics).forEach(key => {
                            dynamics[key] = (dynamics[key] || 0) + effect.change.dynamics[key];
                        });
                    }
                });
            }
        });

        return {
            ...relationship,
            dynamics,
            calculated_at: timestamp
        };
    }

    // Export full story data (for compatibility with existing viewer)
    exportFullStoryData() {
        const story = this.loadStory();
        const events = this.loadAllEvents();
        
        return {
            ...story,
            events: events
        };
    }

    // Import from existing story format
    importFromLegacyFormat(legacyData) {
        const story = {
            story_title: legacyData.story_title || "",
            metadata: {
                created: new Date().toISOString(),
                last_modified: new Date().toISOString(),
                author: "",
                genre: "",
                description: ""
            },
            characters: legacyData.characters || [],
            locations: legacyData.locations || [],
            lore: [],
            events: []
        };

        this.saveStory(story);

        // Save events as separate files
        if (legacyData.events) {
            legacyData.events.forEach(event => {
                this.saveEvent(event);
            });
        }

        return story;
    }
}

module.exports = StoryManager;
