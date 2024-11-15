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

    // Jump buffer settings
    this.jumpBufferTime = 100; // Buffer window in milliseconds
    this.jumpBufferTimer = 0;

    // Wall sliding settings
    this.wallSlideSpeed = 30; // Slower slide speed, adjust this value to make it slower
    this.wallSlideMaxSpeed = 30; // Max speed at which the player can slide down the wall
    this.isWallSliding = false; // Flag to check if the player is wall sliding
  }

  update(cursors, wasd, spaceBar, delta) {
    // Wall jumping cooldown timer logic
    if (this.isWallJumping) {
      this.wallJumpTimer -= delta;
      if (this.wallJumpTimer <= 0) {
        this.wallJumpTimer = 0;
        this.isWallJumping = false;
      }
      return;
    }
  
    // Horizontal movement logic
    const acceleration = 10;
    const deceleration = 10;
    const maxSpeed = 300;
  
    if (cursors.left.isDown || wasd.left.isDown) {
      if (this.body.velocity.x > -maxSpeed) {
        this.setVelocityX(Math.max(this.body.velocity.x - acceleration * delta, -maxSpeed));
      }
    } else if (cursors.right.isDown || wasd.right.isDown) {
      if (this.body.velocity.x < maxSpeed) {
        this.setVelocityX(Math.min(this.body.velocity.x + acceleration * delta, maxSpeed));
      }
    } else {
      if (this.body.velocity.x > 0) {
        this.setVelocityX(Math.max(this.body.velocity.x - deceleration * delta, 0));
      } else if (this.body.velocity.x < 0) {
        this.setVelocityX(Math.min(this.body.velocity.x + deceleration * delta, 0));
      }
    }
  
    // Wall sticking and sliding logic
    const touchingLeftWall = this.body.blocked.left && !this.isTouchingPlatform(-1);
    const touchingRightWall = this.body.blocked.right && !this.isTouchingPlatform(1);
  
    if (touchingLeftWall || touchingRightWall) {
      this.setVelocityX(0);  // Stop horizontal movement when touching a wall
      this.isWallSliding = true;
  
      if (this.body.velocity.y < 0) {
        this.setVelocityY(0);  // Stop upward movement when sliding
      }
  
      // Apply a small downward velocity to simulate wall sliding
      this.setVelocityY(Math.min(this.body.velocity.y + this.wallSlideSpeed, this.wallSlideMaxSpeed));
  
      // Wall jump logic: Prevent continuous wall jumps
      if (
        (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
        this.jumpButtonReleased && // Only jump if button was just released
        !this.jumpButtonPressed  // Only jump if button is just pressed
      ) {
        if (touchingLeftWall) {
          // Wall jump to the right
          this.isWallJumping = true;
          this.wallJumpTimer = this.wallJumpLockTime;
          this.setVelocityX(300);  // Wall jump direction (towards the right)
          this.setVelocityY(-700); // Wall jump height
        } else if (touchingRightWall) {
          // Wall jump to the left
          this.isWallJumping = true;
          this.wallJumpTimer = this.wallJumpLockTime;
          this.setVelocityX(-300); // Wall jump direction (towards the left)
          this.setVelocityY(-700); // Wall jump height
        }
  
        // Stop sliding when wall jumping
        this.isWallSliding = false;
        this.jumpButtonPressed = true; // Mark jump button as pressed to prevent continuous jumps
        this.jumpButtonReleased = false; // Mark the button as not released
      }
    } else {
      this.isWallSliding = false;
    }
  
    // Regular jumping and coyote time logic
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
  
    // Update jump buffer logic
    if (this.body.velocity.y > 0 && this.coyoteTimer > 0 && this.jumpBufferTimer > 0) {
      // If falling and close to the ground, allow the jump buffer to trigger
      this.jumpBufferTimer -= delta;
  
      if (this.jumpBufferTimer > 0) {
        this.setVelocityY(-700);  // Perform the jump
        this.jumpBufferTimer = 0;  // Reset the jump buffer timer
        this.coyoteTimer = 0;     // Reset coyote time
        this.jumpButtonPressed = true;
        this.jumpButtonReleased = false;
      }
    }
  
    // Regular jump logic
    if (
      (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
      this.jumpButtonReleased && // Only jump if the jump button was just released
      !this.jumpButtonPressed // Only jump if the jump button is just pressed
    ) {
      if (this.body.touching.down || this.coyoteTimer > 0) {
        this.setVelocityY(-700);  // Regular jump
        this.canJump = false;
        this.jumpButtonPressed = true;  // Mark jump button as pressed
        this.jumpButtonReleased = false;  // Prevent continuous jump
        this.coyoteTimer = 0;
      } else if (!touchingLeftWall && !touchingRightWall) {
        this.jumpBufferTimer = this.jumpBufferTime; // Buffer jump if not on ground or wall
      }
    }
  
    // Reset jump button states when button is released
    if (
      this.jumpButtonPressed &&
      !cursors.up.isDown &&
      !wasd.up.isDown &&
      !spaceBar.isDown
    ) {
      this.jumpButtonPressed = false; // Mark button as released
      this.jumpButtonReleased = true; // Allow the next jump press
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
