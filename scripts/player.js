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

    // Wall jump state
    this.isWallJumping = false;
    this.wallJumpLockTime = 300; // Lock time after wall jump
    this.wallJumpTimer = 0;

    // Jump buffer settings
    this.jumpBufferTime = 100; // Buffer window in milliseconds
    this.jumpBufferTimer = 0;
  }

  update(cursors, wasd, spaceBar, delta) {
    // Lock inputs during wall jump
    if (this.isWallJumping) {
      this.wallJumpTimer -= delta;
      if (this.wallJumpTimer <= 0) {
        this.wallJumpTimer = 0;
        this.isWallJumping = false; // Unlock input
      }
      return; // Skip further input handling during wall jump
    }

    this.setVelocityX(0);

    if (cursors.left.isDown || wasd.left.isDown) {
      this.setVelocityX(-250);
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.setVelocityX(250);
    }

    // Handle ground and coyote time logic
    if (this.body.touching.down) {
      this.canJump = true;
      this.coyoteTimer = this.coyoteTime;
      this.jumpBufferTimer = 0;
    } else {
      this.coyoteTimer -= delta;
      if (this.coyoteTimer <= 0) {
        this.coyoteTimer = 0;
        this.canJump = false;
      }
    }

    // Wall detection
    const touchingLeftWall = this.body.blocked.left;
    const touchingRightWall = this.body.blocked.right;

    // Jump button released state
    if (!cursors.up.isDown && !wasd.up.isDown && !spaceBar.isDown) {
      this.jumpButtonReleased = true;
    }

    // Handle jumping logic
    if (
      (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
      this.jumpButtonReleased &&
      !this.jumpButtonPressed
    ) {
      if (this.body.touching.down || this.coyoteTimer > 0) {
        this.setVelocityY(-700);
        this.canJump = false;
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
        this.coyoteTimer = 0;
      } else if (touchingLeftWall || touchingRightWall) {
        // Wall jump logic
        this.isWallJumping = true;
        this.wallJumpTimer = this.wallJumpLockTime;

        // Determine jump direction away from wall
        const jumpDirection = touchingLeftWall ? 1 : -1;
        this.setVelocityX(300 * jumpDirection);
        this.setVelocityY(-700);
      } else {
        this.jumpBufferTimer = this.jumpBufferTime;
      }
    }

    // Process jump buffer
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.setVelocityY(-700);
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
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
    this.setVelocity(0, 0);
  }
}
