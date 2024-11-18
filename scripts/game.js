import Player from './player.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1900, // Canvas width
  height: 800, // Canvas height
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
let hazard;
let door;
let oKey;

// Player starting position
const playerStartX = 500;
const playerStartY = 200;

// Flags for door interaction
let doorOpened = false;
let inRoom = false;
let previousPosition = { x: 0, y: 0 }; // To store the player's entry position into the room

function preload() {
  this.load.image("background", "assets/2testbackground.png");
  this.load.image("player", "assets/elf1.png");
  this.load.image("platform", "assets/ground1.png");
  this.load.image("hazard", "assets/bomb.png");
  this.load.image("door", "assets/castledoors.png");
  this.load.image("room", "assets/roombackground.png"); // A separate background for the room
}

function create() {
  // Background
  const bg = this.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  // Set world bounds
  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(config.width * 2, 800, "platform").setScale(400, 1).refreshBody();
  platforms.create(60, 720, "platform").setScale(1, 0.5).refreshBody();
  platforms.create(190, 690, "platform").setScale(1, 1).refreshBody();
  platforms.create(320, 660, "platform").setScale(1, 1.5).refreshBody();
  platforms.create(620, 660, "platform").setScale(1, 1.5).refreshBody();
  platforms.create(920, 260, "platform").setScale(1, 1.5).refreshBody();
  
  // Door
  door = this.physics.add.staticSprite(320, 500, "door");
  door.setImmovable(true);
  door.body.allowGravity = false;

  // Create player instance
  player = new Player(this, playerStartX, playerStartY, "player");

  // Camera follows player
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height);

  // Collision between player and platforms
  this.physics.add.collider(player, platforms);

  // Hazard mechanics
  hazard = this.physics.add.staticSprite(400, 280, "hazard").setScale(0.5, 0.5).refreshBody();
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);

  hazard = this.physics.add.staticSprite(700, 400, "hazard").setScale(0.5, 0.5).refreshBody();
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);

  // Add overlap for door
  this.physics.add.overlap(player, door, handleDoorInteraction, null, this);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O); // Key to open the door or exit room
}

function update(time, delta) {
  if (inRoom) {
    // Check if the player wants to exit the room
    if (Phaser.Input.Keyboard.JustDown(oKey)) {
      exitRoom(this);
    }
    return; // Skip the rest of the update code if in room
  }

  player.update(cursors, wasd, spaceBar, delta);

  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-250);
    player.setFlipX(true); // Flip the character when moving left
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(250);
    player.setFlipX(false); // No flip when moving right
  }
}

// Reset player position when hit by hazard
function resetPlayerPosition() {
  player.resetPosition(playerStartX, playerStartY);
}

// Handle door interaction
function handleDoorInteraction() {
  if (!doorOpened && Phaser.Input.Keyboard.JustDown(oKey)) {
    doorOpened = true;
    console.log("Door opened!");
    door.setTexture("room"); // Optional: change door texture to indicate it's open
  }

  if (doorOpened && Phaser.Input.Keyboard.JustDown(oKey)) {
    enterRoom(this);
  }
}

// Transition to a new room
function enterRoom(scene) {
  inRoom = true;

  // Store the player's position when they enter the room
  previousPosition.x = player.x;
  previousPosition.y = player.y;

  // Change the background to a room background
  const roomBg = scene.add.image(0, 0, "room").setOrigin(0, 0);
  roomBg.setDisplaySize(config.width, config.height);

  // Move player to the "room"
  player.setPosition(config.width / 2, config.height - 100); // Slightly higher position

  // Disable other objects in the current scene
  door.disableBody(true, true);
  platforms.clear(true, true);
  hazard.destroy();

  // Hide player temporarily (for re-entry)
  player.setVisible(false);

  console.log("Player entered the room!");
}

// Exit room and return to the main world
function exitRoom(scene) {
  inRoom = false;

  // Recreate the background and other game world objects
  const bg = scene.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  // Re-enable the door
  door.enableBody(true, 400, 650, true, true);

  // Recreate platforms
  platforms.create(config.width * 2, 800, "platform").setScale(400, 1).refreshBody();
  platforms.create(60, 720, "platform").setScale(1, 0.5).refreshBody();
  platforms.create(190, 690, "platform").setScale(1, 1).refreshBody();

  // Recreate hazards
  hazard = scene.physics.add.staticSprite(300, 280, "hazard").setScale(0.5, 0.5).refreshBody();
  scene.physics.add.overlap(player, hazard, resetPlayerPosition, null, scene);

  hazard = scene.physics.add.staticSprite(700, 400, "hazard").setScale(0.5, 0.5).refreshBody();
  scene.physics.add.overlap(player, hazard, resetPlayerPosition, null, scene);

  // Re-enable the camera to follow the player
  scene.cameras.main.startFollow(player);

  // Set player back to previous position, and keep its state
  player.setPosition(previousPosition.x, previousPosition.y + 30); // Adjust Y position so they are slightly above the ground platform
  player.setVisible(true);

  console.log("Player exited the room and returned to the main world!");
}
