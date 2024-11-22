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
    this.savepoints = [];
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.spaceBar = null;
    this.eKey = null;
  }

  // Save & load the game
  saveGame(x, y) {
    let saveObject = {
      x: x,
      y: y - 20
    };
    console.log("Saved coordinates x: " + x + ", y: " + y);
    localStorage.setItem("save", JSON.stringify(saveObject));
  }

  loadGame() {
    let saveObject = JSON.parse(localStorage.getItem("save"));
    try {
      this.player.setPosition(saveObject.x, saveObject.y);
    } catch (error) {
      console.log("No save file to load");
    }
  }

  preload() {
    this.load.image("background", "assets/2testbackground.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground1.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("hazard", "assets/bomb.png");
    this.load.image("door", "assets/castledoors.png");
    this.load.image("savepoint", "assets/savepoint.png");
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

    // luukku 1
    this.platforms.create(300, 2245, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(400, 2210, "platform").setScale(1, 1).refreshBody();

    //luukku 1 - 2
    this.platforms.create(650, 2210, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(900, 2210, "platform").setScale(1, 1).refreshBody();

    //luukku 2 - 3
    this.platforms
      .create(1100, 2100, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1300, 2030, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1500, 1960, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1700, 1890, "platform")
      .setScale(1, 0.2)
      .refreshBody();

    // Hazards group
    this.hazards = this.physics.add.staticGroup();
    this.hazards.create(400, 2000, "hazard").setScale(0.5).refreshBody();

    // Create individual doors
    this.doors = [
      this.createDoor(903, 2100, "Room1"),
      this.createDoor(1100, 2230, "Room2"),
      this.createDoor(1000, 2230, "Room3")
    ];

    // List of all savepoint coordinates
    let savepointCoordinates = [{ x: 400, y: 2125 }, { x: 650, y: 2125 }];

    // Adding savepoints to listed coordinates
    for (let i = 0; i < savepointCoordinates.length; i++) {
      let x = savepointCoordinates[i].x;
      let y = savepointCoordinates[i].y;
      let savepoint = this.physics.add.sprite(x, y, "savepoint");
      savepoint.setImmovable(true);
      savepoint.body.allowGravity = false;
      this.savepoints.push(savepoint);
    }

    // Create player at the starting position
    this.player = new Player(
      this,
      playerStartX,
      playerStartY,
      "player",
      this.platforms
    );

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
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.loadGame();
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
    this.player.update(
      this.cursors,
      this.wasd,
      this.spaceBar,
      this.cursors.shift,
      delta
    );

    // Check if the player is interacting with any door
    this.doors.forEach(door => {
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
            playerStartY: this.player.y
          });
        }
      }
    });

    // Save coordinates of savepoint if close and pressing E
    this.savepoints.forEach(savepoint => {
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          savepoint.x,
          savepoint.y
        ) < 50 &&
        Phaser.Input.Keyboard.JustDown(
          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        )
      ) {
        this.saveGame(savepoint.x, savepoint.y);
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
      debug: false
    }
  },
  scene: [MainGameScene, Room1, Room2, Room3] // Keep the scenes as they are
};

// Initialize the game
const game = new Phaser.Game(config);

const playerStartX = 100;
const playerStartY = 500 + 1700;
