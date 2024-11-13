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
      this.coyoteTime = 100;
      this.coyoteTimer = 0;
      this.jumpBufferTime = 20;
      this.jumpBufferTimer = 0;
    }
  
    update(cursors, wasd, spaceBar, delta) {
      this.setVelocityX(0);
  
      if (cursors.left.isDown || wasd.left.isDown) {
        this.setVelocityX(-250);
      } else if (cursors.right.isDown || wasd.right.isDown) {
        this.setVelocityX(250);
      }
  
      // Handle coyote time and jump buffer
      if (!this.body.touching.down) {
        this.coyoteTimer += delta;
        if (this.coyoteTimer > this.coyoteTime) {
          this.canJump = false;
        }
      } else {
        this.canJump = true;
        this.coyoteTimer = 0;
      }
  
      if (!cursors.up.isDown && !wasd.up.isDown && !spaceBar.isDown) {
        this.jumpButtonReleased = true;
      }
  
      if (
        (cursors.up.isDown || wasd.up.isDown || spaceBar.isDown) &&
        this.jumpButtonReleased &&
        !this.jumpButtonPressed
      ) {
        if (this.canJump) {
          this.setVelocityY(-700);
          this.canJump = false;
          this.jumpButtonPressed = true;
          this.jumpButtonReleased = false;
        } else {
          this.jumpBufferTimer = this.jumpBufferTime;
          this.jumpButtonPressed = true;
        }
      }
  
      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer -= delta;
      }
  
      if (
        this.jumpButtonPressed &&
        !cursors.up.isDown &&
        !wasd.up.isDown &&
        !spaceBar.isDown
      ) {
        this.jumpButtonPressed = false;
      }
    }
  
    resetPosition(startX, startY) {
      this.setPosition(startX, startY);
      this.setVelocity(0, 0); // Stop any momentum
    }
  }
  