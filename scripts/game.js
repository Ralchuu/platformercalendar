import Player from './player.js';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 64 * 16,
  height: 64 * 9,
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
let walls; // Now using "platform" assets
let platforms; // Now using "wall" assets
let doors = [];
let openedDoors = Array(24).fill(false);

// Player starting position
const playerStartX = 100;
const playerStartY = 500;

function preload() {
  this.load.image("background", "assets/2testbackground.png");
  this.load.image("player", "assets/elf1.png");
  this.load.image("wall", "assets/ground1.png"); // Formerly used for walls
  this.load.image("platform", "assets/ground2.png"); // Formerly used for platforms
  this.load.image("door", "assets/castledoors.png");
}

function create() {
  const bg = this.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Walls group (now using the "platform" asset and its configurations)
  walls = this.physics.add.staticGroup();
  walls.create(200, 200, "platform").setScale(0.5, 10).refreshBody();
  walls.create(100, 250, "platform").setScale(0.5, 10).refreshBody();

  // Platforms group (now using the "wall" asset and its configurations)
  platforms = this.physics.add.staticGroup();
  platforms.create(200, 505, "wall").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "wall").setScale(1, 1).refreshBody();
  platforms.create(500, 600, "wall").setScale(1000, 1).refreshBody();

  // Adding multiple doors for testing
  for (let i = 1; i <= 24; i++) {
    const x = i * 600;
    const y = Phaser.Math.Between(330, 330);
    walls.create(x, y, "platform").setScale(1.5, 0.2).refreshBody();
    const door = this.physics.add.sprite(x, y - 60, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    doors.push(door);
  }

  player = new Player(this, playerStartX, playerStartY, "player", platforms);

  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height);

  // Colliders
  this.physics.add.collider(player, walls);
  this.physics.add.collider(player, platforms);

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
  player.update(cursors, wasd, spaceBar, delta);
}
