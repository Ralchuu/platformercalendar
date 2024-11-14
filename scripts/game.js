import Player from './player.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 64 * 16, // Canvas width
  height: 64 * 9, // Canvas height
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2500 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let wasd;
let spaceBar;
let platforms;
let doors = [];
let openedDoors = Array(24).fill(false); // Tracks whether each door is opened
let hazard;

// Player starting position
const playerStartX = 100;
const playerStartY = 300;

function preload() {
  this.load.image("background", "assets/2testbackground.png");
  this.load.image("player", "assets/elf1.png");
  this.load.image("platform", "assets/ground1.png");
  this.load.image("door", "assets/castledoors.png");
  this.load.image("hazard", "assets/bomb.png");
}

function create() {
  // Background
  const bg = this.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  // Set world bounds
  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(config.width * 2, 600, "platform").setScale(400, 1).refreshBody();
  platforms.create(200, 505, "platform").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "platform").setScale(1, 1).refreshBody();

  for (let i = 1; i <= 24; i++) {
    const x = i * 600;
    const y = Phaser.Math.Between(330, 330);
    platforms.create(x, y, "platform").setScale(1.5, 0.2).refreshBody();
    const door = this.physics.add.sprite(x, y - 60, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    doors.push(door);
  }

  // Create player instance
  player = new Player(this, playerStartX, playerStartY, "player");

  // Camera follows player
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height);

  // Collision between player and platforms
  this.physics.add.collider(player, platforms, () => {
    if (player.body.touching.down) {
      player.canJump = true;
      player.coyoteTimer = 0;
    }
  });

  // Hazard mechanics
  hazard = this.physics.add.staticSprite(300, 280, "hazard").setScale(0.5, 0.5).refreshBody();
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);

  hazard = this.physics.add.staticSprite(700, 400, "hazard").setScale(0.5, 0.5).refreshBody();
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);

  // Add overlap for doors
  doors.forEach((door, index) => {
    this.physics.add.overlap(player, door, () => openDoor(index), null, this);
  });

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update(time, delta) {
  player.update(cursors, wasd, spaceBar, delta);
  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-250);
    player.setFlipX(true);  // Flip the character when moving left
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(250);
    player.setFlipX(false);  // No flip when moving right
  }
}

// Reset player position when hit by hazard
function resetPlayerPosition() {
  player.resetPosition(playerStartX, playerStartY);
}

// Open door interaction
function openDoor(index) {
  if (!openedDoors[index]) {
    openedDoors[index] = true;
    console.log(`Door ${index + 1} opened!`);
  }
}
