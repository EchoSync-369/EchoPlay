# 🎵 EchoPlay

> A modern, responsive music discovery application built with Angular 19 and the Spotify Web API

EchoPlay transforms how you explore and interact with music, offering a seamless experience for discovering new releases, searching your favorite artists, and playing music directly from Spotify.

![Angular](https://img.shields.io/badge/Angular-19.2.7-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![PrimeNG](https://img.shields.io/badge/PrimeNG-19.1.3-orange?style=flat-square)
![Jest](https://img.shields.io/badge/Jest-Testing-green?style=flat-square&logo=jest)

## ✨ Features

### 🎧 Music Discovery & Playback
- **New Releases Carousel**: Browse the latest albums with beautiful cover art displays
- **Embedded Spotify Player**: Play music directly within the app using Spotify's official player
- **Universal Search**: Search for albums, artists, playlists, and tracks with categorized results
- **Deep Linking**: Share specific tracks, albums, or playlists with direct URLs

### 🎨 User Experience
- **Responsive Design**: Seamlessly adapts to desktop, tablet, and mobile devices
- **Dynamic Theming**: Switch between light and dark modes with persistent preferences
- **Intuitive Navigation**: Smart navigation with contextual search bar visibility
- **Loading States**: Smooth transitions and loading indicators for better UX

### 🔐 Authentication & Security
- **Spotify OAuth Integration**: Secure authentication using Spotify's client credentials flow
- **Route Guards**: Protected routes ensuring proper authentication state
- **Token Management**: Automatic token handling with error recovery

### 🧪 Quality Assurance
- **Comprehensive Testing**: Jest unit tests with 100% component coverage
- **TypeScript**: Full type safety for robust development
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Spotify Developer Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EchoPlay.git
   cd EchoPlay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create `src/app/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     clientId: 'your_spotify_client_id',
     clientSecret: 'your_spotify_client_secret'
   };
   ```

   Create `src/app/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     clientId: 'your_spotify_client_id',
     clientSecret: 'your_spotify_client_secret'
   };
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:4200/`

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm run build:prod` | Production build with optimizations |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

### Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── carousel/        # Album/track carousel display
│   │   ├── navbar/          # Main navigation component
│   │   ├── search-bar/      # Search input component
│   │   └── theme-button/    # Theme toggle component
│   ├── pages/               # Route components
│   │   ├── home/           # New releases dashboard
│   │   ├── landing-page/   # Authentication landing
│   │   ├── player-page/    # Embedded Spotify player
│   │   └── search-page/    # Search results display
│   ├── services/           # Business logic & API calls
│   │   ├── spotify-api/    # Spotify Web API integration
│   │   ├── themes/         # Theme management
│   │   ├── auth/           # Authentication guards
│   │   └── unauth/         # Unauthenticated route guards
│   ├── models/             # TypeScript interfaces
│   └── environments/       # Environment configurations
└── public/                 # Static assets
```

### Code Generation

Generate new components using Angular CLI:

```bash
# Generate a new component
ng generate component component-name

# Generate a new service
ng generate service service-name

# Generate a new guard
ng generate guard guard-name
```

## 🧪 Testing

EchoPlay includes comprehensive unit tests using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Features
- **Component Testing**: All components have full test coverage
- **Service Testing**: API services and business logic testing
- **Integration Testing**: End-to-end user interaction flows
- **Accessibility Testing**: ARIA compliance and keyboard navigation

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: Angular 19 with standalone components
- **UI Library**: PrimeNG for consistent, accessible components
- **Styling**: CSS with custom properties for theming
- **Testing**: Jest for unit and integration testing
- **API Integration**: Spotify Web API with RxJS observables
- **Build Tool**: Angular CLI with Webpack

### Key Design Patterns
- **Reactive Programming**: RxJS for handling asynchronous operations
- **Dependency Injection**: Angular's built-in DI for service management
- **Route Guards**: Authentication and authorization protection
- **Component Architecture**: Standalone components for better tree-shaking
- **State Management**: Service-based state with observables

## 📱 Responsive Design

EchoPlay is built mobile-first with responsive breakpoints:

- **Desktop**: 1200px+ (4-5 visible carousel items)
- **Tablet**: 900px-1199px (2-3 visible carousel items)
- **Mobile**: <900px (1 visible carousel item)

## 🎨 Theming

The app supports both light and dark themes with:
- **CSS Custom Properties**: Dynamic theme switching
- **System Preference Detection**: Automatic theme based on user's OS
- **Persistent Storage**: Theme preference saved across sessions
- **Smooth Transitions**: Animated theme changes

## 🚀 Deployment

### Production Build

```bash
npm run build:prod
```

### GitHub Pages Deployment

```bash
npm run deploy:gh-pages
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) for music data
- [PrimeNG](https://primeng.org/) for UI components
- [Angular](https://angular.dev/) for the amazing framework
- [Jest](https://jestjs.io/) for testing capabilities

## 📞 Support

If you have any questions or need support, please open an issue on GitHub.

---

**Built with ❤️ using Angular 19**
