# Ferdous Mikdad's Portfolio

A creative and interactive portfolio website built with React, featuring a unique Pac-Man game interface to showcase projects and skills.

## Features

### Interactive Design

- **Pac-Man Game Interface**: Navigate through projects by playing a Pac-Man game
- **Sound Effects**: Immersive audio experience with toggle controls
- **Custom Cursor**: Personalized cursor design for enhanced user experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Portfolio Sections

- **Home Page**: Introduction with profile information and interactive game
- **Work Page**: Gallery of showcased projects with detailed descriptions
- **Contact Page**: Interactive contact form with animated character

### Technical Features

- **React Router**: Smooth navigation between pages
- **Tailwind CSS**: Modern, utility-first styling approach
- **Custom Animations**: Engaging micro-interactions and transitions
- **Sound Management**: Centralized audio control system

## Technology Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: SVG-based custom icons
- **Audio**: HTML5 Audio API

## Project Structure

```
react-portfolio/
├── public/
│   ├── audio/          # Sound effects and background music
│   ├── images/         # Static images and assets
│   └── work/           # Project showcase images
├── src/
│   ├── components/
│   │   ├── CustomCursor.jsx    # Custom cursor component
│   │   ├── Navigation.jsx      # Site navigation
│   │   └── PacmanGame.jsx      # Interactive Pac-Man game
│   ├── pages/
│   │   ├── HomePage.jsx        # Home page with profile
│   │   ├── WorkPage.jsx        # Work showcase page
│   │   └── ContactPage.jsx     # Contact page
│   ├── utils/
│   │   └── SoundManager.js     # Audio management system
│   ├── data/
│   │   ├── projects.js         # Project data
│   │   └── workData.js         # Work gallery data
│   ├── App.jsx                 # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and animations
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
└── vite.config.js             # Vite build configuration
```

## Getting Started

cd react-portfolio && npm run dev

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Portfolio/react-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How to Play the Pac-Man Game

1. Click the "Play Game!" button on the home page
2. Use arrow keys to control Pac-Man:
   - ↑ Arrow: Move up
   - ↓ Arrow: Move down
   - ← Arrow: Move left
   - → Arrow: Move right
3. Collect all dots to reveal the project image
4. Navigate between projects using the arrow buttons that appear after completing the game

## Customization

### Adding New Projects

1. Open `src/data/projects.js`
2. Add your project to the projects array:

```javascript
{
  id: 'project-id',
  title: 'Project Title',
  description: 'Project description',
  image: '/path/to/project-image.jpg',
  link: 'https://project-link.com'
}
```

### Modifying Styles

1. Update colors in `tailwind.config.js`
2. Add custom styles in `src/index.css`
3. Modify component-specific styles in their respective files

### Adding Sound Effects

1. Place audio files in `public/audio/`
2. Update `src/utils/SoundManager.js` to include new sounds
3. Trigger sounds in components using `soundManager.play('sound-name')`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

- **Email**: ferdousmikdad@gmail.com
- **LinkedIn**: [Ferdous Mikdad](https://www.linkedin.com/in/ferdousmikdad/)
- **Instagram**: [@ferdousmikdad](https://www.instagram.com/ferdousmikdad)

## Acknowledgments

- Pac-Man game concept inspired by the classic arcade game
- Sound effects from various free audio resources
- Icons and graphics created specifically for this portfolio
