import Player from "../player.js";

class Room3 extends Phaser.Scene {
  constructor() {
    super("Room3");
  }

  preload() {
    this.load.image("background", "assets/2testbackground.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground1.png");
    this.load.image("door", "assets/castledoors.png");
  }

  create(data) {
    this.width = 1024;
    this.height = 576;

    const playerStartX = data?.playerStartX || 100;
    const playerStartY = data?.playerStartY || 500;

    const bg = this.add
      .tileSprite(0, 0, this.width * 2, this.height, "background")
      .setOrigin(0, 0);
    bg.setDisplaySize(this.width * 2, this.height);

    this.physics.world.setBounds(0, 0, this.width * 2, this.height);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(300, 505, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(500, 470, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(500, 600, "platform").setScale(1000, 1).refreshBody();

    this.player = new Player(this, playerStartX, playerStartY, "player", this.platforms);

    this.returnDoor = this.physics.add.sprite(200, 400, "door");
    this.returnDoor.setImmovable(true);
    this.returnDoor.body.allowGravity = false;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.width * 2, this.height);

    this.physics.add.collider(this.player, this.platforms);

    // Setup cursor keys and WASD keys
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time, delta) {
    // Update player movement and dash input
    this.player.update(this.cursors, this.wasd, this.spaceBar, this.shiftKey, delta);

    // Check if the player is near the door and presses 'E' to transition
    if (
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnDoor.x, this.returnDoor.y) < 50 &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      this.scene.start("MainGameScene");  // Transition to main scene
    }
  }
}

export default Room3;
