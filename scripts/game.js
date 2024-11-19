import Player from "./player.js";

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
let walls;
let platforms;
let hazards;
let doors = [];
let openedDoors = Array(24).fill(false);

// Player starting position
const playerStartX = 100;
const playerStartY = 500;

function preload() {
  this.load.image("background", "assets/2testbackground.png");
  this.load.image("player", "assets/elf1.png");
  this.load.image("platform", "assets/ground1.png");
  this.load.image("wall", "assets/wall.png");
  this.load.image("hazard", "assets/bomb.png");
  this.load.image("door", "assets/castledoors.png");
}

function create() {
  const bg = this.add
    .tileSprite(0, 0, config.width * 2, config.height, "background")
    .setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Walls group
  walls = this.physics.add.staticGroup();
  walls.create(250, 180, "wall").setScale(0.5, 0.6).refreshBody();
  walls.create(50, 250, "wall").setScale(0.7, 0.6).refreshBody();
  walls.create(750, 300, "wall").setScale(0.5, 0.5).refreshBody();
  walls.create(1050, 350, "wall").setScale(0.5, 0.5).refreshBody();

  // Platforms group
  platforms = this.physics.add.staticGroup();
  platforms.create(200, 505, "platform").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "platform").setScale(1, 1).refreshBody();
  platforms.create(500, 600, "platform").setScale(1000, 1).refreshBody();

  // Hazards group
  hazards = this.physics.add.staticGroup();
  hazards.create(400, 250, "hazard").setScale(0.5).refreshBody();


  // Adding multiple doors
  for (let i = 1; i <= 24; i++) {
    const x = i * 600;
    const y = Phaser.Math.Between(330, 330);
    walls.create(x, y, "platform").setScale(1.5, 0.2).refreshBody();
    const door = this.physics.add.sprite(x, y - 60, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    doors.push(door);
  }

  // Create player
  player = new Player(this, playerStartX, playerStartY, "player", platforms);

  // Camera setup
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height); // Set world bounds

  // Colliders
  this.physics.add.collider(player, walls);
  this.physics.add.collider(player, platforms);

  // Reset player on touching hazards
  this.physics.add.collider(player, hazards, () => {
    player.resetPosition(playerStartX, playerStartY);
  });

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
}
