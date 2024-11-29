import Player from "../player.js";

class Room1 extends Phaser.Scene {
  constructor() {
    super("Room1");
  }



  preload() {
    this.load.image("background", "assets/2testbackground.png");
    this.load.image("player", "assets/elf1.png");
    this.load.image("platform", "assets/ground1.png");
    this.load.image("door", "assets/castledoors.png");
    this.load.image("cabin-wall", "assets/cabin-wall.png");    
    this.load.image("frame", "assets/frame.png");
    this.load.audio("doorClosingSound", "assets/audio/ovenSulkeminen_01.wav");
  }

  create(data) {
    this.width = 1024;
    this.height = 576;
    const playerStartX = 420;
    const playerStartY = 369;

    const bg = this.add
      .tileSprite(0, 0, this.width * 2, this.height, "background")
      .setOrigin(0, 0);
    bg.setDisplaySize(this.width * 2, this.height);

    this.doorClosingSound = this.sound.add("doorClosingSound");
    this.doorClosingSound.setVolume(0.45);

    this.walls = this.physics.add.staticGroup();
    this.walls.create(120, 1980, "wall").setScale(0.5, 10).refreshBody();
    
    this.physics.world.setBounds(0, 0, this.width * 2, this.height);
    
    
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(320, 355, "platform").setScale(0.1, 10.5).refreshBody().setDepth(-1);
    this.platforms.create(810, 370, "platform").setScale(0.1, 10).refreshBody().setDepth(-1);
    this.platforms.create(785, 395, "platform").setScale(0.5, 0.5).refreshBody().setDepth(-1);
    this.platforms.create(500, 415, "platform").setScale(1000, 0.2).refreshBody().setDepth(-1);
    this.platforms.create(545, 330, "platform").setScale(0.6, 0.01).refreshBody().setDepth(1);

    this.player = new Player(this, playerStartX, playerStartY, "player", this.platforms);
    this.player.setDepth(50);
    this.returnDoor = this.physics.add.sprite(420, 350, "door").setScale(0.4).setDepth(2);
    this.returnDoor.setImmovable(true);
    this.returnDoor.body.allowGravity = false;

    this.add.image(511, 290,"cabin-wall").setScale(0.318).setDepth(0.3);    
    this.add.image(572.4, 318,"frame").setScale(0.435, 0.40).setDepth(0.3);
    

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

    // Zoom the camera
    this.cameras.main.setZoom(1.8); 


    this.addYouTubeVideo();

    // Jos seuraava koodi käytössä, pelaaja ei jostain syystä voi liikkua. Ilman koodinpätkää toimii.
/*
    const videoIframe = document.getElementById('youtubeDiv');
    const music = document.getElementById("background-music");
    videoIframe.onload = () => {
      if (music && music.isPlaying) {
        music.pause();
      }
    };

    // Listen for when the video finishes playing to resume the music
    videoIframe.onended = () => {
      if (music && ! music.isPlaying) {
        music.play();
      }
    };

*/
    
  }

  update(time, delta) {
    // Update player movement, dash, and jump input
    this.player.update(this.cursors, this.wasd, this.spaceBar, this.shiftKey, delta);

    // Check if the player is near the door and presses 'E' to transition
    if (
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnDoor.x, this.returnDoor.y) < 50 &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      this.removeYouTubeVideo(); // Remove YouTube iframe
      this.doorClosingSound.play();
      this.scene.start("MainGameScene");  // Transition to another scene
    }

// disable collision from below
    this.platforms.getChildren().forEach(platform => {
      platform.body.checkCollision.down = false;
    });
  }


  addYouTubeVideo() {
    const youtubeDiv = document.createElement('div');
    youtubeDiv.id = 'youtube-video';
    youtubeDiv.style.position = 'absolute';
    youtubeDiv.style.top = '270px'; // Adjust top position :))
    youtubeDiv.style.left = '442px'; // Adjust left position
  
    // Add the YouTube iframe
    youtubeDiv.innerHTML = `
        <iframe
            width="320"
            height="230"
            src="https://www.youtube.com/embed/8lFjrAj-vrk?controls=0&modestbranding=1&rel=0&autohide=1"
            frameborder="0"
            allowfullscreen>
        </iframe>
    `;
  
    // Append the div to the body
    document.body.appendChild(youtubeDiv);
  }

  removeYouTubeVideo() {
    const youtubeDiv = document.getElementById("youtube-video");
    if (youtubeDiv) {
      youtubeDiv.remove();
    }
  }
}

export default Room1;
