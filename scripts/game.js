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
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let wasd;
let spaceBar;
let canJump = false;
let jumpButtonPressed = false;
let jumpButtonReleased = true;
let coyoteTime = 100;
let coyoteTimer = 0;
let jumpBufferTime = 20;
let jumpBufferTimer = 0;
let platforms;
let doors = [];
let openedDoors = Array(24).fill(false); // Tracks whether each door is opened
let hazard;

// Player starting position
const playerStartX = 100;
const playerStartY = 300;

function preload() {
  this.load.image("background", "assets/2testbackground.png"); // Replace with your actual background path
  this.load.image("player", "assets/elf1.png");
  this.load.image("platform", "assets/ground1.png");
  this.load.image("door", "assets/castledoors.png"); // Placeholder for doors
  this.load.image("hazard", "assets/bomb.png"); // Placeholder for hazard object
}

function create() {
    // Add the background as a repeating tile
  const bg = this.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  
   // Set the background size to match the world bounds (make it scroll with the camera)
   bg.setDisplaySize(config.width * 2, config.height);

  // Extend world bounds (making it wider than the canvas width)
  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Add platforms
  platforms = this.physics.add.staticGroup();

  // Ground platform
  platforms.create(config.width * 2, 600, "platform").setScale(400, 1).refreshBody();

  // The platform will be at position (400, 568)
  platforms.create(200, 505, "platform").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "platform").setScale(1, 1).refreshBody();  

  // Additional platforms and doors
  for (let i = 1; i <= 24; i++) {
    const x = i * 600; // Position doors every 500px to the right
    const y = Phaser.Math.Between(330, 330); // Random platform height
    platforms.create(x, y, "platform").setScale(1.5, 0.2).refreshBody();
    const door = this.physics.add.sprite(x, y - 60, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    doors.push(door);
  }

  // Add player
  player = this.physics.add.sprite(playerStartX, playerStartY, "player");
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // Camera follows the player
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height);

  // Collide player with platforms
  this.physics.add.collider(player, platforms, () => {
    if (player.body.touching.down) {
      canJump = true;
      coyoteTimer = 0;
    }
    if (jumpBufferTimer > 0 && jumpButtonPressed) {
      player.setVelocityY(-330);
      jumpBufferTimer = 0;
      jumpButtonPressed = false;
    }
  });

  // Hazard mechanic
  hazard = this.physics.add.staticSprite(300, 280, "hazard").setScale(0.5, 0.5).refreshBody();;
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);

  hazard = this.physics.add.staticSprite(700, 400, "hazard").setScale(0.5, 0.5).refreshBody();;
  this.physics.add.overlap(player, hazard, resetPlayerPosition, null, this);


  // Add overlap for doors
  doors.forEach((door, index) => {
    this.physics.add.overlap(player, door, () => openDoor(index), null, this);
  });

  // Add controls
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
  player.setVelocityX(0);

  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-250);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(250);
  }

  if (!player.body.touching.down) {
    coyoteTimer += delta;
    if (coyoteTimer > coyoteTime) {
      canJump = false;
    }
  } else {
    canJump = true;
  }

  if (!cursors.up.isDown && !wasd.up.isDown && !spaceBar.isDown) {
    jumpButtonReleased = true;
  }

  if (
    (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
    jumpButtonReleased &&
    !jumpButtonPressed
  ) {
    if (canJump) {
      player.setVelocityY(-700);
      canJump = false;
      jumpButtonPressed = true;
      jumpButtonReleased = false;
    } else {
      jumpBufferTimer = jumpBufferTime;
      jumpButtonPressed = true;
    }
  }

  if (jumpBufferTimer > 0) {
    jumpBufferTimer -= delta;
  }

  if (
    jumpButtonPressed &&
    !cursors.up.isDown &&
    !wasd.up.isDown &&
    !spaceBar.isDown
  ) {
    jumpButtonPressed = false;
  }
}

// Function to reset player position upon collision with hazard
function resetPlayerPosition() {
  player.setPosition(playerStartX, playerStartY);
  player.setVelocity(0, 0); // Stop any momentum
}

// Function to open a door
function openDoor(index) {
  if (!openedDoors[index]) {
    openedDoors[index] = true;
    console.log(`Door ${index + 1} opened!`);
  }
}
