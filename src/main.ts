import { Application, Graphics, Text } from 'pixi.js';
import { KeyHandler } from './helpers/keyboard';

enum gameStates {
  "PLAYING",
  "PAUSED",
  "GAME_OVER"
}

let gameState = gameStates.PAUSED;

(async () => {
  let gameContainer = document.getElementById("app");
  const app = new Application();
  await app.init({
    width: 480,
    height: 720,
  });

  gameContainer?.appendChild(app.canvas);

  const player = new Graphics();
  const bullets: Graphics[] = [];
  const enemies: Graphics[] = [];
  const enemySpawnInterval = 2_500;
  const textsStyle = {
    fontSize: 24,
    fill: 0xFFFFFF
  };

  let playerSpeedX = 0;
  let bulletTemplate: Graphics | undefined = undefined;
  let enemyTemplate: Graphics | undefined = undefined;


  let gameText = new Text({
    text: 'Press ENTER to start  the game',
    style: textsStyle
  });

  let gameOverText = new Text({
    text: 'GAME OVER',
    style: textsStyle
  });

  let scoreText = new Text({
    text: 'Score: 0',
    style: textsStyle
  });

  gameText.y = 250;

  gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
  gameOverText.y = 200;

  scoreText.y = 300;

  let lives = 3;
  let level = 1;
  let score = 0;

  player.poly([
    0, 0,
    50, 0,
    25, -25
  ]).fill(0x66CCFF);

  player.x = app.screen.width / 2 - player.width / 2;
  player.y = app.screen.height - 50;

  const arrowLeftHandler = KeyHandler(
    "ArrowLeft",
    () => {
      if (gameState !== gameStates.PLAYING) {
        return;
      }

      playerSpeedX = -500
    },
    () => {
      if (!arrowRightHandler.isDown && !dKeyHandler.isDown) {
        playerSpeedX = 0;
      }
    }
  );

  const aKeyHandler = KeyHandler(
    "a",
    () => {
      if (gameState !== gameStates.PLAYING) {
        return;
      }

      playerSpeedX = -500
    },
    () => {
      if (!arrowRightHandler.isDown && !dKeyHandler.isDown) {
        playerSpeedX = 0;
      }
    }
  );

  const arrowRightHandler = KeyHandler(
    "ArrowRight",
    () => {
      if (gameState !== gameStates.PLAYING) {
        return;
      }

      playerSpeedX = 500
    },
    () => {
      if (!arrowLeftHandler.isDown && !aKeyHandler.isDown) {
        playerSpeedX = 0;
      }
    }
  );

  const dKeyHandler = KeyHandler(
    "d",
    () => {
      if (gameState !== gameStates.PLAYING) {
        return;
      }

      playerSpeedX = 500
    },
    () => {
      if (!arrowLeftHandler.isDown && !aKeyHandler.isDown) {
        playerSpeedX = 0;
      }
    }
  );

  KeyHandler(
    " ",
    () => {
      if (!document.hasFocus() || gameState !== gameStates.PLAYING) {
        return;
      }

      const bullet = createBullet(player);
      bullets.push(bullet);
      app.stage.addChild(bullet);
    }
  );

  KeyHandler(
    'Enter',
    () => {
      if (gameState !== gameStates.PLAYING) {
        if (gameState === gameStates.GAME_OVER) {
          resetGame();
        }
        gameState = gameStates.PLAYING;
        togglePauseText();
      }
    }
  )

  KeyHandler(
    'Escape',
    () => {
      if (gameState !== gameStates.PAUSED) {
        gameState = gameStates.PAUSED;
        gameText.text = 'Press ENTER to resume the game';
        togglePauseText();
      }
    }
  )

  function togglePauseText() {
    if (gameState === gameStates.PAUSED || gameState === gameStates.GAME_OVER) {
      gameText.x = app.screen.width / 2 - gameText.width / 2;
      app.stage.addChild(gameText);
    } else {
      app.stage.removeChild(gameText);
      app.stage.removeChild(gameOverText);
      app.stage.removeChild(scoreText);
    }
  }

  function createBullet(source: Graphics) {
    if (!bulletTemplate) {
      bulletTemplate = new Graphics();
      bulletTemplate
        .circle(0, 0, 5)
        .fill(0xFFCC66);
    };

    const bullet = bulletTemplate.clone();
    bullet.x = source.x + 25;
    bullet.y = source.y - 20;
    return bullet;
  }

  function createEnemy() {
    if (!enemyTemplate) {
      enemyTemplate = new Graphics();
      enemyTemplate
        .poly([
          0, 0,
          50, 0,
          25, 25
        ])
        .fill(0xFF6666);
    }

    const enemy = enemyTemplate.clone();
    enemy.x = 25 + (Math.random() * 480) - 50;
    enemy.y = -50;

    return enemy;
  }

  function spawnEnemy() {
    if (!document.hasFocus()) {
      return;
    }

    const enemy = createEnemy();
    enemies.push(enemy);
    app.stage.addChild(enemy);
  }

  // setInterval(spawnEnemy, enemySpawnInterval);
  let spawnInterval = setInterval(spawnEnemy, enemySpawnInterval);

  function setEnemySpawnInterval() {
    spawnInterval && clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, enemySpawnInterval - (level * 100) + 100);
  }

  function setHudValue(targetId: string, value: number) {
    const target = document.getElementById(targetId);
    if (target) {
      target.innerText = value.toString();
    }
  }

  function resetGame() {
    lives = 3;
    level = 1;
    score = 0;

    setHudValue('gameLives', lives);
    setHudValue('gameScore', score);
    setHudValue('gameLevel', level);

    player.x = app.screen.width / 2 - player.width / 2;
    player.y = app.screen.height - 50;
    bullets.forEach(bullet => app.stage.removeChild(bullet));
    enemies.forEach(enemy => app.stage.removeChild(enemy));
    bullets.length = 0;
    enemies.length = 0;
    setEnemySpawnInterval();
    spawnEnemy();
  }

  setHudValue('gameLives', lives);
  setHudValue('gameScore', score);
  setHudValue('gameLevel', level);

  app.stage.addChild(player);

  togglePauseText();

  app.ticker.add((ticker) => {
    if (gameState !== gameStates.PLAYING) {
      return;
    }

    const delta = ticker.deltaTime / 100;
    player.x += playerSpeedX * delta;

    // bullet movement
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      bullet.y -= 10;

      if (bullet.y < -20) {
        app.stage.removeChild(bullet);
        bullets.splice(i, 1);
      }
    }

    // enemy movement
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      enemy.y += 2.5;

      if (enemy.y > app.screen.height + 50) {
        app.stage.removeChild(enemy);
        enemies.splice(i, 1);

        lives--;
        setHudValue('gameLives', lives);
      }
    }

    // bullet + enemy collision
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];

      for (let j = 0; j < enemies.length; j++) {
        const enemy = enemies[j];

        if (
          bullet.x > enemy.x &&
          bullet.x < enemy.x + 50 &&
          bullet.y > enemy.y &&
          bullet.y < enemy.y + 25
        ) {
          app.stage.removeChild(bullet);
          app.stage.removeChild(enemy);
          bullets.splice(i, 1);
          enemies.splice(j, 1);

          score += 90 + (level * 10);
          setHudValue('gameScore', score);
        }
      }
    }

    // game over
    if (lives <= 0) {
      gameState = gameStates.GAME_OVER;
      gameText.text = 'Press ENTER to restart the game';
      scoreText.text = `Score: ${score}`;
      scoreText.x = app.screen.width / 2 - scoreText.width / 2;
      app.stage.addChild(gameOverText);
      togglePauseText();
      app.stage.addChild(scoreText);
    }

    // increase difficulty
    if (score >= (level * 1000) + (level * 100) - 100) {
      level++;
      setHudValue('gameLevel', level);
      setEnemySpawnInterval();
    }
  })
})();
