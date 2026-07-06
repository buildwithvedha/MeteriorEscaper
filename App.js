import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GAME_HEIGHT = 500;
const SPACESHIP_SIZE = 50;
const ASTEROID_SIZE = 42;
const FALL_SPEED = 6;
const TICK_RATE = 30;
const MOVE_STEP = 25;
const MAX_LIVES = 3;
const INVINCIBLE_MS = 1000;
const HIGH_SCORE_KEY = '@space_escape_high_score';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [invincible, setInvincible] = useState(false);

  const [spaceshipX, setSpaceshipX] = useState(
    SCREEN_WIDTH / 2 - SPACESHIP_SIZE / 2
  );
  const [asteroidX, setAsteroidX] = useState(
    Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE)
  );
  const [asteroidY, setAsteroidY] = useState(0);

  const spaceshipXRef = useRef(spaceshipX);
  const asteroidXRef = useRef(asteroidX);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const invincibleRef = useRef(false);
  const intervalRef = useRef(null);

  const spaceshipY = GAME_HEIGHT - SPACESHIP_SIZE - 10;

  // ---- Animated values for smooth visual effects ----
  const scorePulse = useRef(new Animated.Value(1)).current;
  const shipFlash = useRef(new Animated.Value(1)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;
  const asteroidSpin = useRef(new Animated.Value(0)).current;

  // Spin the asteroid continuously for a "tumbling in space" look
  useEffect(() => {
    Animated.loop(
      Animated.timing(asteroidSpin, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spinInterpolate = asteroidSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ---- Load high score once, when the app first starts ----
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (savedValue !== null) {
          setHighScore(parseInt(savedValue, 10));
        }
      } catch (error) {
        console.log('Failed to load high score:', error);
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    spaceshipXRef.current = spaceshipX;
  }, [spaceshipX]);

  useEffect(() => {
    asteroidXRef.current = asteroidX;
  }, [asteroidX]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    invincibleRef.current = invincible;
  }, [invincible]);

  const pulseScore = () => {
    Animated.sequence([
      Animated.timing(scorePulse, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scorePulse, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const flashShip = () => {
    Animated.sequence([
      Animated.timing(shipFlash, { toValue: 0.2, duration: 100, useNativeDriver: true }),
      Animated.timing(shipFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(shipFlash, { toValue: 0.2, duration: 100, useNativeDriver: true }),
      Animated.timing(shipFlash, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const saveHighScoreIfNeeded = async (finalScoreValue) => {
    if (finalScoreValue > highScore) {
      setHighScore(finalScoreValue);
      try {
        await AsyncStorage.setItem(HIGH_SCORE_KEY, finalScoreValue.toString());
      } catch (error) {
        console.log('Failed to save high score:', error);
      }
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      intervalRef.current = setInterval(() => {
        setAsteroidY((prevY) => {
          const newY = prevY + FALL_SPEED;

          const inSpaceshipZone =
            newY + ASTEROID_SIZE >= spaceshipY &&
            newY <= spaceshipY + SPACESHIP_SIZE;

          if (inSpaceshipZone && !invincibleRef.current) {
            const asteroidLeft = asteroidXRef.current;
            const asteroidRight = asteroidXRef.current + ASTEROID_SIZE;
            const shipLeft = spaceshipXRef.current;
            const shipRight = spaceshipXRef.current + SPACESHIP_SIZE;

            const collided =
              asteroidLeft < shipRight && asteroidRight > shipLeft;

            if (collided) {
              const remainingLives = livesRef.current - 1;
              setLives(remainingLives);
              livesRef.current = remainingLives;
              flashShip();

              if (remainingLives <= 0) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setFinalScore(scoreRef.current);
                saveHighScoreIfNeeded(scoreRef.current);
                setGameOver(true);
                return newY;
              } else {
                setInvincible(true);
                invincibleRef.current = true;
                setTimeout(() => {
                  setInvincible(false);
                  invincibleRef.current = false;
                }, INVINCIBLE_MS);

                const newX = Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);
                setAsteroidX(newX);
                asteroidXRef.current = newX;
                return 0;
              }
            }
          }

          if (newY > GAME_HEIGHT) {
            setScore((prev) => prev + 1);
            pulseScore();
            const newX = Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);
            setAsteroidX(newX);
            asteroidXRef.current = newX;
            return 0;
          }

          return newY;
        });
      }, TICK_RATE);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (gameOver) {
      Animated.timing(overlayFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      overlayFade.setValue(0);
    }
  }, [gameOver]);

  const startGame = () => {
    const initialX = SCREEN_WIDTH / 2 - SPACESHIP_SIZE / 2;
    const initialAsteroidX = Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE);

    setScore(0);
    scoreRef.current = 0;
    setFinalScore(0);
    setGameOver(false);
    setAsteroidY(0);
    setAsteroidX(initialAsteroidX);
    asteroidXRef.current = initialAsteroidX;
    setSpaceshipX(initialX);
    spaceshipXRef.current = initialX;
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setInvincible(false);
    invincibleRef.current = false;
    setGameStarted(true);
  };

  const moveLeft = () => {
    setSpaceshipX((prev) => Math.max(0, prev - MOVE_STEP));
  };

  const moveRight = () => {
    setSpaceshipX((prev) =>
      Math.min(SCREEN_WIDTH - SPACESHIP_SIZE - 40, prev + MOVE_STEP)
    );
  };

  return (
    <LinearGradient
      colors={['#0B0D2A', '#1A1240', '#2A1A50']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Space Escape Runner</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Animated.Text
            style={[styles.scoreValue, { transform: [{ scale: scorePulse }] }]}
          >
            {score}
          </Animated.Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>High Score</Text>
          <Text style={styles.highScoreValue}>{highScore}</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Lives</Text>
          <Text style={styles.livesValue}>
            {'❤️'.repeat(lives)}
            {'🖤'.repeat(MAX_LIVES - lives)}
          </Text>
        </View>
      </View>

      {!gameStarted && (
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      )}

      {gameStarted && (
        <LinearGradient
          colors={['#12143A', '#1B1D52']}
          style={styles.gameArea}
        >
          <Animated.View
            style={[
              styles.asteroid,
              {
                left: asteroidX,
                top: asteroidY,
                transform: [{ rotate: spinInterpolate }],
              },
            ]}
          >
            <View style={styles.asteroidCraterOne} />
            <View style={styles.asteroidCraterTwo} />
            <View style={styles.asteroidCraterThree} />
          </Animated.View>

          <Animated.View
            style={[
              styles.spaceshipWrapper,
              {
                left: spaceshipX,
                top: spaceshipY,
                opacity: shipFlash,
              },
            ]}
          >
            <View style={styles.engineGlow} />
            <View style={styles.spaceshipNose} />
            <View style={styles.spaceshipBody}>
              <View style={styles.cockpit} />
            </View>
            <View style={styles.wingsRow}>
              <View style={styles.spaceshipWingLeft} />
              <View style={styles.spaceshipWingRight} />
            </View>
          </Animated.View>

          {gameOver && (
            <Animated.View style={[styles.overlay, { opacity: overlayFade }]}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.finalScoreText}>Final Score: {finalScore}</Text>
              <Text style={styles.finalScoreText}>High Score: {highScore}</Text>
              <TouchableOpacity style={styles.button} onPress={startGame}>
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </LinearGradient>
      )}

      {gameStarted && !gameOver && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
            <Text style={styles.controlText}>◀ Left</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restartButton} onPress={startGame}>
            <Text style={styles.controlText}>Restart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
            <Text style={styles.controlText}>Right ▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#9AA0C7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4C6FFF',
  },
  highScoreValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD24C',
  },
  livesValue: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4C6FFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: '#4C6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameArea: {
    width: SCREEN_WIDTH - 40,
    height: GAME_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  asteroid: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    borderRadius: ASTEROID_SIZE / 2,
    backgroundColor: '#B5651D',
    borderWidth: 2,
    borderColor: '#7A4315',
  },
  asteroidCraterOne: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7A4315',
    top: 6,
    left: 8,
  },
  asteroidCraterTwo: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7A4315',
    top: 20,
    left: 22,
  },
  asteroidCraterThree: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7A4315',
    top: 10,
    left: 26,
  },
  spaceshipWrapper: {
    position: 'absolute',
    width: SPACESHIP_SIZE,
    height: SPACESHIP_SIZE,
    alignItems: 'center',
  },
  engineGlow: {
    position: 'absolute',
    bottom: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFB84C',
    opacity: 0.8,
  },
  spaceshipNose: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#7FE3FF',
  },
  spaceshipBody: {
    width: 26,
    height: 22,
    backgroundColor: '#4CD3FF',
    borderRadius: 6,
    marginTop: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cockpit: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B0D2A',
  },
  wingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SPACESHIP_SIZE,
    marginTop: -6,
  },
  spaceshipWingLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderRightWidth: 14,
    borderTopColor: 'transparent',
    borderRightColor: '#2C8FFF',
  },
  spaceshipWingRight: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderLeftWidth: 14,
    borderTopColor: 'transparent',
    borderLeftColor: '#2C8FFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 13, 42, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6B4C',
    marginBottom: 10,
  },
  finalScoreText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: SCREEN_WIDTH - 40,
    marginTop: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  restartButton: {
    backgroundColor: '#FF6B4C',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});