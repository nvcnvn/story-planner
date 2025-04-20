const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (like CSS if added later)
app.use(express.static(path.join(__dirname, 'public')));

// Load story data
let storyData = {};
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'demo_story.json'));
  storyData = JSON.parse(rawData);
} catch (err) {
  console.error("Error reading or parsing demo_story.json:", err);
  // Handle error appropriately, maybe render an error page
}

// Function to calculate character state at a given timestamp (simplified)
// This is a basic implementation. A full implementation would need
// to process all events up to the timestamp.
function getCharacterStateAtTimestamp(character, timestamp) {
    let latestState = {};
    // Find the initial state
    const initialStateEntry = character.attributes.dynamic_history.find(entry => entry.timestamp === "M0_D1");
    if (initialStateEntry) {
        latestState = { ...initialStateEntry.state };
    }

    // Apply state changes from events up to the target timestamp
    // Note: This requires sorting events and comparing timestamps properly.
    // For this simple display, we'll just grab the *last* recorded state in the history.
    // A real implementation needs a proper timeline calculation.
    if (character.attributes.dynamic_history.length > 0) {
        // Find the most recent state entry *before or at* the target timestamp
        // This requires proper timestamp comparison logic (e.g., M1_D5 < M1_D15)
        // For simplicity here, we just take the last entry as a placeholder.
        const lastEntry = character.attributes.dynamic_history[character.attributes.dynamic_history.length - 1];
        latestState = { ...latestState, ...lastEntry.state }; // Merge, letting later states override earlier ones
    }

    // Apply direct effects from events (more complex logic needed here too)
    // Find events up to the timestamp involving this character and apply state_change

    return latestState;
}


// Route to display the story
app.get('/', (req, res) => {
  if (!storyData.story_title) {
    return res.status(500).send('Error loading story data.');
  }

  // Sort events by timestamp (basic sort assuming M{month}_D{day} format)
  const sortedEvents = storyData.events ? [...storyData.events].sort((a, b) => {
    const [aMonth, aDay] = a.timestamp.substring(1).split('_D').map(Number);
    const [bMonth, bDay] = b.timestamp.substring(1).split('_D').map(Number);
    if (aMonth !== bMonth) {
      return aMonth - bMonth;
    }
    return aDay - bDay;
  }) : [];

  // Calculate final state for recap (using the timestamp of the last event)
  const lastEventTimestamp = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1].timestamp : "M0_D1";
  const characterRecap = storyData.characters ? storyData.characters.map(char => {
      // Find the *actual* final state from the last event's effects if applicable
      const finalEvent = sortedEvents[sortedEvents.length - 1];
      let finalState = {};
      if (finalEvent && finalEvent.effects) {
          const effectOnChar = finalEvent.effects.find(eff => eff.target === char.id && eff.state_change);
          if (effectOnChar) {
              finalState = effectOnChar.state_change;
          }
      }
      // If the last event didn't explicitly set state, try getting the last known state
      // This is still simplified.
      if (Object.keys(finalState).length === 0 && char.attributes.dynamic_history.length > 0) {
          finalState = char.attributes.dynamic_history[char.attributes.dynamic_history.length - 1].state;
      }

      return {
          name: char.name,
          finalState: finalState
      };
  }) : [];


  res.render('index', {
    title: storyData.story_title || 'Story Planner',
    characters: storyData.characters || [],
    events: sortedEvents,
    locations: storyData.locations || [],
    characterRecap: characterRecap
  });
});

app.listen(port, () => {
  console.log(`Story Planner viewer listening at http://localhost:${port}`);
});
