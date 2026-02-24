class Player {
    constructor(x, y) {
        // Physics
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpForce = -12;
        this.gravity = 0.6;
        this.grounded = false;

        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.lives = 3;
        this.coins = 0;
        this.niceMeter = 50; // 0 = Evil, 100 = Angel
        this.maxWeight = 100; // Base carry capacity
        
        // Loadout
        this.equippedGear = { name: "None", weight: 0 };
        this.chassis = "Standard Frame";
        this.limbStatus = "Optimal"; // Can be 'Missing Arm', 'Missing Leg'

        // Controls
        this.keys = { left: false, right: false, up: false };
        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.keys.up = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') this.keys.up = false;
        });
    }

    getTotalWeight() {
        // Assume each coin weighs 2kg adding to the tension
        return this.equippedGear.weight + (this.coins * 2);
    }

    takeDamage(amount, type) {
        this.health -= amount;
        if (this.health <= 0) {
            this.loseLife();
        } else if (Math.random() > 0.7) { // 30% chance for limb loss on hit
            this.loseLimb();
        }
        Game.updateHUD();
    }

    loseLimb() {
        if (this.limbStatus === "Optimal") {
            this.limbStatus = Math.random() > 0.5 ? "Missing Arm" : "Missing Leg";
            if (this.limbStatus === "Missing Leg") {
                this.speed = 2.5; // Halve speed
                this.jumpForce = -8; // Reduce jump height
            }
        }
    }

    repairLimbs() {
        this.limbStatus = "Optimal";
        this.speed = 5;
        this.jumpForce = -12;
        this.health = this.maxHealth;
        Game.updateHUD();
    }

    loseLife() {
        this.lives--;
        this.repairLimbs();
        if (this.lives <= 0) {
            // Hard Game Over logic here
            alert("GAME OVER. Restarting module.");
            location.reload();
        } else {
            // Reset player to safe zone
            Game.resetToCheckpoint();
        }
    }

    update() {
        // If missing leg, speed is reduced
        let currentSpeed = this.speed;

        // X Movement
        if (this.keys.left) this.vx = -currentSpeed;
        else if (this.keys.right) this.vx = currentSpeed;
        else this.vx = 0;

        this.x += this.vx;

        // Y Movement (Gravity and Jumping)
        this.vy += this.gravity;
        this.y += this.vy;

        // Floor collision (Basic for now)
        const floorY = Game.canvas.height - 50; 
        if (this.y + this.height > floorY) {
            this.y = floorY - this.height;
            this.vy = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        // Jumping
        if (this.keys.up && this.grounded) {
            this.vy = this.jumpForce;
            this.grounded = false;
        }

        // Prevent walking backwards out of bounds
        if (this.x < 0) this.x = 0;

        // Trigger right side transition to next room/encounter
        if (this.x > Game.canvas.width - 20) {
            Game.checkRoomClear();
        }
    }

    draw(ctx) {
        // Draw Player Body outline mapping Chassis
        ctx.fillStyle = this.chassis === "Standard Frame" ? "#e2e8f0" : 
                        this.chassis === "Speed/Bladed" ? "#3b82f6" : 
                        this.chassis === "Heavy/Armor" ? "#f59e0b" : "#10b981";
                        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw Helmet/Eye
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(this.x + (this.vx >= 0 ? 20 : 5), this.y + 10, 15, 10);
        ctx.fillStyle = "#ef4444"; // Glowing red eye
        ctx.fillRect(this.x + (this.vx >= 0 ? 25 : 10), this.y + 12, 5, 5);

        // Draw limb status indicator if damaged
        if (this.limbStatus !== "Optimal") {
            ctx.fillStyle = "#ef4444";
            ctx.font = "12px Arial";
            ctx.fillText("⚠️ DMG", this.x, this.y - 10);
        }
    }
}
