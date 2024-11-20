import Player from './player.js';
// kommentti2
// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 1900,
  height: 850,
   physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
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
let walls;
let platforms;
let door;
let isNearDoor = false;  // Flag to check if the player is near the door

// Player starting position
const playerStartX = 100;
const playerStartY = 500;

function preload() {
  this.load.image("background", "assets/2testbackground.png");
  this.load.image("player", "assets/elf1.png");
  this.load.image("wall", "assets/ground1.png");
  this.load.image("platform", "assets/ground2.png");
  this.load.image("door", "assets/castledoors.png");
}

function create() {
  // Expand the world by a factor of 5
  const expandedWidth = config.width * 5;  // 5 times the original width
  const expandedHeight = config.height * 5;  // 5 times the original height

  // Create a larger background to cover the expanded world
  const bg = this.add.tileSprite(0, 0, expandedWidth, expandedHeight, "background").setOrigin(0, 0);
  bg.setDisplaySize(expandedWidth, expandedHeight);

  // Set the physics world bounds to the new dimensions
  this.physics.world.setBounds(0, 0, expandedWidth, expandedHeight);

  // Create walls group
  walls = this.physics.add.staticGroup();
  walls.create(200, 200, "platform").setScale(0.5, 10).refreshBody();
  walls.create(100, 250, "platform").setScale(0.5, 10).refreshBody();
  walls.create(750, 300, "platform").setScale(0.5, 10).refreshBody();
  walls.create(950, 350, "platform").setScale(0.5, 1).refreshBody();
  
  // Platforms group (added more platforms to fill the expanded space)
  platforms = this.physics.add.staticGroup();
  platforms.create(200, 505, "wall").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "wall").setScale(1, 1).refreshBody();
  platforms.create(500, 1000, "wall").setScale(1000, 1).refreshBody();
  platforms.create(800, 400, "wall").setScale(1, 0.5).refreshBody();  // New platform added
  platforms.create(1200, 300, "wall").setScale(1, 0.5).refreshBody();  // New platform added

  // Create a door at a new position (optional)
  door = this.physics.add.sprite(2000, 490, "door");
  door.setImmovable(true);
  door.body.allowGravity = false;

  // Create player
  player = new Player(this, playerStartX, playerStartY, "player", platforms);

  // Camera setup to follow the player
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, expandedWidth, expandedHeight);  // Update camera bounds for the new world size

  // Colliders
  this.physics.add.collider(player, walls);
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(player, door, openDoor, null, this);  // Detect player colliding with door

  // Input configuration
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
  // Update player movements
  player.update(cursors, wasd, spaceBar, cursors.shift, delta);

  // Check if the player is near the door (range of interaction)
  isNearDoor = Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y) < 50;

  // If near the door, allow the player to interact
  if (isNearDoor && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O))) {
    openDoor();  // Call the door open function if 'O' is pressed
  }
}

// Function to simulate the player opening the door
function openDoor() {
  console.log("You opened the door! Transitioning to another scene or location...");
  // You can either load a new scene or change the game state
  // Example: this.scene.start('newRoom');  // Uncomment if you create a new scene
  // For now, we simply log the action
}
