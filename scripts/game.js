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
    this.load.image("background", "assets/test_bg_1.jpg");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground_test3.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("hazard_down", "assets/hazard_down1.png");
    this.load.image("hazard_up", "assets/hazard_up1.png");
    this.load.image("hazard_right", "assets/hazard_right1.png");
    this.load.image("hazard_left", "assets/hazard_left1.png");
    this.load.image("door", "assets/door.png");
    this.load.image("cabin1", "assets/cabin1.png");
    this.load.image("cabin2", "assets/cabin2.png");
    this.load.audio("hazardSound", "assets/audio/spikeSplatter_01.wav");
    this.load.audio("doorLocked", "assets/audio/oviLukossa_01.wav");
    this.load.audio("doorOpened", "assets/audio/ovenAvaus_01.wav");
  }

  // world width 4096
  // world height 2304
  create() {
    // Create the background as a tiled sprite to cover the world
    const bg = this.add.tileSprite(
      0, // X position
      0, // Y position
      extendedWorldWidth, // Extended world width
      worldHeight, // Extended world height
      "background" // Background texture
    );
    bg.setOrigin(0, 0); // Align the background at the top-left corner

    // Set the new world bounds
    this.physics.world.setBounds(0, 0, extendedWorldWidth, extendedWorldHeight);

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

    // Walls group
    // X = HORIZONTAL, higher number = further right
    // Y = VERTICAL, higher number = further down
    this.walls = this.physics.add.staticGroup();

    this.walls.create(2080, 1800, "wall").setScale(4, 30).refreshBody();
    this.walls.create(2350, 1530, "wall").setScale(4, 35).refreshBody();
    this.walls.create(2600, 1800, "wall").setScale(4, 30).refreshBody();
    this.walls.create(3630 + 50, 1700, "wall").setScale(8, 25).refreshBody();
    this.walls.create(4050 + 50, 1800, "wall").setScale(8, 30).refreshBody();
    this.walls.create(5445, 1710, "wall").setScale(4, 37).refreshBody();
    
    this.walls.create(6500, 1710, "wall").setScale(6, 30).refreshBody();
    this.walls.create(6800, 1730, "wall").setScale(4, 34).refreshBody();

    //OVI 15-16 SEINÄT

    this.walls.create(7050, 1450, "wall").setScale(4, 34).refreshBody();  //!!
    this.walls.create(7050+240, 1450+130, "wall").setScale(4, 34).refreshBody(); 

    this.walls.create(7050+240+240+60, 1400-40, "wall").setScale(7, 34).refreshBody();

    this.walls.create(7050+840, 1450+130, "wall").setScale(4, 34).refreshBody(); 
    this.walls.create(7050+840+240+100, 1400, "wall").setScale(4, 34).refreshBody(); 

    this.walls.create(9850, 1780, "wall").setScale(6, 27).refreshBody();
    this.walls.create(10200, 1730, "wall").setScale(6, 35).refreshBody();

    this.walls.create(9500, 830, "wall").setScale(4, 20).refreshBody();
    this.walls.create(9200, 830, "wall").setScale(4, 25).refreshBody();

    //luola
    this.walls.create(10920, 1190, "wall").setScale(33, 15).refreshBody(); //tämän päälle kuusimetsä
    this.walls.create(10700, 1715, "wall").setScale(7, 18).refreshBody();
    this.walls.create(10500, 1810, "wall").setScale(6, 12).refreshBody();
    this.walls.create(10805, 2080, "wall").setScale(25, 5).refreshBody();

    this.walls.create(11450, 2065, "wall").setScale(8, 13).refreshBody();
    this.walls.create(11255, 1800, "wall").setScale(20, 5).refreshBody();
    this.walls.create(11130, 1470, "wall").setScale(20, 3).refreshBody();
    this.walls.create(11130, 1470, "wall").setScale(20, 3).refreshBody();
    this.walls.create(11635, 1560, "wall").setScale(4, 45).refreshBody();

    this.walls
      .create(13160 + 600, 1320, "wall")
      .setScale(10, 60)
      .refreshBody(); //vika (luukkku 24)

    // Platforms group
    // X = HORIZONTAL, higher number = further right
    // Y = VERTICAL, higher number = further down
    //platform width approx 125, height 25 pixels
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(10, 2340, "platform").setScale(1000, 1).refreshBody(); //lattia

    // Alku - Luukku 1
    this.platforms.create(300, 2245, "platform").setScale(1, 0.5).refreshBody();
    this.platforms.create(400, 2215, "platform").setScale(1, 1).refreshBody();

    this.platforms.create(650, 2215, "platform").setScale(1, 1).refreshBody();
    this.platforms.create(900, 2215, "platform").setScale(1, 1).refreshBody();
    this.platforms
      .create(1027, 2215, "platform")
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
    this.platforms.create(4300 - 7, 1335, "platform").setScale(1, 0.2).refreshBody(); //ovi 10
    this.platforms.create(4425 - 7, 1335, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(4600, 1230 + 15, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(4775, 1180, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(4950, 1130, "platform").setScale(1, 0.2).refreshBody();

    this.platforms
      .create(5140 - 120, 1500, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //joulukuusi tähän
    this.platforms
      .create(5140 - 120 + 125, 1500, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //joulukuusi

    this.platforms.create(5190, 1130, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(5190 + 125, 1130, "platform").setScale(1, 0.2).refreshBody(); //ovi 11

    this.platforms.create(5870, 1200 + 30, "platform").setScale(3, 5).refreshBody();
    this.platforms.create(5980, 1648 + 30, "platform").setScale(1.3, 2).refreshBody();
    this.platforms.create(5870, 1900 + 30, "platform").setScale(3, 3).refreshBody();

//ovi 15  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    this.platforms.create(7150-100, 2100, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(7500+30, 2100, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(7655, 2100, "platform").setScale(1, 0.2).refreshBody();  //ovi 15

   
    this.platforms.create(8325-300, 2100, "platform").setScale(1, 0.2).refreshBody(); 

    this.platforms.create(9000, 2200, "platform").setScale(0.5, 0.2).refreshBody(); //joulukuusi oikealle
    this.platforms.create(9100, 2110, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(9200, 2020, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(9400, 2020, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(9400 + 100, 2110, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(9400 + 200, 2200, "platform").setScale(0.5, 0.2).refreshBody();

    this.platforms
      .create(9500, 1300, "platform")
      .setScale(1, 0.2)
      .refreshBody(); //OVI 17 oikealla

    this.platforms.create(9750, 650, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(9900+50, 900, "platform").setScale(1, 0.2).refreshBody(); //ovi 18 alhaalla oikealla

    this.platforms.create(11100, 880, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms .create(11030, 790, "platform").setScale(0.5, 0.2).refreshBody(); //joulukuusia alle
    this.platforms.create(10960, 700, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(10890, 610, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(10820, 520, "platform").setScale(0.5, 0.2).refreshBody();
    this.platforms.create(10550, 430, "platform").setScale(2, 0.2).refreshBody(); //OVI 22

    this.platforms.create(11000 + 50, 430, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(11360 + 100, 460, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(11720 + 100, 490, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(12080 + 100, 520, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(12440 + 100, 550, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(12800 + 100, 580, "platform").setScale(1, 0.2).refreshBody();
    this.platforms.create(13160 + 100, 610, "platform").setScale(2, 0.2).refreshBody();  //ovi 23
    this.platforms.create(13160 + 280, 610, "platform").setScale(1.5, 0.2).refreshBody(); 
    

    this.platforms.create(13350, 1200, "platform").setScale(2.5, 0.2).refreshBody();
    this.platforms.create(13350, 1800, "platform").setScale(2, 0.2).refreshBody();
    this.platforms.create(13220, 1360, "platform").setScale(1, 11.5).refreshBody();     // !!!!!!!!!!!!!!!!!!!!!!!!!!
    this.platforms.create(12430, 2032, "platform").setScale(11.5, 1).refreshBody();

    // Hazards group
    this.hazards = this.physics.add.staticGroup();

this.hazards.create(530-3, 2230, "hazard_up").setScale(1.25, 1).refreshBody();
this.hazards.create(775-2, 2230, "hazard_up").setScale(1.25, 1).refreshBody().setSize(40, 50);

this.hazards.create(1150, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1250, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1350, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1450, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1560, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1660, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1760, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1860, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(1960, 2230, "hazard_up").setScale(1, 1).refreshBody();

this.hazards.create(2180, 2230, "hazard_up").setScale(0.8, 1).refreshBody().setSize(80, 80);

this.hazards.create(2255, 1980, "hazard_left").setScale(0.7, 1).refreshBody().setSize(40, 80);

this.hazards.create(3360, 1400, "hazard_right").setScale(1.5, 1).refreshBody();
this.hazards.create(3360, 1500, "hazard_right").setScale(1.5, 1).refreshBody();
this.hazards.create(3360, 1600, "hazard_right").setScale(1.5, 1).refreshBody();

this.hazards.create(3360+125, 1840+50, "hazard_left").setScale(1.5, 1).refreshBody();
this.hazards.create(3360+125, 1940, "hazard_left").setScale(1.5, 1).refreshBody();
this.hazards.create(3360+125, 2040, "hazard_left").setScale(1.5, 1).refreshBody();

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
this.hazards.create(5190+10, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(5290+20, 2230, "hazard_up").setScale(1, 1).refreshBody();





this.hazards.create(5555, 1400, "hazard_right").setScale(1, 1).refreshBody().setSize(80);
this.hazards.create(5635, 1800, "hazard_left").setScale(1, 1).refreshBody().setSize(60, 90);

this.hazards.create(5550, 2230, "hazard_up").setScale(1, 1).refreshBody().setSize(75, 60);


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
this.hazards.create(7995, 1090, "hazard_right").setScale(1, 1).refreshBody().setSize(75, 80);
this.hazards.create(7995+125, 1090+330, "hazard_left").setScale(1, 1).refreshBody().setSize(75, 80);
this.hazards.create(7995, 1090+660, "hazard_right").setScale(1, 1).refreshBody().setSize(75, 80);

this.hazards.create(7995+1200, 385, "hazard_up").setScale(1.2, 1).refreshBody().setSize(75, 80);

this.hazards.create(10445+200, 820, "hazard_up").setScale(5, 3).refreshBody();   //"KUUSIMETSÄ"

//asdfghj

this.hazards.create(13330, 675, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 775, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 875, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 975, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1075, "hazard_right").setScale(1, 1).refreshBody();

this.hazards.create(13330, 1275, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1375, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1475, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1575, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1675, "hazard_right").setScale(1, 1).refreshBody();

this.hazards.create(13330, 1875, "hazard_right").setScale(1, 1).refreshBody();
this.hazards.create(13330, 1975, "hazard_right").setScale(1, 1).refreshBody();

this.hazards.create(13555, 950, "hazard_left").setScale(1, 1).refreshBody();
this.hazards.create(13555, 1550, "hazard_left").setScale(1, 1).refreshBody();
this.hazards.create(13550, 2230, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(13450, 2230, "hazard_up").setScale(1, 1).refreshBody();

this.hazards.create(11750, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(11850, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(11950+5, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12050+10, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12150+15, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12250+20, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12350+25, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12450+30, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12550+35, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12650+40, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12750+45, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12850+50, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(12950+55, 1925, "hazard_up").setScale(1, 1).refreshBody();
this.hazards.create(13050+60, 1925, "hazard_up").setScale(1, 1).refreshBody();



//11860, 2240
this.hazards.create(12100, 2140-10, "hazard_down").setScale(1, 0.7).refreshBody().setSize(75, 80);
this.hazards.create(12300, 2245, "hazard_up").setScale(1, 0.7).refreshBody().setSize(75, 80);
this.hazards.create(12500, 2140-10, "hazard_down").setScale(1, 0.7).refreshBody().setSize(75, 80);
this.hazards.create(12700, 2245, "hazard_up").setScale(1, 0.7).refreshBody().setSize(75, 80);
this.hazards.create(12900, 2140-10, "hazard_down").setScale(1, 0.7).refreshBody().setSize(75, 15);
this.hazards.create(13100, 2245, "hazard_up").setScale(1, 0.7).setSize(15, 15).refreshBody();

    this.hazardSound = this.sound.add("hazardSound");
    this.hazardSound.setVolume(0.1); // Set volume (0.0 to 1.0)

    // Door sounds
    this.doorLocked = this.sound.add("doorLocked");
    this.doorLocked.setVolume(0.3);

    this.doorOpened = this.sound.add("doorOpened");
    this.doorOpened.setVolume(0.6);

    // doors (rooms 1 to 24)
    
    this.doors = [
      this.createDoor(965, 2114, "Room1").setScale(0.3).setDepth(1),
      this.createDoor(1900, 1840, "Room2").setScale(0.3).setDepth(1),
      this.createDoor(1130, 1575, "Room3").setScale(0.3).setDepth(1),
      this.createDoor(140, 1350, "Room4").setScale(0.3).setDepth(1),
      this.createDoor(850, 1210, "Room5").setScale(0.3).setDepth(1),
      this.createDoor(2080, 1290, "Room6").setScale(0.3).setDepth(1),
      this.createDoor(2355, 2240, "Room7").setScale(0.3).setDepth(1),
      this.createDoor(3100, 1284, "Room8").setScale(0.3).setDepth(1),
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
      this.createDoor(10500, 1580, "Room19").setScale(0.3).setDepth(1),
      this.createDoor(11255, 1685, "Room20").setScale(0.3).setDepth(1),
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
    this.cameras.main.setBounds(0, 0, extendedWorldWidth, extendedWorldHeight);
    this.cameras.main.setZoom(0.4); // Set the zoom level

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
        x: this.doors[13].x + 350,
        y: this.doors[13].y - 50,
        shown: false,
        message: "Press [shift] to dash\nwhile walking or jumping",
      }
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
            // Changed message into its own function
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

const worldWidth = 64 * (16 * 4); // 4096
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