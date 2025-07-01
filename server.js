const express = require('express');
const fs = require('fs');
const path = require('path');
const StoryManager = require('./story-manager');

const app = express();
const port = 3000;
const storyManager = new StoryManager();

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to format timestamps for display
function formatTimestamp(timestamp) {
    if (timestamp.match(/^\d{4}-\d{2}-\d{2}/)) {
        return new Date(timestamp).toLocaleDateString();
    }
    return timestamp;
}

// Routes

// Home page - Story overview
app.get('/', (req, res) => {
    const story = storyManager.loadStory();
    const events = storyManager.loadAllEvents();
    
    res.render('index', {
        title: story.story_title || 'Untitled Story',
        story: story,
        events: events.slice(0, 5), // Show latest 5 events
        totalEvents: events.length,
        totalCharacters: story.characters.length,
        totalLocations: story.locations.length,
        totalLore: story.lore.length
    });
});

// Story settings
app.get('/story/settings', (req, res) => {
    const story = storyManager.loadStory();
    res.render('story-settings', { story });
});

app.post('/story/settings', (req, res) => {
    const story = storyManager.loadStory();
    story.story_title = req.body.title;
    story.metadata.author = req.body.author;
    story.metadata.genre = req.body.genre;
    story.metadata.description = req.body.description;
    
    storyManager.saveStory(story);
    res.redirect('/');
});

// Characters
app.get('/characters', (req, res) => {
    const story = storyManager.loadStory();
    res.render('characters', { 
        characters: story.characters,
        locations: story.locations
    });
});

app.get('/characters/new', (req, res) => {
    res.render('character-form', { 
        character: null,
        isEdit: false
    });
});

app.get('/characters/:id/edit', (req, res) => {
    const story = storyManager.loadStory();
    const character = story.characters.find(c => c.id === req.params.id);
    
    if (!character) {
        return res.status(404).send('Character not found');
    }
    
    res.render('character-form', { 
        character,
        isEdit: true
    });
});

app.post('/characters', (req, res) => {
    const characterData = {
        name: req.body.name,
        description: req.body.description,
        static: {
            species: req.body.species,
            class: req.body.class,
            background: req.body.background,
            age: req.body.age,
            gender: req.body.gender
        }
    };
    
    storyManager.addCharacter(characterData);
    res.redirect('/characters');
});

app.post('/characters/:id', (req, res) => {
    const updates = {
        name: req.body.name,
        description: req.body.description,
        attributes: {
            static: {
                species: req.body.species,
                class: req.body.class,
                background: req.body.background,
                age: req.body.age,
                gender: req.body.gender
            }
        }
    };
    
    storyManager.updateCharacter(req.params.id, updates);
    res.redirect('/characters');
});

app.post('/characters/:id/delete', (req, res) => {
    storyManager.deleteCharacter(req.params.id);
    res.redirect('/characters');
});

// Locations
app.get('/locations', (req, res) => {
    const story = storyManager.loadStory();
    res.render('locations', { locations: story.locations });
});

app.get('/locations/new', (req, res) => {
    res.render('location-form', { 
        location: null,
        isEdit: false
    });
});

app.get('/locations/:id/edit', (req, res) => {
    const story = storyManager.loadStory();
    const location = story.locations.find(l => l.id === req.params.id);
    
    if (!location) {
        return res.status(404).send('Location not found');
    }
    
    res.render('location-form', { 
        location,
        isEdit: true
    });
});

app.post('/locations', (req, res) => {
    const locationData = {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        properties: {
            climate: req.body.climate,
            terrain: req.body.terrain,
            population: req.body.population
        }
    };
    
    storyManager.addLocation(locationData);
    res.redirect('/locations');
});

app.post('/locations/:id', (req, res) => {
    const updates = {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        properties: {
            climate: req.body.climate,
            terrain: req.body.terrain,
            population: req.body.population
        }
    };
    
    storyManager.updateLocation(req.params.id, updates);
    res.redirect('/locations');
});

app.post('/locations/:id/delete', (req, res) => {
    storyManager.deleteLocation(req.params.id);
    res.redirect('/locations');
});

// Lore
app.get('/lore', (req, res) => {
    const story = storyManager.loadStory();
    res.render('lore', { lore: story.lore });
});

app.get('/lore/new', (req, res) => {
    res.render('lore-form', { 
        loreEntry: null,
        isEdit: false
    });
});

app.get('/lore/:id/edit', (req, res) => {
    const story = storyManager.loadStory();
    const loreEntry = story.lore.find(l => l.id === req.params.id);
    
    if (!loreEntry) {
        return res.status(404).send('Lore entry not found');
    }
    
    res.render('lore-form', { 
        loreEntry,
        isEdit: true
    });
});

