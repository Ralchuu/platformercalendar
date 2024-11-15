export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, platforms) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Save reference to non-wall-jumpable platforms
    this.platforms = platforms;

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
    if (this.isWallJumping) {
      this.wallJumpTimer -= delta;
      if (this.wallJumpTimer <= 0) {
        this.wallJumpTimer = 0;
        this.isWallJumping = false;
      }
      return;
    }

    this.setVelocityX(0);

    if (cursors.left.isDown || wasd.left.isDown) {
      this.setVelocityX(-250);
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.setVelocityX(250);
    }

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

    const touchingLeftWall = this.body.blocked.left && !this.isTouchingPlatform(-1);
    const touchingRightWall = this.body.blocked.right && !this.isTouchingPlatform(1);

    if (!cursors.up.isDown && !wasd.up.isDown && !spaceBar.isDown) {
      this.jumpButtonReleased = true;
    }

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
        this.isWallJumping = true;
        this.wallJumpTimer = this.wallJumpLockTime;
        const jumpDirection = touchingLeftWall ? 1 : -1;
        this.setVelocityX(300 * jumpDirection);
        this.setVelocityY(-700);
      } else {
        this.jumpBufferTimer = this.jumpBufferTime;
      }
    }

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

  isTouchingPlatform(direction) {
    const platforms = this.platforms.getChildren();
    return platforms.some(platform => {
      const platformBounds = platform.getBounds();
      const playerBounds = this.getBounds();

      if (direction === -1) {
        return (
          playerBounds.left <= platformBounds.right &&
          playerBounds.right > platformBounds.left &&
          playerBounds.bottom > platformBounds.top &&
          playerBounds.top < platformBounds.bottom
        );
      } else if (direction === 1) {
        return (
          playerBounds.right >= platformBounds.left &&
          playerBounds.left < platformBounds.right &&
          playerBounds.bottom > platformBounds.top &&
          playerBounds.top < platformBounds.bottom
        );
      }
      return false;
    });
  }

  resetPosition(startX, startY) {
    this.setPosition(startX, startY);
    this.setVelocity(0, 0);
  }
}
