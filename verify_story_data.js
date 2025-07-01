const fs = require('fs');

// Load the story data
let storyData;
try {
  storyData = JSON.parse(fs.readFileSync('./demo_story.json', 'utf-8'));
} catch (error) {
  console.error('Error loading story data:', error.message);
  process.exit(1);
}

// Verification statistics
const stats = {
  warnings: [],
  suggestions: []
};

function verifyDataStructure() {
  const errors = [];

  // Check required top-level structure
  if (!storyData.characters || !Array.isArray(storyData.characters)) {
    errors.push('Missing or invalid characters array');
  }
  if (!storyData.events || !Array.isArray(storyData.events)) {
    errors.push('Missing or invalid events array');
  }
  if (!storyData.locations || !Array.isArray(storyData.locations)) {
    errors.push('Missing or invalid locations array');
  }

  // Check for duplicate IDs
  const characterIds = storyData.characters?.map(c => c.id) || [];
  const eventIds = storyData.events?.map(e => e.id) || [];
  const locationIds = storyData.locations?.map(l => l.id) || [];

  const findDuplicates = (arr, type) => {
    const duplicates = arr.filter((item, index) => arr.indexOf(item) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate ${type} IDs found: ${[...new Set(duplicates)].join(', ')}`);
    }
  };

  findDuplicates(characterIds, 'character');
  findDuplicates(eventIds, 'event');
  findDuplicates(locationIds, 'location');

  return errors;
}

function verifyEventIntegrity() {
  const errors = [];

  storyData.events.forEach((event) => {
    // Check required event fields
    if (!event.id) errors.push(`Event missing ID`);
    if (!event.timestamp) errors.push(`Event ${event.id}: Missing timestamp`);
    if (!event.description) errors.push(`Event ${event.id}: Missing description`);
    if (!event.participants || !Array.isArray(event.participants)) {
      errors.push(`Event ${event.id}: Missing or invalid participants array`);
    }
    if (!event.effects || !Array.isArray(event.effects)) {
      errors.push(`Event ${event.id}: Missing or invalid effects array`);
    }

    // Verify participants exist
    if (event.participants) {
      event.participants.forEach(participantId => {
        if (!storyData.characters.find(c => c.id === participantId)) {
          errors.push(`Event ${event.id}: Participant ${participantId} not found in characters`);
        }
      });
    }

    // Verify location exists
    if (event.location_id && !storyData.locations.find(l => l.id === event.location_id)) {
      errors.push(`Event ${event.id}: Location ${event.location_id} not found in locations`);
    }

    // Check effects structure
    if (event.effects) {
      event.effects.forEach((effect, index) => {
        if (!effect.target) {
          errors.push(`Event ${event.id}: Effect ${index} missing target`);
        } else if (effect.target.startsWith('char_')) {
          // Character state change effect
          if (!effect.state_change) {
            errors.push(`Event ${event.id}: Character effect for ${effect.target} missing state_change`);
          }
        } else if (effect.target.startsWith('relationship_')) {
          // Relationship effect
          if (!effect.change) {
            errors.push(`Event ${event.id}: Relationship effect for ${effect.target} missing change object`);
          } else if (!effect.change.dynamics) {
            errors.push(`Event ${event.id}: Relationship effect for ${effect.target} missing dynamics`);
          }
        } else {
          errors.push(`Event ${event.id}: Unknown effect target format: ${effect.target}`);
        }
      });
    }
  });

  return errors;
}

function verifyCharacterIntegrity() {
  const errors = [];

  storyData.characters.forEach((character) => {
    // Check required character fields
    if (!character.id) errors.push(`Character missing ID`);
    if (!character.name) errors.push(`Character ${character.id}: Missing name`);
    if (!character.attributes) errors.push(`Character ${character.id}: Missing attributes`);
    if (!character.relationships || !Array.isArray(character.relationships)) {
      errors.push(`Character ${character.id}: Missing or invalid relationships array`);
    }

    // Check attributes structure
    if (character.attributes) {
      if (!character.attributes.static) {
        errors.push(`Character ${character.id}: Missing static attributes`);
      }
      if (!character.attributes.dynamic_history || !Array.isArray(character.attributes.dynamic_history)) {
        errors.push(`Character ${character.id}: Missing or invalid dynamic_history`);
      }
    }

    // Verify relationship targets exist
    if (character.relationships) {
      character.relationships.forEach((relationship, index) => {
        if (!relationship.target_char_id) {
          errors.push(`Character ${character.id}: Relationship ${index} missing target_char_id`);
        } else if (!storyData.characters.find(c => c.id === relationship.target_char_id)) {
          errors.push(`Character ${character.id}: Relationship target ${relationship.target_char_id} not found`);
        }
        
        if (!relationship.dynamics) {
          errors.push(`Character ${character.id}: Relationship with ${relationship.target_char_id} missing dynamics`);
        }
        
        if (!relationship.history || !Array.isArray(relationship.history)) {
          errors.push(`Character ${character.id}: Relationship with ${relationship.target_char_id} missing or invalid history`);
        }
      });
    }
  });

  return errors;
}

function verifyDynamicHistory() {
  const errors = [];

  storyData.characters.forEach((character) => {
    const { id, attributes, relationships } = character;

    // Verify dynamic history
    if (attributes && attributes.dynamic_history) {
      attributes.dynamic_history.forEach((entry, index) => {
        if (!entry.event_id) {
          errors.push(`Character ${id}: Dynamic history entry ${index} missing event_id`);
          return;
        }

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

        if (!effect.state_change) {
          errors.push(`Character ${id}: Event ${entry.event_id} effect missing state_change`);
          return;
        }

        if (!entry.state) {
          errors.push(`Character ${id}: Dynamic history entry for ${entry.event_id} missing state`);
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

        // Check for missing fields in event effect
        const missingInEffect = Object.keys(entry.state).filter(
          (key) => !(key in effect.state_change)
        );
        if (missingInEffect.length > 0) {
          stats.warnings.push(
            `Character ${id}: Event ${entry.event_id} missing state fields in effect: ${missingInEffect.join(', ')}`
          );
        }
      });
    }

    // Verify relationships
    if (relationships) {
      relationships.forEach((relationship) => {
        if (!relationship.history) return;

        relationship.history.forEach((historyEntry, index) => {
          if (!historyEntry.event_id) {
            errors.push(`Character ${id}: Relationship history entry ${index} with ${relationship.target_char_id} missing event_id`);
            return;
          }

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

          if (!effect.change || !effect.change.dynamics) {
            errors.push(
              `Character ${id}: Event ${historyEntry.event_id} relationship effect missing change.dynamics`
            );
            return;
          }

          if (!historyEntry.dynamics) {
            errors.push(
              `Character ${id}: Relationship history entry for ${historyEntry.event_id} missing dynamics`
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
    }
  });

  return errors;
}

function verifyChronologicalOrder() {
  const warnings = [];

  // Check if events are in chronological order
  for (let i = 1; i < storyData.events.length; i++) {
    const prevDate = new Date(storyData.events[i - 1].timestamp);
    const currDate = new Date(storyData.events[i].timestamp);
    
    if (currDate < prevDate) {
      warnings.push(`Events out of chronological order: ${storyData.events[i - 1].id} (${storyData.events[i - 1].timestamp}) comes before ${storyData.events[i].id} (${storyData.events[i].timestamp})`);
    }
  }

  // Check character dynamic history chronological order
  storyData.characters.forEach(character => {
    if (character.attributes && character.attributes.dynamic_history) {
      for (let i = 1; i < character.attributes.dynamic_history.length; i++) {
        const prevEventId = character.attributes.dynamic_history[i - 1].event_id;
        const currEventId = character.attributes.dynamic_history[i].event_id;
        
        const prevEvent = storyData.events.find(e => e.id === prevEventId);
        const currEvent = storyData.events.find(e => e.id === currEventId);
        
        if (prevEvent && currEvent) {
          const prevDate = new Date(prevEvent.timestamp);
          const currDate = new Date(currEvent.timestamp);
          
          if (currDate < prevDate) {
            warnings.push(`Character ${character.id}: Dynamic history out of order: ${prevEventId} before ${currEventId}`);
          }
        }
      }
    }
  });

  return warnings;
}

function generateSuggestions() {
  const suggestions = [];

  // Check for characters with no relationship history
  storyData.characters.forEach(character => {
    if (character.relationships) {
      const totalRelationshipHistory = character.relationships.reduce((total, rel) => total + (rel.history?.length || 0), 0);
      if (totalRelationshipHistory === 0) {
        suggestions.push(`Character ${character.id} has no relationship history entries`);
      }
    }
  });

  // Check for events with no effects
  storyData.events.forEach(event => {
    if (!event.effects || event.effects.length === 0) {
      suggestions.push(`Event ${event.id} has no effects`);
    }
  });

  // Check for relationship symmetry issues
  storyData.characters.forEach(character => {
    if (character.relationships) {
      character.relationships.forEach(relationship => {
        const targetCharacter = storyData.characters.find(c => c.id === relationship.target_char_id);
        if (targetCharacter && targetCharacter.relationships) {
          const reverseRelationship = targetCharacter.relationships.find(r => r.target_char_id === character.id);
          if (!reverseRelationship) {
            suggestions.push(`Asymmetric relationship: ${character.id} has relationship with ${relationship.target_char_id}, but not vice versa`);
          }
        }
      });
    }
  });

  return suggestions;
}

function main() {
  const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  
  console.log('📋 Story Data Verification Report\n');

  // Run all verification checks
  const structureErrors = verifyDataStructure();
  const eventErrors = verifyEventIntegrity();
  const characterErrors = verifyCharacterIntegrity();
  const historyErrors = verifyDynamicHistory();
  const chronologicalWarnings = verifyChronologicalOrder();
  const suggestions = generateSuggestions();

  const allErrors = [...structureErrors, ...eventErrors, ...characterErrors, ...historyErrors];
  const allWarnings = [...stats.warnings, ...chronologicalWarnings];

  // Display results
  if (allErrors.length > 0) {
    console.log('❌ ERRORS:');
    allErrors.forEach((error, index) => console.log(`  ${index + 1}. ${error}`));
    console.log();
  }

  if (allWarnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    allWarnings.forEach((warning, index) => console.log(`  ${index + 1}. ${warning}`));
    console.log();
  }

  if (suggestions.length > 0) {
    console.log('💡 SUGGESTIONS:');
    suggestions.forEach((suggestion, index) => console.log(`  ${index + 1}. ${suggestion}`));
    console.log();
  }

  // Verbose details
  if (isVerbose) {
    console.log('🔍 VERIFICATION DETAILS:');
    console.log(`  ✓ Data structure validation`);
    console.log(`  ✓ Event integrity (${storyData.events?.length || 0} events)`);
    console.log(`  ✓ Character integrity (${storyData.characters?.length || 0} characters)`);
    
    let totalDynamicHistory = 0;
    let totalRelationshipHistory = 0;
    storyData.characters?.forEach(char => {
      totalDynamicHistory += char.attributes?.dynamic_history?.length || 0;
      char.relationships?.forEach(rel => {
        totalRelationshipHistory += rel.history?.length || 0;
      });
    });
    
    console.log(`  ✓ Dynamic history validation (${totalDynamicHistory} entries)`);
    console.log(`  ✓ Relationship history validation (${totalRelationshipHistory} entries)`);
    console.log(`  ✓ Chronological order verification`);
    console.log(`  ✓ Data consistency suggestions`);
    console.log();
  }

  // Summary
  console.log('📊 SUMMARY:');
  console.log(`  • Characters: ${storyData.characters?.length || 0}`);
  console.log(`  • Events: ${storyData.events?.length || 0}`);
  console.log(`  • Locations: ${storyData.locations?.length || 0}`);
  console.log(`  • Errors: ${allErrors.length}`);
  console.log(`  • Warnings: ${allWarnings.length}`);
  console.log(`  • Suggestions: ${suggestions.length}`);

  if (allErrors.length === 0) {
    console.log('\n✅ All critical checks passed! Story data is consistent.');
    if (!isVerbose) {
      console.log('   Use --verbose or -v flag for detailed verification info.');
    }
  } else {
    console.log('\n❌ Story data has errors that need to be fixed.');
    process.exit(1);
  }
}

main();
