export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics properties
    this.setBounce(0);
    this.setCollideWorldBounds(true);

    // Jump and movement states
    this.canJump = false;
    this.jumpButtonPressed = false;
    this.jumpButtonReleased = true;
    this.coyoteTime = 100; // Coyote time window in milliseconds
    this.coyoteTimer = 0;

    // Jump buffer settings
    this.jumpBufferTime = 100; // Buffer window in milliseconds
    this.jumpBufferTimer = 0;
  }

  update(cursors, wasd, spaceBar, delta) {
    this.setVelocityX(0);

    if (cursors.left.isDown || wasd.left.isDown) {
      this.setVelocityX(-250);
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.setVelocityX(250);
    }

    // Handle ground and coyote time logic
    if (this.body.touching.down) {
      // On the ground: reset coyote and buffer timers, allow jumping
      this.canJump = true;
      this.coyoteTimer = this.coyoteTime; // Reset coyote time
      this.jumpBufferTimer = 0;           // Reset jump buffer
    } else {
      // In the air: decrease coyote timer
      this.coyoteTimer -= delta;
      if (this.coyoteTimer <= 0) {
        this.coyoteTimer = 0; // Coyote time ends
        this.canJump = false; // Disable further jumps once coyote time ends
      }
    }

    // Track if jump button is released
    if (!cursors.up.isDown && !wasd.up.isDown && !spaceBar.isDown) {
      this.jumpButtonReleased = true;
    }

    // Start jump buffer when jump button is pressed in the air
    if (
      (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
      this.jumpButtonReleased &&
      !this.jumpButtonPressed
    ) {
      if (this.body.touching.down || this.coyoteTimer > 0) {
        // Jump only if on ground or within coyote time
        this.setVelocityY(-700);
        this.canJump = false;
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
        this.coyoteTimer = 0; // Reset coyote timer after jumping
      } else {
        // If not grounded or in coyote time, start jump buffer
        this.jumpBufferTimer = this.jumpBufferTime;
      }
    }

    // Process jump buffer if active
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
      // Execute jump if the buffer is active and coyote time permits
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.setVelocityY(-700);
        this.jumpBufferTimer = 0;  // Reset buffer timer after jump
        this.coyoteTimer = 0;      // Reset coyote time
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
      }
    }

    // Reset jump button states if released
    if (
      this.jumpButtonPressed &&
      !cursors.up.isDown &&
      !wasd.up.isDown &&
      !spaceBar.isDown
    ) {
      this.jumpButtonPressed = false;
      this.jumpButtonReleased = true;
    }
  }

  resetPosition(startX, startY) {
    this.setPosition(startX, startY);
    this.setVelocity(0, 0); // Stop any momentum
  }
}
