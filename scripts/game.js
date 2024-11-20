import Player from "./player.js";
import Room1 from "./rooms/room1.js";
import Room2 from "./rooms/room2.js";
import Room3 from "./rooms/room3.js";

// Main game scene class
class MainGameScene extends Phaser.Scene {
  constructor() {
    super("MainGameScene");

    // Declare game objects and state variables
    this.walls = null;
    this.platforms = null;
    this.hazards = null;
    this.doors = [];
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.spaceBar = null;
    this.eKey = null;
  }

  preload() {
    this.load.image("background", "assets/2testbackground.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground1.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("hazard", "assets/bomb.png");
    this.load.image("door", "assets/castledoors.png");
  }

  create() {
    const bg = this.add
      .tileSprite(0, 0, config.width * 2, config.height, "background")
      .setOrigin(0, 0);
    bg.setDisplaySize(config.width * 2, config.height);

    this.physics.world.setBounds(0, 0, config.width * 2, config.height);

    // Walls group
    this.walls = this.physics.add.staticGroup();
    this.walls.create(250, 180, "wall").setScale(0.5, 0.6).refreshBody();
    this.walls.create(50, 250, "wall").setScale(0.7, 0.6).refreshBody();
    this.walls.create(750, 300, "wall").setScale(0.5, 0.5).refreshBody();
    this.walls.create(1050, 350, "wall").setScale(0.5, 0.5).refreshBody();

    // Platforms group
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(200, 505, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(400, 470, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(500, 600, "platform").setScale(1000, 1).refreshBody();

    // Hazards group
    this.hazards = this.physics.add.staticGroup();
    this.hazards.create(400, 250, "hazard").setScale(0.5).refreshBody();

    // Create individual doors with unique locations and target rooms
    this.doors = [
      this.createDoor(200, 425, "Room1"),
      this.createDoor(800, 400, "Room2"),
      this.createDoor(1400, 400, "Room3"),
    ];

    // Create player
    this.player = new Player(this, playerStartX, playerStartY, "player", this.platforms);

    // Camera setup
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, config.width * 2, config.height); // Set world bounds

    // Colliders
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.platforms);

    // Reset player on touching hazards
    this.physics.add.collider(this.player, this.hazards, () => {
      this.player.resetPosition(playerStartX, playerStartY);
    });

    // Input configuration
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createDoor(x, y, targetRoom) {
    const door = this.physics.add.sprite(x, y, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    door.setData("targetRoom", targetRoom); // Store the target room name
    return door;
  }

  update(time, delta) {
    // Update player movements
    this.player.update(this.cursors, this.wasd, this.spaceBar, this.cursors.shift, delta);

    // Check if the player is interacting with any door
    this.doors.forEach((door) => {
      if (
        Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y) < 50 &&
        Phaser.Input.Keyboard.JustDown(this.eKey) // Check for "E" key press
      ) {
        const targetRoom = door.getData("targetRoom"); // Get the target room name
        if (targetRoom) {
          // Transition to the target room
          this.scene.start(targetRoom, {
            playerStartX: this.player.x,
            playerStartY: this.player.y,
          });
        }
      }
    });
  }
}

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
  scene: [MainGameScene, Room1, Room2, Room3],
};

const game = new Phaser.Game(config);

const playerStartX = 100;
const playerStartY = 500;
