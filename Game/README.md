# Startup Simulation - React Version

A fun, interactive startup simulation game built with React and Canvas.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd c:\Users\mdkha\OneDrive\Desktop\Game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The game will automatically open in your browser at `http://localhost:3000`

### Build for Production

To create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:
```bash
npm run preview
```

## Game Features

- **Interactive Canvas-based Game**: Built with React hooks and Canvas API
- **7 Decision Points**: Make strategic choices across different business aspects
- **Real-time Animation**: Smooth character animations and transitions
- **Dynamic Statistics**: Track Money, Growth, and Reputation
- **Responsive UI**: Clean, pixel-art inspired interface

## Game Mechanics

Start with **0 rupees** and make 7 strategic decisions:
1. Team Selection
2. Budget Allocation
3. Product Strategy
4. Marketing Strategy
5. Market Position
6. Team Management
7. Expansion Decision

Each choice affects your three key metrics:
- 💰 **Money**: Your financial resources
- 📈 **Growth**: Business expansion
- ⭐ **Reputation**: Brand value

## Project Structure

```
src/
├── components/
│   └── GameCanvas.jsx      # Main game component
├── constants/
│   └── gameData.js         # Game entities and choices
├── styles/
│   └── GameCanvas.css      # Canvas styling
├── utils/
│   └── draw.js             # Drawing utilities
├── App.jsx                 # Root component
├── App.css                 # App styling
├── index.jsx               # Entry point
└── index.css               # Global styles
```

## Technologies Used

- **React 18**: UI library with hooks
- **Vite**: Modern build tool
- **Canvas API**: Game rendering
- **CSS**: Styling

## License

MIT
