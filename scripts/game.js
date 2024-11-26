import Player from "./player.js";

import Room1 from "./rooms/room1.js";
import Room2 from "./rooms/room2.js";
import Room3 from "./rooms/room3.js";

// Main game scene class
class MainGameScene extends Phaser.Scene {
  constructor() {
    super("MainGameScene");

    this.developerModeIsOn = false;

    // Declare game objects and state variables
    this.walls = null;
    this.platforms = null;
    this.hazards = null;
    this.doors = [];
    this.instructions = [];
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.spaceBar = null;
    this.eKey = null;
    this.qKey = null;
    this.ctrlKey = null;
  }

  // Save & load the game
  saveGame(x, y) {
    let shown = [];
    this.instructions.forEach((inst) => {
      shown.push(inst.shown);
    });
    let saveObject = {
      x: x,
      y: y - 20,
      devMode: this.developerModeIsOn,
      showedMessages: shown,
    };
    console.log("Saved coordinates x: " + x + ", y: " + y);
    localStorage.setItem("save", JSON.stringify(saveObject));
  }

  loadGame() {
    let saveObject = JSON.parse(localStorage.getItem("save"));
    try {
      this.player.setPosition(saveObject.x, saveObject.y); // Set saved coordinates
      this.developerModeIsOn = saveObject.devMode; // Set saved developer mode status
      for (let i = 0; i < this.instructions.length; i++) {
        this.instructions[i].shown = saveObject.showedMessages[i];
      }

      this.updateDevModeText(); // Update the displayed text
      let gameLoadedText = this.add.text(
        10,
        10,
        "Game loaded\nPress [Ctrl] + [Q] to restart game",
        {
          font: "20px Arial",
          fill: "#32141c",
          align: "center",
          backgroundColor: "#c99b70",
        }
      );
      gameLoadedText.setScrollFactor(0); // Ensure text stays fixed on screen
      gameLoadedText.setDepth(5);
      this.time.delayedCall(3000, () => {
        gameLoadedText.destroy();
      });
    } catch (error) {
      console.log("Failed to load game");
    }
  }

  showTextBox(x, y, message, timer) {
    let textStyle = {
      font: "20px Arial",
      fill: "#32141c",
      align: "center",
      backgroundColor: "rgba(236, 182, 132, 0.7)", // Set background color
    };

    const messageTextObject = this.add.text(x, y, message, textStyle);

    // Destroy the text after timer runs out
    this.time.delayedCall(timer, () => {
      messageTextObject.destroy();
    });
  }

