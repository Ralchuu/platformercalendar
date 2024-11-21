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
    this.load.image("door", "assets/door.png");
    this.load.image("cabin1", "assets/cabin1.png");
    this.load.image("cabin2", "assets/cabin2.png");
  }

  create() {
    const bg = this.add
      .tileSprite(0, 0, worldWidth, worldHeight, "background") // Background covering world
      .setOrigin(0, 0);
    bg.setDisplaySize(worldWidth, worldHeight);

    // Set the new world bounds
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // Walls group
    this.walls = this.physics.add.staticGroup();
    this.walls.create(120, 1980, "wall").setScale(0.5, 10).refreshBody();
    this.walls.create(20, 2050, "wall").setScale(0.5, 10).refreshBody();

    // Platforms group
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(10, 2340, "platform").setScale(1000, 1).refreshBody(); //lattia 

    // Alku - Luukku 1
    this.platforms.create(300, 2245, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(400, 2210, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(650, 2210, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(900, 2210, "platform").setScale(1, 1).refreshBody();    
    this.platforms.create(1027, 2210, "platform").setScale(1, 1).setFlipX(true).refreshBody();    

    // luukku 1 - 2
    this.platforms.create(900 + 300, 2100, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(1100 + 300, 2030, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(1300 + 300, 1960, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(1500 + 300, 1890, "platform").setScale(1, 0.2).refreshBody(); 

    // Hazards group
    this.hazards = this.physics.add.staticGroup();
    this.hazards.create(400, 2000, "hazard").setScale(0.5).refreshBody();

    // doors (rooms 1 to 24)
    this.doors = [
      this.createDoor(965, 2110, "Room1").setScale(0.3).setDepth(1),
      this.createDoor(1400, 2240, "Room2").setScale(0.3).setDepth(1),
      this.createDoor(1800, 2240, "Room3").setScale(0.3).setDepth(1),
      this.createDoor(2300, 2240, "Room4").setScale(0.3).setDepth(1),
      this.createDoor(2600, 2240, "Room5").setScale(0.3).setDepth(1),
    ];

    // Add cabins behind doors based on room number (odd/even)
    this.doors.forEach((door) => {
      const targetRoom = door.getData("targetRoom"); // Get target room name
      const roomNumber = parseInt(targetRoom.replace("Room", ""), 10);

      // Attach cabin1 for odd rooms and cabin2 for even rooms
      if (roomNumber % 2 === 1) {
        this.add.image(door.x, door.y - 39, "cabin1").setScale(1.5).setDepth(0); // Attach cabin1
      } else {
        this.add.image(door.x, door.y - 44, "cabin2").setScale(1.4).setDepth(0); // Attach cabin2
      }
    });
    // Create player at the starting position
    this.player = new Player(
      this,
      playerStartX,
      playerStartY,
      "player",
      this.platforms
    );
    this.player.setDepth(3);

    // Camera setup
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Colliders for the player
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
    this.spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createDoor(x, y, targetRoom) {
    const door = this.physics.add.sprite(x, y, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    door.body.setEnable(false);
    door.setData("targetRoom", targetRoom); // Store the target room name
    return door;
  }

  update(time, delta) {
    // Update player movements
    this.player.update(
      this.cursors,
      this.wasd,
      this.spaceBar,
      this.cursors.shift,
      delta
    );

    // Check if the player is interacting with any door
    this.doors.forEach((door) => {
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          door.x,
          door.y
        ) < 50 &&
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

// Game initialization
const worldWidth = 64 * (16 * 4); //expanded width
const worldHeight = 64 * (9 * 4); //expanded height

const config = {
  type: Phaser.AUTO,
  width: 64 * 16, // Camera size
  height: 64 * 9, // Camera size
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2500 },
      debug: false,
    },
  },
  scene: [MainGameScene, Room1, Room2, Room3], // Keep the scenes as they are
};

// Initialize the game
const game = new Phaser.Game(config);

const playerStartX = 100;
const playerStartY = 500 + 1700;
