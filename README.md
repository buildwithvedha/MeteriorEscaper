# MeteriorEscaper Game🚀

A fast-paced mobile game where you pilot a spaceship through an asteroid field. Dodge incoming asteroids, survive as long as you can, and beat your high score!

## Game Overview

Navigate your spaceship left and right to avoid falling asteroids. Each asteroid you dodge increases your score. Survive with 3 lives, but hit an asteroid and lose one! The game gets progressively challenging as your score increases.

### Features
- **Responsive Controls** - Swipe left/right or tap buttons to move
- **Score Tracking** - Real-time score counter
- **High Score System** - Your best score is saved locally
- **Lives System** - Start with 3 lives, lose one when hit by an asteroid
- **Invincibility Frames** - Brief protection after getting hit
- **Beautiful UI** - Gradient backgrounds and smooth animations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/buildwithvedha/SpaceEscapeRunner.git
   cd SpaceEscapeRunner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   - **Android**: Press `a` or run `npm run android`
   - **iOS**: Press `i` or run `npm run ios`
   - **Web**: Press `w` or run `npm run web`

## How to Play

1. Tap **"Start Game"** to begin
2. **Move left/right** to dodge asteroids
3. **Survive** as long as possible
4. **Game Over** when you lose all 3 lives
5. Check your **High Score** at the end

### Game Mechanics
- Earn **1 point** for each asteroid dodged
- Lose a **life** when hit by an asteroid
- Get **1 second of invincibility** after getting hit
- Game difficulty increases with score

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - React Native development platform
- **React Hooks** - State management (useState, useEffect, useRef)
- **AsyncStorage** - Local data persistence for high scores
- **Linear Gradient** - UI styling and visual effects
- **JavaScript** - Game logic and mechanics

## Project Structure

```
SpaceEscapeRunner/
├── App.js              # Main game component
├── index.js            # Entry point
├── package.json        # Dependencies
├── app.json            # Expo configuration
├── CLAUDE.md          # Development notes
├── AGENTS.md          # Agent configuration
└── assets/            # Game images and icons
    ├── icon.png
    ├── splash-icon.png
    ├── favicon.png
    └── adaptive-icon.png
```

## Game Constants

- **Spaceship Size**: 50x50 pixels
- **Asteroid Size**: 42x42 pixels
- **Fall Speed**: 6 pixels per frame
- **Tick Rate**: 30 FPS
- **Movement Step**: 25 pixels
- **Max Lives**: 3
- **Invincibility Duration**: 1 second

## Future Enhancements

- 🎮 Different difficulty levels
- 🎯 Power-ups (shields, speed boost)
- 🌟 Leaderboard system
- 🎵 Sound effects and music
- 📱 Multi-device optimization
- 🎨 Themes and customization

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

This project is open source and available under the MIT License.

## Author

Built by [Vedha](https://github.com/buildwithvedha)

---

**Ready to play?** Download Expo Go on your phone and scan the QR code from `npm start` to play immediately! 📱