  preload() {
    this.load.image("background", "assets/2testbackground.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground1.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("hazard", "assets/hazard_down.png");
    this.load.image("door", "assets/door.png");
    this.load.image("cabin1", "assets/cabin1.png");
    this.load.image("cabin2", "assets/cabin2.png");
    this.load.image("savepoint", "assets/savepoint.png");
    this.load.audio("hazardSound", "assets/audio/spikeSplatter_01.wav");
    this.load.audio("doorLocked", "assets/audio/oviLukossa_01.wav");
    this.load.audio("doorOpened", "assets/audio/ovenAvaus_01.wav");
  }

  create() {
    const bg = this.add.tileSprite(
      0,
      250,
      worldWidth,
      worldHeight,
      "background"
    ); // Background covering world
    // background image dimensions: 1024 * 2048
    bg.setOrigin(0, 0);
    bg.setDisplaySize(10250, 2280);

    // Set the new world bounds
    this.physics.world.setBounds(0, 0, 8000, 8000);

    // Walls group
    // X = HORIZONTAL, higher number = further right
    // Y = VERTICAL, higher number = further down
    this.walls = this.physics.add.staticGroup();

    this.walls.create(2080, 1800, "wall").setScale(4, 30).refreshBody();
    this.walls.create(2350, 1530, "wall").setScale(4, 35).refreshBody();
    this.walls.create(2600, 1800, "wall").setScale(4, 30).refreshBody();
    this.walls
      .create(3630 + 50, 1700, "wall")
      .setScale(8, 25)
      .refreshBody();
    this.walls
      .create(4050 + 50, 1800, "wall")
      .setScale(8, 30)
      .refreshBody(); // piikkejä seinään?

    // Add text to display developer mode status
    this.devModeText = this.add.text(10, 10, "Dev Mode (B): OFF", {
      fontSize: "20px",
      fill: "#ffffff", // White text
    });

    this.devModeText.setScrollFactor(0); // Ensure text stays fixed on screen
    this.devModeText.setDepth(4);

    // Add the 'B' key for toggling developer mode
    this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    const devModeBg = this.add.rectangle(60, 20, 330, 30, 0x000000, 0.3); // Black background with 50% opacity
    devModeBg.setScrollFactor(0); // Ensure the background stays fixed on screen
    devModeBg.setDepth(3);

    // Platforms group
    // X = HORIZONTAL, higher number = further right
    // Y = VERTICAL, higher number = further down
    //platform width approx 125, height 25
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(10, 2340, "platform").setScale(1000, 1).refreshBody(); //lattia

    // Alku - Luukku 1
    this.platforms.create(300, 2245, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(400, 2210, "platform").setScale(1, 1).refreshBody();

    this.platforms.create(650, 2210, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(900, 2210, "platform").setScale(1, 1).refreshBody();
    this.platforms
      .create(1027, 2210, "platform")
      .setScale(1, 1)
      .setFlipX(true)
      .refreshBody(); //ovi 1

    // luukku 1 - 2
    this.platforms
      .create(900 + 300, 2100, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1100 + 300, 2030, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1300 + 300, 1960, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1950, 1890, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1835, 1890, "platform")
      .setScale(1, 0.2)
      .setFlipX(true)
      .refreshBody(); //ovi 2

    //luukku 2 - 3
    this.platforms
      .create(1600, 1800, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1390, 1710, "platform")
      .setScale(1, 0.2)
      .refreshBody();

    this.platforms
      .create(1180, 1620, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1065, 1620, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //ovi 3

    //luukku 3 - 4
    this.platforms
      .create(1065 - 125, 1645, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms.create(815, 1620, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(600, 1550, "platform").setScale(1, 0.2).refreshBody(); //ovi 4

    // luukku 4 - 5
    // Platforms group
    // X = HORIZONTAL, higher number = further right
    // Y = VERTICAL, higher number = further down
    //platform width approx 125, height 25
    this.platforms.create(600, 1550, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(400, 1470, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(200, 1400, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(75, 1400, "platform").setScale(1, 0.2).refreshBody(); //OVI 4

    this.platforms.create(400, 1330, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(600, 1260, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(725, 1260, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(850, 1260, "platform").setScale(1, 0.2).refreshBody(); //ovi 5
    this.platforms.create(975, 1260, "platform").setScale(1, 0.2).refreshBody();

    // luukku 5 - 6
    this.platforms.create(975, 1260, "platform").setScale(1, 0.2).refreshBody();
    this.platforms
      .create(1100, 1260, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1275, 1190, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1450, 1120, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1450 + 125, 1350, "platform")
      .setScale(1, 0.2)
      .refreshBody(); // JOULUKUUSI TÄHÄN
    this.platforms
      .create(1450 + 250, 1120, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(1900, 1190, "platform")
      .setScale(1, 0.2)
      .refreshBody(); // ovi 6

    // luukku 6 - 7
    // OVI 7 _LATTIALLE_ KOHTAAN x: 2200, y: 2250 !!!!!!!

    // luukku 7 - 8
    this.platforms
      .create(2720, 1330, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(2845, 1330, "platform")
      .setScale(1, 0.2)
      .refreshBody(); // ovi 8

    //luukku 8 - 9
    this.platforms
      .create(3100, 1800, "platform")
      .setScale(3, 7.5)
      .refreshBody();
    //ovi 9 lattialle kohtaan x: 3620, y: 2240

    //OVI 9 - 10
    this.platforms
      .create(4300 - 7, 1335, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //ovi 10
    this.platforms
      .create(4425 - 7, 1335, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    100;
    this.platforms
      .create(4950, 1130, "platform")
      .setScale(1, 0.2)
      .refreshBody();

    this.platforms
      .create(5140 - 120, 1500, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //joulukuusi tähän
    this.platforms
      .create(5140 - 120 + 125, 1500, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //joulukuusi

    this.platforms
      .create(5190, 1130, "platform")
      .setScale(1, 0.2)
      .refreshBody();
    this.platforms
      .create(5190 + 125, 1130, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //ovi 11

    // Hazards group
    this.hazards = this.physics.add.staticGroup();
    this.hazards.create(400, 2000, "hazard").setScale(0.5).refreshBody();

    this.hazardSound = this.sound.add("hazardSound");
    this.hazardSound.setVolume(0.4); // Set volume (0.0 to 1.0)

    // Door sounds
    this.doorLocked = this.sound.add("doorLocked");
    this.doorLocked.setVolume(0.3);

    this.doorOpened = this.sound.add("doorOpened");
    this.doorOpened.setVolume(0.6);

    // doors (rooms 1 to 24)
    //! update: 1-11 done, 12-24 left to do
    this.doors = [
      this.createDoor(965, 2110, "Room1").setScale(0.3).setDepth(1),
      this.createDoor(1900, 1840, "Room2").setScale(0.3).setDepth(1),
      this.createDoor(1130, 1575, "Room3").setScale(0.3).setDepth(1),
      this.createDoor(140, 1350, "Room4").setScale(0.3).setDepth(1),
      this.createDoor(850, 1210, "Room5").setScale(0.3).setDepth(1),
      this.createDoor(2080, 1290, "Room6").setScale(0.3).setDepth(1),
      this.createDoor(2355, 2240, "Room7").setScale(0.3).setDepth(1),
      this.createDoor(3100, 1290, "Room8").setScale(0.3).setDepth(1),
      this.createDoor(3675, 2240, "Room9").setScale(0.3).setDepth(1),
      this.createDoor(4360, 1285, "Room10").setScale(0.3).setDepth(1),
      this.createDoor(5255, 1080, "Room11").setScale(0.3).setDepth(1),
    ];

    // Add cabins behind doors based on room number (odd/even)
    this.doors.forEach((door) => {
      const targetRoom = door.getData("targetRoom"); // Get target room name
      const roomNumber = parseInt(targetRoom.replace("Room", ""), 10);

      // Attach cabin1 for odd rooms and cabin2 for even rooms
      if (roomNumber % 2 === 1) {
        this.add
          .image(door.x, door.y - 39, "cabin1")
          .setScale(1.5)
          .setDepth(0); // Attach cabin1
      } else {
        this.add
          .image(door.x, door.y - 44, "cabin2")
          .setScale(1.4)
          .setDepth(0); // Attach cabin2
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
    this.cameras.main.setBounds(0, 0, 8000, 8000);
    this.cameras.main.setZoom(1); // Set the zoom level

    // Colliders for the player
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.platforms);

    // Reset player on touching hazards
    this.physics.add.collider(this.player, this.hazards, () => {
      this.hazardSound.play();
      this.loadGame();
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
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

    // Instruction messages
    this.instructions = [
      {
        x: playerStartX,
        y: playerStartY + 20,
        shown: false,
        message: "Use keys [A] and [D]\nor [←] and [→] to move",
      },
      {
        x: playerStartX + 120,
        y: playerStartY + 20,
        shown: false,
        message: "Press [W] or [space]\nto jump",
      },
      {
        x: this.doors[0].x - 80,
        y: this.doors[0].y - 20,
        shown: false,
        message: "Press [E]\nto open door",
      },
    ];

    // Loading the game
    this.loadGame();
  }

  createDoor(x, y, targetRoom) {
    const door = this.physics.add.sprite(x, y, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    door.body.setEnable(false);
    door.setData("targetRoom", targetRoom); // Store the target room name
    return door;
  }

  updateDevModeText() {
    this.devModeText.setText(
      `Dev Mode (B): ${this.developerModeIsOn ? "ON" : "OFF"}`
    );
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

    if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
      this.developerModeIsOn = !this.developerModeIsOn; // Toggle mode
      this.updateDevModeText(); // Update the displayed text
    }

    // Clearing the save file when ctrl+q is pressed
    if (Phaser.Input.Keyboard.JustDown(this.qKey) && Phaser.Input.Keyboard.JustDown(this.ctrlKey)) {
      if (localStorage.getItem("save") != null) localStorage.removeItem("save");
      location.reload();
    }

    // Show instruction messages at set coordinates
    this.instructions.forEach((inst) => {
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          inst.x,
          inst.y
        ) < 40 &&
        inst.shown == false
      ) {
        this.showTextBox(inst.x - 100, inst.y - 60, inst.message, 2500);
        inst.shown = true;
      }
    });

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
        // Määritellään pvm-muuttuja päivän tarkistusta varten
        const month = 11; // Kuukausien indeksi alkaa 0:sta, joten 11 on joulukuu
        const year = 2024;
        const currentDate = new Date();

        const targetRoom = door.getData("targetRoom"); // Get the target room name
        if (targetRoom) {
          const roomNumber = parseInt(targetRoom.replace("Room", ""), 10);
          let doorDate = new Date(year, month, roomNumber);

          if (currentDate < doorDate && this.developerModeIsOn == false) {
            let timeDifference = doorDate - currentDate;
            let daysLeft = Math.ceil(timeDifference / (24 * 60 * 60 * 1000)); // Muuttaa millisekunnit päiviksi?
            let doorMessageText =
              "No access yet!\nThis door can be opened\nin " +
              daysLeft +
              " days."; // rivinvaihto = \n

            this.doorLocked.play();
            // Made message into its own function, found on row 49
            this.showTextBox(door.x - 100, door.y - 200, doorMessageText, 4000);
          } else {
            // Transition to the target room
            this.doorOpened.play();
            this.scene.start(targetRoom, {
              playerStartX: this.player.x,
              playerStartY: this.player.y,
            });
          }
          this.saveGame(this.player.x, this.player.y);
        }
      }
    });
  }
}

const worldWidth = 64 * (16 * 4); // world width
const worldHeight = 64 * (9 * 4); // world height

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
  scene: [MainGameScene, Room1, Room2, Room3],
};

// Initialize the game
const game = new Phaser.Game(config);

const playerStartX = 100;
const playerStartY = 500 + 1700;
