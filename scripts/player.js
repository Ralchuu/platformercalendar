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
    this.dashCooldown = 1500; // Cooldown time between dashes in milliseconds
    this.isDashing = false; // Whether the player is currently dashing
    this.dashTimer = 0; // Dash timer
    this.dashCooldownTimer = 0; // Cooldown timer
  }

  update(cursors, wasd, spaceBar, shiftKey, delta) {
    // Dash cooldown timer logic
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= delta;
    }
  
    // Handle dash
    if (!this.isDashing && this.dashCooldownTimer <= 0 && (shiftKey.isDown)) {
      // Initiate the dash in the direction the player is facing
      this.isDashing = true;
      this.dashTimer = this.dashTime;
      this.dashCooldownTimer = this.dashCooldown; // Start cooldown
      this.setVelocityX(this.flipX ? -this.dashSpeed : this.dashSpeed); // Dash direction based on facing
  
      // Reset vertical velocity to keep the player's height the same
      this.setVelocityY(0);
  
      // Temporarily stop any movement to ensure dash consistency
      this.body.allowGravity = false;  // Disable gravity during the dash
    }
  
    // Dash behavior logic
    if (this.isDashing) {
      // Check for wall collisions during the dash
      const touchingLeftWall = this.body.blocked.left && !this.isTouchingPlatform(-1);
      const touchingRightWall = this.body.blocked.right && !this.isTouchingPlatform(1);
  
      if (touchingLeftWall || touchingRightWall) {
        // Stop dash if player hits a wall
        this.isDashing = false;
        this.setVelocityX(0);  // Stop horizontal dash movement
        this.body.allowGravity = true;  // Re-enable gravity
      }
  
      // Decrease dash timer
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false; // End the dash
        this.setVelocityX(0);  // Stop horizontal dash movement
        this.body.allowGravity = true;  // Re-enable gravity
      }
    }
  
    // Wall jumping cooldown timer logic
    if (this.isWallJumping) {
      this.wallJumpTimer -= delta;
      if (this.wallJumpTimer <= 0) {
        this.wallJumpTimer = 0;
        this.isWallJumping = false;
        // Reset image flip after wall jump lock time ends
        this.setFlipX(this.wallJumpDirection === -1);  // Keep flip in the wall jump direction
      }
      return;
    }
  
    // Horizontal movement logic
    const acceleration = 5;
    const deceleration = 10;
    const maxSpeed = 270;
  
    if (!this.isDashing) {
      if (cursors.left.isDown || wasd.left.isDown) {
        if (this.body.velocity.x > -maxSpeed) {
          this.setVelocityX(Math.max(this.body.velocity.x - acceleration * delta, -maxSpeed));
        }
        this.setFlipX(true);
      } else if (cursors.right.isDown || wasd.right.isDown) {
        if (this.body.velocity.x < maxSpeed) {
          this.setVelocityX(Math.min(this.body.velocity.x + acceleration * delta, maxSpeed));
        }
        this.setFlipX(false);
      } else {
        if (this.body.velocity.x > 0) {
          this.setVelocityX(Math.max(this.body.velocity.x - deceleration * delta, 0));
        } else if (this.body.velocity.x < 0) {
          this.setVelocityX(Math.min(this.body.velocity.x + deceleration * delta, 0));
        }
      }
    }
  
    // Wall sticking and sliding logic
    const touchingLeftWall = this.body.blocked.left && !this.isTouchingPlatform(-1);
    const touchingRightWall = this.body.blocked.right && !this.isTouchingPlatform(1);
  
    if (touchingLeftWall || touchingRightWall) {
      this.setVelocityX(0);
      this.isWallSliding = true;
  
      if (this.body.velocity.y < 0) {
        this.setVelocityY(0);
      }
  
      this.setVelocityY(Math.min(this.body.velocity.y + this.wallSlideSpeed, this.wallSlideMaxSpeed));
  
      if ((cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
        this.jumpButtonReleased && !this.jumpButtonPressed) {
        if (touchingLeftWall) {
          this.isWallJumping = true;
          this.wallJumpDirection = 1;
          this.wallJumpTimer = this.wallJumpLockTime;
          this.setVelocityX(300);
          this.setVelocityY(-700);
        } else if (touchingRightWall) {
          this.isWallJumping = true;
          this.wallJumpDirection = -1;
          this.wallJumpTimer = this.wallJumpLockTime;
          this.setVelocityX(-300);
          this.setVelocityY(-700);
        }
  
        this.isWallSliding = false;
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
  
        this.setFlipX(this.wallJumpDirection === -1);
      }
    } else {
      this.isWallSliding = false;
    }
  
    // Regular jumping and coyote time logicc
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
  
    if (this.body.velocity.y > 0 && this.coyoteTimer > 0 && this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
  
      if (this.jumpBufferTimer > 0) {
        this.setVelocityY(-700);
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
      }
    }
  
    if ((cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
      this.jumpButtonReleased && !this.jumpButtonPressed) {
      if (this.body.touching.down || this.coyoteTimer > 0) {
        this.setVelocityY(-700);
        this.canJump = false;
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
        this.coyoteTimer = 0;
      } else if (!touchingLeftWall && !touchingRightWall) {
        this.jumpBufferTimer = this.jumpBufferTime;
      }
    }
  
    if (this.jumpButtonPressed &&
      !cursors.up.isDown &&
      !wasd.up.isDown &&
      !spaceBar.isDown) {
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
