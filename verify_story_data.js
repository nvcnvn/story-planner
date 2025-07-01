const fs = require('fs');

// Load the story data
const storyData = JSON.parse(fs.readFileSync('./demo_story.json', 'utf-8'));

function verifyDynamicHistory() {
  const errors = [];

  storyData.characters.forEach((character) => {
    const { id, attributes, relationships } = character;

    // Verify dynamic history
    attributes.dynamic_history.forEach((entry) => {
      const event = storyData.events.find((evt) => evt.id === entry.event_id);
      if (!event) {
        errors.push(`Character ${id}: Event ${entry.event_id} not found in dynamic history.`);
        return;
      }

      const effect = event.effects.find((eff) => eff.target === id);
      if (!effect) {
        errors.push(`Character ${id}: No matching effect found for event ${entry.event_id}.`);
        return;
      }

      const mismatchedFields = Object.keys(entry.state).filter(
        (key) => entry.state[key] !== effect.state_change[key]
      );

      if (mismatchedFields.length > 0) {
        errors.push(
          `Character ${id}: Mismatched fields in dynamic history for event ${entry.event_id}: ${mismatchedFields.join(', ')}.`
        );
      }
    });

    // Verify relationships
    relationships.forEach((relationship) => {
      relationship.history.forEach((historyEntry) => {
        const event = storyData.events.find((evt) => evt.id === historyEntry.event_id);
        if (!event) {
          errors.push(`Character ${id}: Event ${historyEntry.event_id} not found in relationship history.`);
          return;
        }

        const effect = event.effects.find(
          (eff) => eff.target === `relationship_${id}_${relationship.target_char_id}`
        );

        if (!effect) {
          errors.push(
            `Character ${id}: No matching effect found for relationship with ${relationship.target_char_id} in event ${historyEntry.event_id}.`
          );
          return;
        }

        const mismatchedFields = Object.keys(historyEntry.dynamics).filter(
          (key) => historyEntry.dynamics[key] !== effect.change.dynamics[key]
        );

        if (mismatchedFields.length > 0) {
          errors.push(
            `Character ${id}: Mismatched fields in relationship history for event ${historyEntry.event_id} with ${relationship.target_char_id}: ${mismatchedFields.join(', ')}.`
          );
        }
      });
    });
  });

  return errors;
}

function main() {
  const errors = verifyDynamicHistory();

  if (errors.length > 0) {
    console.log('Verification Errors:');
    errors.forEach((error) => console.log(error));
  } else {
    console.log('All dynamic histories and relationships are consistent with events.');
  }
}

main();
