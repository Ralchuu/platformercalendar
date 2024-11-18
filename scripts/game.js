function create() {
  const bg = this.add.tileSprite(0, 0, config.width * 2, config.height, "background").setOrigin(0, 0);
  bg.setDisplaySize(config.width * 2, config.height);

  this.physics.world.setBounds(0, 0, config.width * 2, config.height);

  // Walls group
  const walls = this.physics.add.staticGroup();
  walls.create(200, 200, "platform").setScale(0.5, 10).refreshBody();
  walls.create(100, 250, "platform").setScale(0.5, 10).refreshBody();
  walls.create(750, 300, "platform").setScale(0.5, 10).refreshBody();
  walls.create(950, 350, "platform").setScale(0.5, 10).refreshBody();

  // Platforms group
  platforms = this.physics.add.staticGroup();
  platforms.create(200, 505, "wall").setScale(1, 0.5).refreshBody();
  platforms.create(400, 470, "wall").setScale(1, 1).refreshBody();
  platforms.create(500, 600, "wall").setScale(1000, 1).refreshBody();

  // Adding multiple doors
  for (let i = 1; i <= 24; i++) {
    const x = i * 600;
    const y = 330;
    walls.create(x, y, "platform").setScale(1.5, 0.2).refreshBody();
    const door = this.physics.add.sprite(x, y - 60, "door");
    door.setImmovable(true);
    door.body.allowGravity = false;
    doors.push(door);
  }

  // Create player (only once)
  player = new Player(this, playerStartX, playerStartY, "player");

  // Camera setup
  this.cameras.main.startFollow(player, true, 0.1, 0.1);  // Adding smooth follow parameters
  this.cameras.main.setBounds(0, 0, config.width * 2, config.height);

  // Colliders
  this.physics.add.collider(player, walls);
  this.physics.add.collider(player, platforms);

  // Input configuration
  cursors = this.input.keyboard.createCursorKeys();
  wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}