app.post('/lore', (req, res) => {
    const loreData = {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        content: req.body.content,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    
    storyManager.addLoreEntry(loreData);
    res.redirect('/lore');
});

app.post('/lore/:id', (req, res) => {
    const updates = {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        content: req.body.content,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    
    storyManager.updateLoreEntry(req.params.id, updates);
    res.redirect('/lore');
});

app.post('/lore/:id/delete', (req, res) => {
    storyManager.deleteLoreEntry(req.params.id);
    res.redirect('/lore');
});

// Events
app.get('/events', (req, res) => {
    const events = storyManager.loadAllEvents();
    const story = storyManager.loadStory();
    
    res.render('events', { 
        events,
        characters: story.characters,
        locations: story.locations,
        formatTimestamp
    });
});

app.get('/events/new', (req, res) => {
    const story = storyManager.loadStory();
    res.render('event-form', { 
        event: null,
        isEdit: false,
        characters: story.characters,
        locations: story.locations
    });
});

app.get('/events/:id/edit', (req, res) => {
    const event = storyManager.loadEvent(req.params.id);
    const story = storyManager.loadStory();
    
    if (!event) {
        return res.status(404).send('Event not found');
    }
    
    res.render('event-form', { 
        event,
        isEdit: true,
        characters: story.characters,
        locations: story.locations
    });
});

app.post('/events', (req, res) => {
    const eventData = {
        timestamp: req.body.timestamp,
        title: req.body.title,
        description: req.body.description,
        participants: Array.isArray(req.body.participants) ? req.body.participants : [req.body.participants].filter(Boolean),
        location_id: req.body.location_id,
        effects: [], // Will be added separately
        notes: req.body.notes,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    
    const event = storyManager.saveEvent(eventData);
    res.redirect(`/events/${event.id}/effects`);
});

app.post('/events/:id', (req, res) => {
    const existingEvent = storyManager.loadEvent(req.params.id);
    if (!existingEvent) {
        return res.status(404).send('Event not found');
    }
    
    const eventData = {
        ...existingEvent,
        timestamp: req.body.timestamp,
        title: req.body.title,
        description: req.body.description,
        participants: Array.isArray(req.body.participants) ? req.body.participants : [req.body.participants].filter(Boolean),
        location_id: req.body.location_id,
        notes: req.body.notes,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };
    
    storyManager.saveEvent(eventData);
    res.redirect('/events');
});

// Event effects management
app.get('/events/:id/effects', (req, res) => {
    const event = storyManager.loadEvent(req.params.id);
    const story = storyManager.loadStory();
    
    if (!event) {
        return res.status(404).send('Event not found');
    }
    
    res.render('event-effects', { 
        event,
        characters: story.characters,
        locations: story.locations
    });
});

app.post('/events/:id/effects', (req, res) => {
    const event = storyManager.loadEvent(req.params.id);
    if (!event) {
        return res.status(404).send('Event not found');
    }
    
    // Parse effects from form data
    const effects = [];
    
    // Character state effects
    if (req.body.character_effects) {
        req.body.character_effects.forEach((effect, index) => {
            if (effect.character && effect.property && effect.value) {
                effects.push({
                    target: effect.character,
                    state_change: {
                        [effect.property]: effect.value
                    }
                });
            }
        });
    }
    
    // Relationship effects
    if (req.body.relationship_effects) {
        req.body.relationship_effects.forEach((effect, index) => {
            if (effect.from_char && effect.to_char) {
                const dynamics = {};
                ['trust', 'respect', 'affection', 'resentment'].forEach(dim => {
                    if (effect[dim]) {
                        dynamics[dim] = parseInt(effect[dim]);
                    }
                });
                
                if (Object.keys(dynamics).length > 0) {
                    effects.push({
                        target: `relationship_${effect.from_char}_${effect.to_char}`,
                        change: {
                            dynamics,
                            label: effect.label || ""
                        }
                    });
                }
            }
        });
    }
    
    event.effects = effects;
    storyManager.saveEvent(event);
    
    res.redirect('/events');
});

app.post('/events/:id/delete', (req, res) => {
    storyManager.deleteEvent(req.params.id);
    res.redirect('/events');
});

// Relationships
app.get('/relationships', (req, res) => {
    const story = storyManager.loadStory();
    res.render('relationships', { 
        characters: story.characters
    });
});

app.post('/relationships', (req, res) => {
    const relationshipData = {
        type: req.body.type,
        dynamics: {
            trust: parseInt(req.body.trust) || 0,
            respect: parseInt(req.body.respect) || 0,
            affection: parseInt(req.body.affection) || 0,
            resentment: parseInt(req.body.resentment) || 0
        }
    };
    
    storyManager.addRelationship(req.body.from_char, req.body.to_char, relationshipData);
    res.redirect('/relationships');
});

// Timeline view (existing viewer functionality)
app.get('/timeline', (req, res) => {
    const fullStoryData = storyManager.exportFullStoryData();
    
    // Sort events by timestamp
    const sortedEvents = fullStoryData.events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.render('timeline', {
        title: fullStoryData.story_title || 'Story Timeline',
        characters: fullStoryData.characters,
        events: sortedEvents,
        locations: fullStoryData.locations,
        formatTimestamp
    });
});

// Export/Import
app.get('/export', (req, res) => {
    const fullStoryData = storyManager.exportFullStoryData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="story_export.json"');
    res.send(JSON.stringify(fullStoryData, null, 2));
});

app.get('/import', (req, res) => {
    res.render('import');
});

app.post('/import', (req, res) => {
    try {
        const importData = JSON.parse(req.body.jsonData);
        storyManager.importFromLegacyFormat(importData);
        res.redirect('/');
    } catch (error) {
        res.render('import', { error: 'Invalid JSON data' });
    }
});

app.listen(port, () => {
    console.log(`Story Planner writing tool listening at http://localhost:${port}`);
    console.log('Available routes:');
    console.log('  / - Story overview');
    console.log('  /characters - Character management');
    console.log('  /locations - Location management'); 
    console.log('  /lore - Lore management');
    console.log('  /events - Event management');
    console.log('  /relationships - Relationship management');
    console.log('  /timeline - Interactive timeline view');
});
