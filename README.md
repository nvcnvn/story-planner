# Story Planner

A comprehensive web-based tool designed to help authors meticulously plan and track the intricate details of their novels and stories with an intuitive user interface.

## 🎯 Vision

Writing a complex story with deep lore, evolving characters, and intricate plotlines can be challenging to manage. Story Planner serves as your digital companion, providing a structured way to organize worldbuilding elements, track character development and relationships, map out events, and visualize the narrative timeline. No more scattered notes or continuity errors – keep your entire story world at your fingertips.

## ✨ Key Features

### 📊 **Dashboard & Story Management**
- **Story Overview**: Centralized dashboard showing story statistics and recent activity
- **Story Settings**: Configure title, author, genre, and description
- **Import/Export**: Seamlessly import existing story data or export your work

### 👥 **Character Management**
- **Character Profiles**: Create detailed character profiles with names, descriptions, and attributes
- **Static Attributes**: Define unchanging properties (species, class, background, age, gender)
- **Dynamic History**: Track how characters change over time through events
- **Character Relationships**: Manage complex relationship networks with multiple dimensions

### 🗺️ **World Building**
- **Location Management**: Create and organize story locations with detailed properties
- **Lore System**: Document world history, magic systems, cultures, and background information
- **Categorized Organization**: Organize lore entries by category with tags for easy discovery

### 📅 **Event & Timeline Management**
- **Event Creation**: Document key plot points with timestamps, descriptions, and participants
- **Separate Event Files**: Each event is stored as a separate file for better organization
- **Event Effects**: Define how events impact character states and relationships
- **Interactive Timeline**: Visualize story progression chronologically
- **Participant Tracking**: Link events to characters and locations

### 💕 **Relationship Mapping**
- **Multi-Dimensional Relationships**: Track trust, respect, affection, and resentment
- **Relationship Evolution**: See how relationships change over time through events
- **Bidirectional Perspectives**: Each character maintains their own view of relationships
- **Historical Tracking**: Complete history of relationship changes with timestamps

### 🔄 **Point-in-Time Analysis**
- **State Calculation**: View character states and relationships at any point in the timeline
- **Dynamic Reconstruction**: All states are calculated from event effects for consistency
- **Timeline Queries**: Understand your story's state at any given moment

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd story-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### First Steps

#### Option 1: Start Fresh
1. Click "Start a New Story" on the welcome screen
2. Fill in your story details (title, author, genre, description)
3. Begin adding characters, locations, and lore entries
4. Create your first event to start the timeline

#### Option 2: Import Existing Data
1. Click "Import Existing Story" on the welcome screen
2. Paste your story JSON data (compatible with the original demo_story.json format)
3. Click "Import Story" to load your data

### Demo Data
The project includes a complete demo story (`demo_story.json`) featuring a D&D-style adventure with 5 characters exploring a shifting dungeon. You can import this to see all features in action.

## 📁 Data Structure

### File Organization
```
data/
├── story.json          # Main story metadata and references
└── events/             # Individual event files
    ├── evt_001.json    # Event files stored separately
    ├── evt_002.json
    └── ...
```

### Core Data Types

#### Story Structure
```json
{
  "story_title": "Your Story Title",
  "metadata": {
    "created": "2024-01-01T00:00:00.000Z",
    "last_modified": "2024-01-01T00:00:00.000Z",
    "author": "Author Name",
    "genre": "Fantasy",
    "description": "Story description"
  },
  "characters": [...],
  "locations": [...],
  "lore": [...],
  "events": [...]  // References to event files
}
```

#### Character Structure
```json
{
  "id": "char_001",
  "name": "Character Name",
  "description": "Character description",
  "attributes": {
    "static": {
      "species": "Human",
      "class": "Fighter",
      "background": "City Guard",
      "age": "30",
      "gender": "Male"
    },
    "dynamic_history": []  // Changes over time via events
  },
  "relationships": []
}
```

#### Event Structure (Separate Files)
```json
{
  "id": "evt_001",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "title": "Event Title",
  "description": "What happens in this event",
  "participants": ["char_001", "char_002"],
  "location_id": "loc_001",
  "effects": [
    {
      "target": "char_001",
      "state_change": {"mood": "Excited", "location": "loc_002"}
    },
    {
      "target": "relationship_char_001_char_002",
      "change": {
        "dynamics": {"trust": 10, "affection": 5},
        "label": "Bonded through adventure"
      }
    }
  ],
  "notes": "Additional notes",
  "tags": ["adventure", "discovery"]
}
```

## 🎮 Usage Guide

### Creating Characters
1. Navigate to **Characters** → **Add Character**
2. Fill in basic information (name, description)
3. Set static attributes (species, class, background, etc.)
4. Characters will gain dynamic attributes through events

### Building Your World
1. **Locations**: Create places where events occur
2. **Lore**: Document background information, history, and world rules
3. Use tags and categories for easy organization

### Managing Events
1. **Create Event**: Define what happens, when, and who's involved
2. **Set Effects**: Define how the event changes character states and relationships
3. **Timeline View**: See your story's chronological progression

### Tracking Relationships
- Relationships evolve through event effects
- Each character maintains their perspective on relationships
- Track multiple dimensions: trust, respect, affection, resentment

## 🔧 Advanced Features

### Event Effects System
Events can modify:
- **Character States**: mood, location, health, etc.
- **Relationship Dynamics**: trust, respect, affection, resentment
- **Custom Attributes**: Any attribute you define

### Data Export/Import
- **Export**: Download complete story data as JSON
- **Import**: Load existing story data
- **Backup**: Regular exports serve as backups

### Development Mode
For continuous development:
```bash
npm run dev  # Uses nodemon for auto-restart
```

## 🗂️ Project Structure

```
story-planner/
├── server.js              # Main Express server
├── story-manager.js       # Core data management
├── package.json           # Dependencies and scripts
├── views/                 # EJS templates
│   ├── index.ejs         # Dashboard
│   ├── characters.ejs    # Character management
│   ├── events.ejs        # Event management
│   └── ...
├── public/               # Static assets
│   └── js/
│       └── timeline.js   # Timeline visualization
├── data/                 # Story data (auto-created)
│   ├── story.json       # Main story file
│   └── events/          # Individual event files
└── demo_story.json      # Demo data
```

## 🆕 What's New

This version introduces:

- **Modern Web Interface**: Beautiful, responsive UI with Bootstrap 5
- **Modular Event System**: Events stored as separate files for better organization
- **Enhanced Character Management**: Comprehensive character creation and editing
- **Improved Data Structure**: Better organized with metadata and validation
- **User-Friendly Forms**: Intuitive forms for all data entry
- **Dashboard Overview**: Quick access to all story elements
- **Better Import/Export**: Seamless data migration and backup

## 🔮 Future Enhancements

- **Advanced Relationship Visualization**: Network graphs showing character connections
- **Timeline Filtering**: Filter events by character, location, or tag
- **Character State Visualization**: Charts showing how characters change over time
- **Collaborative Features**: Multi-user story planning
- **Mobile Responsive Design**: Full mobile support
- **Plugin System**: Extensible architecture for custom features

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Additional event effect types
- Enhanced timeline visualization
- Character relationship graphs
- Mobile interface improvements
- Performance optimizations

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Happy Writing!** 📝✨

Create rich, complex stories with characters that feel real and relationships that evolve naturally. Story Planner helps you maintain consistency and discover new narrative possibilities in your work.

