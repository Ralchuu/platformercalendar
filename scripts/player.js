export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, platforms) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(30, 55);  // Adjusts the hitbox size
    this.body.setOffset(17, 10); // Offsets the hitbox to move it

    // Save reference to non-wall-jumpable platforms
    this.platforms = platforms;

    // Physics properties
    this.setBounce(0);
    this.setCollideWorldBounds(true);

    // Animation: Play idle animation by default
    this.play('idle'); // Assumes the 'idle' animation is already defined in game.js

    // Jump and movement states
    this.canJump = false;
    this.jumpButtonPressed = false;
    this.jumpButtonReleased = true;
    this.coyoteTime = 100; // Coyote time window in milliseconds
    this.coyoteTimer = 0;

    // Wall jump state
    this.isWallJumping = false;
    this.wallJumpLockTime = 200; // Lock time after wall jump
    this.wallJumpTimer = 0;
    this.wallJumpDirection = 0; // 1 = right, -1 = left

    // Jump buffer settings
    this.jumpBufferTime = 100; // Buffer window in milliseconds
    this.jumpBufferTimer = 0;

    // Wall sliding settings
    this.wallSlideSpeed = 30; // Slide speed, adjust this value to make it slower
    this.wallSlideMaxSpeed = 30; // Max speed at which the player can slide down the wall
    this.isWallSliding = false; // Flag to check if the player is wall sliding

    // Dash settings
    this.dashSpeed = 1000; // Dash speed
    this.dashTime = 170;  // Duration of the dash in milliseconds
    this.dashCooldown = 700; // Cooldown time between dashes in milliseconds
    this.isDashing = false; // Whether the player is currently dashing
    this.dashTimer = 0; // Dash timer
    this.dashCooldownTimer = 0; // Cooldown timer
    this.dashSound = null;
  }

  setDashSound(sound) {
    this.dashSound = sound; // Assign the dash sound
  }

  update(cursors, wasd, spaceBar, shiftKey, delta) {
    // Safely handle null inputs
    const isLeftPressed = cursors?.left?.isDown || wasd?.left?.isDown || false;
    const isRightPressed = cursors?.right?.isDown || wasd?.right?.isDown || false;
    const isUpPressed = cursors?.up?.isDown || wasd?.up?.isDown || spaceBar?.isDown || false;

    // Check player movement state to control idle animation
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0 && !this.anims.isPlaying) {
      this.play('idle', true); // Play the idle animation (looped)
    } else if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.stop('idle'); // Stop idle animation when moving
    }

    // Dash cooldown timer logic
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }

    // Other movement logic (e.g., dashing, wall jumping, etc.)...
    // [This part remains unchanged, as it's already provided in your original code]
  }

  // isTouchingWall method (fixed)
  isTouchingWall(direction) {
    const walls = this.scene.walls.getChildren(); // Get children of the wall group
    return walls.some(wall => {
      const wallBounds = wall.getBounds();
      const playerBounds = this.getBounds();

      if (direction === -1) {
        return playerBounds.left <= wallBounds.right &&
          playerBounds.right > wallBounds.left &&
          playerBounds.bottom > wallBounds.top &&
          playerBounds.top < wallBounds.bottom;
      } else if (direction === 1) {
        return playerBounds.right >= wallBounds.left &&
          playerBounds.left < wallBounds.right &&
          playerBounds.bottom > wallBounds.top &&
          playerBounds.top < wallBounds.bottom;
      }
      return false;
    });
  }
}
