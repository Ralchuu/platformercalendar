import Player from "./player.js";

import Room1 from "./rooms/room1.js";
import Room2 from "./rooms/room2.js";
import Room3 from "./rooms/room3.js";
import Room4 from "./rooms/room4.js";
import Room5 from "./rooms/room5.js";
import Room6 from "./rooms/room6.js";
import Room7 from "./rooms/room7.js";
import Room8 from "./rooms/room8.js";
import Room9 from "./rooms/room9.js";
import Room10 from "./rooms/room10.js";
import Room11 from "./rooms/room11.js";
import Room12 from "./rooms/room12.js";
import Room13 from "./rooms/room13.js";
import Room14 from "./rooms/room14.js";
import Room15 from "./rooms/room15.js";
import Room16 from "./rooms/room16.js";
import Room17 from "./rooms/room17.js";
import Room18 from "./rooms/room18.js";
import Room19 from "./rooms/room19.js";
import Room20 from "./rooms/room20.js";
import Room21 from "./rooms/room21.js";
import Room22 from "./rooms/room22.js";
import Room23 from "./rooms/room23.js";
import Room24 from "./rooms/room24.js";

// Main game scene class
class MainGameScene extends Phaser.Scene {
  constructor() {
    super("MainGameScene");

    this.developerModeIsOn = false;
    this.musicStarted = false;

    // Declare game objects and state variables
    this.walls = null;
    this.platforms = null;
    this.hazards = null;
    this.hazardTrees = null;
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
      y: y - 40,
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
      this.player.setPosition(playerStartX, playerStartY);
    }
    // Continue music
    if (this.musicStarted) {
      const outsideMusic = document.getElementById("background-music");
      outsideMusic.play();
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
    this.load.image("background", "assets/background.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground.png");
    this.load.image("floor", "assets/floor.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("hazard_tree", "assets/treetest.png");
    this.load.image("hazard_down", "assets/hazard_down1.png");
    this.load.image("hazard_up", "assets/hazard_up1.png");
    this.load.image("hazard_right", "assets/hazard_right1.png");
    this.load.image("hazard_left", "assets/hazard_left1.png");
    this.load.image("door", "assets/door.png");
    this.load.image("cabin1", "assets/cabin1.png");
    this.load.image("cabin2", "assets/cabin2.png");
    this.load.audio("hazardSound", "assets/audio/spikeSplatter_01.wav");
    this.load.audio("doorLockedSound", "assets/audio/oviLukossa_01.wav");
    this.load.audio("doorOpenedSound", "assets/audio/ovenAvaus_01.wav");
    this.load.audio("dashSound", "assets/audio/dash_01.wav");

    // Preload
    this.load.spritesheet("christmasLights", "assets/christmas-lights.png", {
      frameWidth: 16, // Frame width
      frameHeight: 16, // Frame height
      endFrame: 7, // Total frames (0 to 7), (will only use the first frame)
    });
  }

  // og world width 4096
  // og world height 2304
  create() {
    // Create the background as a tiled sprite to cover the world
    const bg = this.add.tileSprite(
      0, // X position
      230, // Y position
      extendedWorldWidth,
      worldHeight,
      "background" // Background texture
    );
    bg.setOrigin(0, 0); // Align the background at the top-left corner

    // Set the new world bounds
    this.physics.world.setBounds(0, 0, extendedWorldWidth, extendedWorldHeight);

    const outsideMusic = document.getElementById("background-music");

    const startMusic = () => {
      if (!this.musicStarted) {
        this.musicStarted = true; // Mark the music as started
        outsideMusic.play();
        console.log("Music started");
      }
    };

    // Add sounds

    // Hazard hit sound
    this.hazardSound = this.sound.add("hazardSound");
    this.hazardSound.setVolume(0.13); // Set volume (0.0 to 1.0)

    // Door sounds
    this.doorLockedSound = this.sound.add("doorLockedSound");
    this.doorLockedSound.setVolume(0.5);

    this.doorOpenedSound = this.sound.add("doorOpenedSound");
    this.doorOpenedSound.setVolume(0.8);

    // Dash sound
    this.dashSound = this.sound.add("dashSound");
    this.dashSound.setVolume(0.6);

    // Listen for keyboard press and pointer interaction
    this.input.keyboard.on("keydown", startMusic);
    this.input.on("pointerdown", startMusic);

    // Add text to display developer mode status
    this.devModeText = this.add.text(10, 10, "Dev Mode (B): OFF", {
      fontSize: "20px",
      fill: "#ffffff",
    });

    this.devModeText.setScrollFactor(0); // Ensure text stays fixed on screen
    this.devModeText.setDepth(4);

    // Add the 'B' key for toggling developer mode
    this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    const devModeBg = this.add.rectangle(60, 20, 330, 30, 0x000000, 0.3); // Black background with 50% opacity
    devModeBg.setScrollFactor(0); // Ensure the background stays fixed on screen
    devModeBg.setDepth(3);

    // PLayer coordinate text for developer mode
    this.playerCoordinateText = this.add.text(5, 60, "", {
      font: "20px Arial",
      fill: "#32141c",
      align: "center",
      backgroundColor: "#c99b70",
    });

    this.playerCoordinateText.setScrollFactor(0);
    this.playerCoordinateText.setDepth(5);
    this.playerCoordinateText.setVisible(false); // Hidden until developer mode is switched on

    // Platforms group
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(
      this.add.tileSprite(
        extendedWorldWidth / 2,
        2450,
        extendedWorldWidth,
        350,
        "floor"
      )
    ); //lattia

    // Alku - Luukku 1
    this.platforms.add(this.add.tileSprite(275, 2268, 128, 114, "floor"));
    this.platforms.add(this.add.tileSprite(400, 2238, 128, 174, "floor"));

    this.platforms.add(this.add.tileSprite(650, 2238, 128, 174, "floor"));

    this.platforms.add(this.add.tileSprite(964, 2238, 256, 174, "floor"));

    // luukku 1 - 2
    this.platforms.add(this.add.tileSprite(1200, 2100, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(1400, 2030, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(1600, 1960, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(1900, 1890, 256, 25, "floor"));

    //luukku 2 - 3
    this.platforms.add(this.add.tileSprite(1600, 1800, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(1390, 1710, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(1130, 1620, 256, 25, "floor"));

    //luukku 3 - 4
    this.platforms.add(this.add.tileSprite(815, 1620, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(600, 1550, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(400, 1470, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(140, 1400, 256, 25, "floor"));

    // luukku 4 - 5
    this.platforms.add(this.add.tileSprite(400, 1330, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(850, 1260, 640, 25, "floor"));

    // luukku 5 - 6
    this.platforms.add(this.add.tileSprite(1275, 1190, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(1450, 1120, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(1600, 1350, 192, 25, "floor")); // kuusi

    this.platforms.add(this.add.tileSprite(1700, 1120, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(1900, 1190, 128, 25, "floor"));

    // luukku 7 - 8
    this.platforms.add(this.add.tileSprite(2784, 1333, 250, 25, "floor"));

    //luukku 8 - 9
    this.platforms.add(this.add.tileSprite(3100, 1854, 384, 942, "platform"));
    this.platforms.add(this.add.tileSprite(3100, 1352, 384, 64, "floor"));

    //luukku 10 - 11
    this.platforms.add(this.add.tileSprite(4360, 1335, 256, 25, "floor"));

    this.platforms.add(this.add.tileSprite(4600, 1245, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(4775, 1180, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(4950, 1130, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(5080, 1380, 192, 25, "floor")); // kuusi

    this.platforms.add(this.add.tileSprite(5255, 1130, 256, 25, "floor"));

    //luukku 11 - 12
    this.platforms.add(this.add.tileSprite(5870, 1262, 384, 576, "platform"));
    this.platforms.add(this.add.tileSprite(5870, 942, 384, 64, "floor"));
    this.platforms.add(this.add.tileSprite(5998, 1678, 128, 256, "platform"));
    this.platforms.add(this.add.tileSprite(5870, 1966, 384, 320, "platform"));
    this.platforms.add(this.add.tileSprite(5806, 1774, 256, 64, "floor"));

    //luukku 15 - 16
    this.platforms.add(this.add.tileSprite(7050, 2100, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(7590, 2100, 256, 25, "floor"));

    this.platforms.add(this.add.tileSprite(8045, 2100, 180, 25, "floor"));

    //luukku 16 - 17
    this.platforms.add(this.add.tileSprite(9000, 2200, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9100, 2110, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9200, 2020, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9400, 2020, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9500, 2110, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9600, 2200, 64, 25, "floor"));

    //luukku 17 - 18
    this.platforms.add(this.add.tileSprite(9500, 1300, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9750, 650, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(9900, 900, 128, 25, "floor"));

    //luukku 21 - 22
    this.platforms.add(this.add.tileSprite(11100, 880, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(11030, 790, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(10960, 700, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(10890, 610, 64, 25, "floor"));
    this.platforms.add(this.add.tileSprite(10820, 520, 64, 25, "floor"));

    this.platforms.add(this.add.tileSprite(10550, 435, 256, 30, "floor"));

    //luukku 22 - 23
    this.platforms.add(this.add.tileSprite(11050, 430, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(11460, 460, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(11820, 490, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(12180, 520, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(12540, 550, 128, 25, "floor"));
    this.platforms.add(this.add.tileSprite(12900, 580, 128, 25, "platform"));

    this.platforms.add(this.add.tileSprite(13336, 610, 360, 25, "floor"));

    //luukku 23 - 24
    this.platforms.add(this.add.tileSprite(13380, 1200, 192, 25, "floor"));
    this.platforms.add(this.add.tileSprite(13348, 1800, 128, 25, "floor"));

    this.platforms.add(this.add.tileSprite(13220, 1360, 128, 1472, "platform")); //!!

    this.platforms.add(this.add.tileSprite(12420, 2032, 1472, 128, "floor"));

    // Walls group
    this.walls = this.physics.add.staticGroup();

    //luukut 6 - 8
    this.walls.add(this.add.tileSprite(2080, 1800, 128, 960, "wall"));
    this.walls.add(this.add.tileSprite(2350, 1530, 128, 1120, "wall"));
    this.walls.add(this.add.tileSprite(2600, 1800, 128, 960, "wall"));

    //luukut 8 - 10
    this.walls.add(this.add.tileSprite(3680, 1700, 256, 800, "wall"));
    this.walls.add(this.add.tileSprite(4100, 1800, 256, 960, "wall"));

    //luukut 11 - 14
    this.walls.add(this.add.tileSprite(5445, 1693, 128, 1184, "wall"));

    this.walls.add(this.add.tileSprite(6500, 1710, 192, 960, "wall"));
    this.walls.add(this.add.tileSprite(6800, 1741, 128, 1088, "wall"));

    //luukut 14 - 16
    this.walls.add(this.add.tileSprite(7050, 1450, 128, 1088, "wall"));
    this.walls.add(this.add.tileSprite(7290, 1580, 128, 1088, "wall"));

    this.walls.add(this.add.tileSprite(7590, 1360, 224, 1088, "wall"));

    this.walls.add(this.add.tileSprite(7890, 1580, 128, 1088, "wall"));
    this.walls.add(this.add.tileSprite(8230, 1400, 128, 1088, "wall"));

    //luukku 17 - 18
    this.walls.add(this.add.tileSprite(9850, 1780, 192, 864, "wall"));
    this.walls.add(this.add.tileSprite(10200, 1725, 192, 1120, "wall"));

    this.walls.add(this.add.tileSprite(9500, 830, 128, 640, "wall"));
    this.walls.add(this.add.tileSprite(9200, 830, 128, 800, "wall"));

    //luola
    this.walls.add(this.add.tileSprite(10930, 1190, 1056, 480, "wall"));
    this.walls.add(this.add.tileSprite(10498, 1814, 192, 384, "wall"));
    this.walls.add(this.add.tileSprite(10690, 1718, 192, 576, "wall"));

    this.walls.add(this.add.tileSprite(10802, 2086, 800, 160, "wall"));
    this.walls.add(this.add.tileSprite(11122, 1494, 672, 128, "wall"));
    this.walls.add(this.add.tileSprite(11266, 1830, 640, 160, "wall"));

    this.walls.add(this.add.tileSprite(11474, 2095, 224, 380, "wall"));
    this.walls.add(this.add.tileSprite(11650, 1535, 128, 1500, "wall"));

    //luukku 23 - 24
    this.walls.add(this.add.tileSprite(13760, 1325, 320, 1920, "wall"));

    // hazards group
    this.hazardTrees = this.physics.add.group();

    // Array of tree hazard coordinates and scale
    const treeHazards = [
      { x: 1590, y: 1195, texture: "hazard_tree", scaleX: 0.4, scaleY: 0.4 },
      { x: 5070, y: 1220, texture: "hazard_tree", scaleX: 0.4, scaleY: 0.4 },
      { x: 9300, y: 2130, texture: "hazard_tree", scaleX: 0.4, scaleY: 0.4 },
      { x: 10600, y: 800, texture: "hazard_tree", scaleX: 0.4, scaleY: 0.4 },
      { x: 10850, y: 800, texture: "hazard_tree", scaleX: 0.4, scaleY: 0.4 },
    ];

    // Loop to create the tree hazards
    treeHazards.forEach((hazard) => {
      const tree = this.hazardTrees
        .create(hazard.x, hazard.y, hazard.texture)
        .setScale(hazard.scaleX, hazard.scaleY)
        .refreshBody();

      tree.setDepth(1);
      tree.body.setAllowGravity(false);
      tree.body.setImmovable(true);
      tree.body.setVelocity(0, 0);

      tree.setOrigin(0.5, 0.5); // Center the origin

      // Round the positions to avoid floating-point offsets
      tree.x = Math.round(tree.x);
      tree.y = Math.round(tree.y);
      tree.body.offset.x = Math.round(tree.body.offset.x);
      tree.body.offset.y = Math.round(tree.body.offset.y);

      tree.body.setSize(110, 700); // Adjust width and height for the visible part
      tree.body.setOffset(160, 30); // Adjust offset to align the hitbox with the visible part

      //DEBUG TOOL WHICH SHOWS HITBOX OUTLINES

      // this.physics.world.createDebugGraphic()
      // .lineStyle(2, 0xff0000)
      // .strokeRect(tree.x - tree.body.width / 2, tree.y - tree.body.height / 2, tree.body.width, tree.body.height);

      // SECOND HITBOX
      const lowerHitbox = this.physics.add.image(tree.x, tree.y + 40); // invisible image for the lower hitbox
      lowerHitbox.setSize(120, 130); // bottom part of the tree
      lowerHitbox.body.setOffset(-50, -50); // offset to align with the bottom part
      lowerHitbox.body.setImmovable(true);
      lowerHitbox.body.setAllowGravity(false);

      // Register lower hitbox with the physics world before adjusting its body
      this.physics.add.existing(lowerHitbox);
      this.hazardTrees.add(lowerHitbox);

      // Set properties for the lower hitbox
      lowerHitbox.body.setImmovable(true);
      lowerHitbox.body.setAllowGravity(false);
    });

    this.hazards = this.physics.add.staticGroup();

    // Hazards group SPIKES

    this.hazards
      .create(530 - 3, 2230, "hazard_up")
      .setScale(1.25, 1)
      .refreshBody();
    this.hazards
      .create(775 - 2, 2230, "hazard_up")
      .setScale(1.25, 1)
      .refreshBody();

    this.hazards.create(1150, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1250, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1350, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1450, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1555, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1660, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1760, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1860, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1960, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(2180, 2230, "hazard_up").setScale(0.8, 1).refreshBody();

    this.hazards
      .create(2255, 1965, "hazard_left")
      .setScale(0.7, 1)
      .refreshBody();

    this.hazards
      .create(3365, 1400, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3365, 1500, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3365, 1600, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();

    this.hazards
      .create(3360 + 120, 1840 + 50, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360 + 120, 1940, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360 + 120, 2040, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();

    this.hazards.create(3630, 1255, "hazard_up").setScale(1.3, 1).refreshBody();
    this.hazards.create(3730, 1255, "hazard_up").setScale(1.3, 1).refreshBody();

    this.hazards.create(4290, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4390, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4490, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4590, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4690, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4790, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4890, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4990, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(5090, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards
      .create(5190 + 10, 2230, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(5290 + 20, 2230, "hazard_up")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(5558, 1400, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards.create(5630, 1800, "hazard_left").setScale(1, 1).refreshBody();

    this.hazards.create(5550, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(6920, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7020, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7120, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7220, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7320, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7420, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7520, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7620, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7720, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7820, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7920, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8020, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8120, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8220, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8320, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8420, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards
      .create(8003, 1090, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(7995 + 123, 1090 + 330, "hazard_left")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(8003, 1090 + 660, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(7995 + 1200, 385, "hazard_up")
      .setScale(1.2, 1)
      .refreshBody();

    this.hazards
      .create(10080, 1220, "hazard_left")
      .setScale(0.5, 1)
      .refreshBody();

    this.hazards
      .create(13332, 675, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 775, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 875, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 975, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1075, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(13332, 1273, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1375, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1475, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1575, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1675, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(13332, 1875, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13332, 1975, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards.create(13552, 950, "hazard_left").setScale(1, 1).refreshBody();
    this.hazards
      .create(13552, 1550, "hazard_left")
      .setScale(1, 1)
      .refreshBody();
    this.hazards.create(13550, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(13450, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(11750, 1925, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(11850, 1925, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards
      .create(11950 + 5, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12050 + 10, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12150 + 15, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12250 + 20, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12350 + 25, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12450 + 30, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12550 + 35, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12650 + 40, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12750 + 45, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12850 + 50, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12950 + 55, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13050 + 60, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(12100, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12300, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12500, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12700, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12900, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(13100, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();

    // Hazards group SPIKES

    this.hazards
      .create(530 - 3, 2230, "hazard_up")
      .setScale(1.25, 1)
      .refreshBody();
    this.hazards
      .create(775 - 2, 2230, "hazard_up")
      .setScale(1.25, 1)
      .refreshBody();

    this.hazards.create(1150, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1250, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1350, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1450, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1555, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1660, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1760, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1860, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(1960, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(2180, 2230, "hazard_up").setScale(0.8, 1).refreshBody();

    this.hazards
      .create(2255, 1965, "hazard_left")
      .setScale(0.7, 1)
      .refreshBody();

    this.hazards
      .create(3360, 1400, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360, 1500, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360, 1600, "hazard_right")
      .setScale(1.5, 1)
      .refreshBody();

    this.hazards
      .create(3360 + 125, 1840 + 50, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360 + 125, 1940, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();
    this.hazards
      .create(3360 + 125, 2040, "hazard_left")
      .setScale(1.5, 1)
      .refreshBody();

    this.hazards.create(3630, 1255, "hazard_up").setScale(1.3, 1).refreshBody();
    this.hazards.create(3730, 1255, "hazard_up").setScale(1.3, 1).refreshBody();

    this.hazards.create(4290, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4390, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4490, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4590, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4690, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4790, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4890, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(4990, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(5090, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards
      .create(5190 + 10, 2230, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(5290 + 20, 2230, "hazard_up")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(5555, 1400, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards.create(5635, 1800, "hazard_left").setScale(1, 1).refreshBody();

    this.hazards.create(5550, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(6920, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7020, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7120, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7220, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7320, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7420, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7520, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7620, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7720, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7820, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(7920, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8020, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8120, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8220, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8320, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(8420, 2230, "hazard_up").setScale(1, 1).refreshBody();

    //"!!!!!!!!!!!!"
    this.hazards
      .create(7995, 1090, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(7995 + 125, 1090 + 330, "hazard_left")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(7995, 1090 + 660, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(7995 + 1200, 385, "hazard_up")
      .setScale(1.2, 1)
      .refreshBody();

    //asdfghj

    this.hazards
      .create(13330, 675, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 775, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 875, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 975, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1075, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(13330, 1275, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1375, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1475, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1575, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1675, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards
      .create(13330, 1875, "hazard_right")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13330, 1975, "hazard_right")
      .setScale(1, 1)
      .refreshBody();

    this.hazards.create(13555, 950, "hazard_left").setScale(1, 1).refreshBody();
    this.hazards
      .create(13555, 1550, "hazard_left")
      .setScale(1, 1)
      .refreshBody();
    this.hazards.create(13550, 2230, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(13450, 2230, "hazard_up").setScale(1, 1).refreshBody();

    this.hazards.create(11750, 1925, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards.create(11850, 1925, "hazard_up").setScale(1, 1).refreshBody();
    this.hazards
      .create(11950 + 5, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12050 + 10, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12150 + 15, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12250 + 20, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12350 + 25, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12450 + 30, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12550 + 35, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12650 + 40, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12750 + 45, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12850 + 50, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(12950 + 55, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();
    this.hazards
      .create(13050 + 60, 1925, "hazard_up")
      .setScale(1, 1)
      .refreshBody();

    //11860, 2240
    this.hazards
      .create(12100, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12300, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12500, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12700, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(12900, 2140 - 10, "hazard_down")
      .setScale(1, 0.7)
      .refreshBody();
    this.hazards
      .create(13100, 2245, "hazard_up")
      .setScale(1, 0.7)
      .refreshBody();

    // doors (rooms 1 to 24)

    this.doors = [
      this.createDoor(965, 2114, "Room1").setScale(0.3).setDepth(1),
      this.createDoor(1900, 1840, "Room2").setScale(0.3).setDepth(1),
      this.createDoor(1130, 1570, "Room3").setScale(0.3).setDepth(1),
      this.createDoor(140, 1350, "Room4").setScale(0.3).setDepth(1),
      this.createDoor(850, 1210, "Room5").setScale(0.3).setDepth(1),
      this.createDoor(2080, 1290, "Room6").setScale(0.3).setDepth(1),
      this.createDoor(2355, 2240, "Room7").setScale(0.3).setDepth(1),
      this.createDoor(3100, 1283, "Room8").setScale(0.3).setDepth(1),
      this.createDoor(3675, 2240, "Room9").setScale(0.3).setDepth(1),
      this.createDoor(4360, 1285, "Room10").setScale(0.3).setDepth(1),
      this.createDoor(5255, 1080, "Room11").setScale(0.3).setDepth(1),
      this.createDoor(5800, 1702, "Room12").setScale(0.3).setDepth(1),
      this.createDoor(6230, 2240, "Room13").setScale(0.3).setDepth(1),
      this.createDoor(6500, 1195, "Room14").setScale(0.3).setDepth(1),
      this.createDoor(7590, 2050, "Room15").setScale(0.3).setDepth(1),
      this.createDoor(8600, 2240, "Room16").setScale(0.3).setDepth(1),
      this.createDoor(9850, 1310, "Room17").setScale(0.3).setDepth(1),
      this.createDoor(10200, 1135, "Room18").setScale(0.3).setDepth(1),
      this.createDoor(10500, 1590, "Room19").setScale(0.3).setDepth(1),
      this.createDoor(11255, 1720, "Room20").setScale(0.3).setDepth(1),
      this.createDoor(11300, 914, "Room21").setScale(0.3).setDepth(1),
      this.createDoor(10550, 380, "Room22").setScale(0.3).setDepth(1),
      this.createDoor(13260, 560, "Room23").setScale(0.3).setDepth(1),
      this.createDoor(11860, 2240, "Room24").setScale(0.3).setDepth(1),
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

      this.anims.create({
        key: "flash", // Animation name
        frames: this.anims.generateFrameNumbers("christmasLights", {
          frames: [0, 2, 4, 6],
        }), // Use frames 1, 3, 5, and 7
        frameRate: 5, // Adjust frame rate for desired flashing speed
        repeat: -1, // Loop forever
      });

      // Create the flashing lights sprite
      // this.christmasLights = this.add.sprite(970, 2050, 'christmasLights').play('flash');

      // Optional: Adjust scale and make it physics-enabled (if needed)
      // this.christmasLights.setScale(7); // Scale the sprite as per your requirement
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
    this.player.setDashSound(this.dashSound); // Pass dash sound to player

    // Camera setup
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, extendedWorldWidth, extendedWorldHeight);

    this.cameras.main.setZoom(1); // Set the zoom level

    // Colliders for the player
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.platforms);

    // Reset player on touching spike hazards
    this.physics.add.collider(this.player, this.hazards, () => {
      this.hazardSound.play();
      this.loadGame();
    });

    // Reset player on touching tree hazards
    this.physics.add.collider(this.player, this.hazardTrees, () => {
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
    this.ctrlKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.CTRL
    );

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
      {
        x: this.doors[5].x + 100,
        y: this.doors[5].y - 25,
        shown: false,
        message: "You can slow your descent\nby pushing against the wall",
      },
      {
        x: this.doors[6].x + 100,
        y: this.doors[6].y - 25,
        shown: false,
        message: "Try to bounce off the walls\nto climb higher",
      },
      {
        x: this.doors[16].x - 100,
        y: this.doors[16].y - 30,
        shown: false,
        message: "Press [shift] to dash\nwhile walking or jumping",
      },
    ];

    // Loading the game
    this.loadGame();
  }

  //added door to the physics world

  createDoor(x, y, targetRoom) {
    const door = this.physics.add.sprite(x, y, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    door.body.setEnable(false);
    door.setData("targetRoom", targetRoom); // Store the target room name

    // Create the door number text
    const roomNumber = parseInt(targetRoom.replace("Room", "")); // take the room number from the targetRoom string (room1 -> 1)
    const doorText = this.add.text(x, y - 12, `${roomNumber}`, {
      font: "bold 30px 'Tempus Sans ITC'",
      fill: "#542723",
      align: "center",
    });
    doorText.setShadow(2, 2, "", 2);
    doorText.setOrigin(0.5, 0.5); // Centers the text on the door sprite

    doorText.setDepth(2);
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

    if (this.developerModeIsOn) {
      this.playerCoordinateText.setText(
        `X: ${this.player.x.toFixed(0)} Y: ${this.player.y.toFixed(0)}`
      );
      this.playerCoordinateText.setVisible(true); // Show the text
    } else {
      this.playerCoordinateText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.bKey)) {
      this.developerModeIsOn = !this.developerModeIsOn; // Toggle mode
      this.updateDevModeText(); // Update the displayed text
    }

    // Clearing the save file when ctrl+q is pressed
    if (
      Phaser.Input.Keyboard.JustDown(this.qKey) &&
      Phaser.Input.Keyboard.JustDown(this.ctrlKey)
    ) {
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

    // Create
    this.doorLights = [];
    this.createdLightsToday = {}; // Object to track lights created for each room

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();

    // Ensure lights are only created once per day for each door
    if (!this.createdLightsToday[currentDay]) {
      this.createdLightsToday[currentDay] = {}; // Initialize empty object for today

      // Loop through each door
      this.doors.forEach((door) => {
        const month = 11; // December
        const year = 2024;
        const targetRoom = door.getData("targetRoom");

        if (targetRoom) {
          const roomNumber = parseInt(targetRoom.replace("Room", ""), 10); // Room number
          let doorDate = new Date(year, month, roomNumber);

          // Check if today's date matches the room's target date
          if (
            currentDate.getDate() === doorDate.getDate() &&
            currentDate.getMonth() === doorDate.getMonth()
          ) {
            if (!this.doorLights[roomNumber]) {
              // Create sprite for the still image (first frame from sprite sheet)
              this.doorLights[roomNumber] = this.add.sprite(
                door.x,
                door.y - 50,
                "christmasLights"
              );
              this.doorLights[roomNumber].setScale(7); // Scale the sprite

              // Set the first frame (frame 0) as the still image
              this.doorLights[roomNumber].setFrame(0);

              // Store the created light status for this room
              this.createdLightsToday[currentDay][roomNumber] = true;

              // Debug: Log sprite creation
            }
          } else {
            // Remove lights if not today
            if (this.doorLights[roomNumber]) {
              this.doorLights[roomNumber].destroy();
              this.doorLights[roomNumber] = null;
            }
          }
        }
      });
    }

    // Handle player interaction with door
    this.doors.forEach((door) => {
      const targetRoom = door.getData("targetRoom");
      const roomNumber = parseInt(targetRoom.replace("Room", ""), 10);
      if (
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          door.x,
          door.y
        ) < 50 &&
        Phaser.Input.Keyboard.JustDown(this.eKey)
      ) {
        // Handle locking and unlocking of doors based on date
        if (
          currentDate < new Date(2024, 11, roomNumber) &&
          !this.developerModeIsOn
        ) {
          let timeDifference = new Date(2024, 11, roomNumber) - currentDate;
          let daysLeft = Math.ceil(timeDifference / (24 * 60 * 60 * 1000)); // Days remaining
          let doorMessageText = `No access yet! Can be\nopened in ${daysLeft} day(s).`;
          this.doorLockedSound.play();
          this.showTextBox(door.x - 100, door.y - 200, doorMessageText, 4000);
        } else {
          this.doorOpenedSound.play();

          const outsideMusic = document.getElementById("background-music");
          outsideMusic.pause(); // Pause the music while in the cabin

          this.scene.start(targetRoom, {
            playerStartX: this.player.x,
            playerStartY: this.player.y,
          });
        }

        this.saveGame(this.player.x, this.player.y);
      }
    });
  }
}

const worldHeight = 64 * (9 * 4); // 2304

// Extended world bounds
const extendedWorldWidth = 16000; // extended world width
const extendedWorldHeight = 8000; // extended world height

const config = {
  type: Phaser.AUTO,
  width: 64 * 16, // Camera size
  height: 64 * 9, // Camera size
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2200 },
      debug: false,
    },
  },
  scene: [
    MainGameScene,
    Room1,
    Room2,
    Room3,
    Room4,
    Room5,
    Room6,
    Room7,
    Room8,
    Room9,
    Room10,
    Room11,
    Room12,
    Room13,
    Room14,
    Room15,
    Room16,
    Room17,
    Room18,
    Room19,
    Room20,
    Room21,
    Room22,
    Room23,
    Room24,
  ],
};

// Initialize the game
const game = new Phaser.Game(config);

const playerStartX = 100;
const playerStartY = 500 + 1700;
