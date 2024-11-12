const config = {
  type: Phaser.AUTO,
  width: 64*16,
  height: 64*9,
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

function preload() {
  this.load.image("player", "assets/player.png");
  this.load.image("platform", "assets/platform.png");
}

function create() {
  platforms = this.physics.add.staticGroup();

  const platform1 = platforms.create(400, 600, "platform").setScale(100, 2);
  platform1.refreshBody();

  const platform2 = platforms.create(300, 500, "platform").setScale(1.5, 0.5);
  platform2.refreshBody();
  const platform3 = platforms.create(400, 500, "platform").setScale(1.5, 0.5);
  platform3.refreshBody();

  player = this.physics.add.sprite(400, 300, "player");
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, platforms, () => {
    if(player.body.touching.down)
{    canJump = true;
    coyoteTimer = 0;}

    if (jumpBufferTimer > 0 && jumpButtonPressed) {
      player.setVelocityY(-330);
      jumpBufferTimer = 0;
      jumpButtonPressed = false;
    }
  });

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
