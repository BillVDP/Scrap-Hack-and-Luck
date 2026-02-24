const Game = {
    canvas: null,
    ctx: null,
    player: null,
    currentState: 'CHECKPOINT', // CHECKPOINT, HAZARD, ENCOUNTER
    lastTime: 0,
    roomIndex: 0,

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Resize canvas to fit available space neatly
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));

        // Init player
        this.player = new Player(50, this.canvas.height - 110);

        // Setup initial rooms
        RoomManager.init();
        RobotManager.init();

        this.showCheckpoint();

        // Start loop
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    resizeCanvas() {
        this.canvas.width = Math.min(window.innerWidth * 0.8, 1200);
        this.canvas.height = Math.min(window.innerHeight * 0.6, 600);
    },

    startRun() {
        if (this.currentState === 'CHECKPOINT') {
            document.getElementById('overlay-screen').classList.add('hidden');
            this.currentState = 'HAZARD';
            RoomManager.loadRoom(this.roomIndex);
            this.player.x = 50; // Reset position
            this.updateHUD();
        }
    },

    resetToCheckpoint() {
        this.currentState = 'CHECKPOINT';
        if (this.roomIndex > 0) this.roomIndex--; // Force backtrack
        this.showCheckpoint();
    },

    showCheckpoint() {
        this.player.repairLimbs(); // Heal at checkpoint
        const overlay = document.getElementById('overlay-screen');
        overlay.classList.remove('hidden');
        document.getElementById('overlay-title').innerText = "WORKSHOP";
        document.getElementById('overlay-message').innerText = `Preparing for Room ${this.roomIndex + 1}`;
        document.getElementById('workshop-menu').classList.remove('hidden');
        document.getElementById('encounter-screen').classList.add('hidden');
        this.updateHUD();
    },

    equipGear(name, weight) {
        this.player.equippedGear = { name, weight };
        this.updateHUD();
    },

    setChassis(type) {
        this.player.chassis = type;
        this.updateHUD();
    },

    updateHUD() {
        if (!this.player) return;

        // Top Left
        let hearts = "";
        for (let i = 0; i < this.player.lives; i++) hearts += "❤️";
        document.getElementById('lives-display').innerText = hearts;

        const healthBar = document.getElementById('health-bar');
        healthBar.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('limb-status').innerText = `Limbs: ${this.player.limbStatus}`;
        if (this.player.limbStatus !== "Optimal") {
            document.getElementById('limb-status').style.color = "#ef4444";
        } else {
            document.getElementById('limb-status').style.color = "var(--text-muted)";
        }

        // Top Center
        const niceMeterBar = document.getElementById('nice-meter-bar');
        niceMeterBar.style.width = `${this.player.niceMeter}%`;
        let niceStatus = "Neutral";
        if (this.player.niceMeter > 75) niceStatus = "Angelic";
        else if (this.player.niceMeter < 25) niceStatus = "Hostile";
        document.getElementById('nice-meter-status').innerText = niceStatus;

        // Top Right
        document.getElementById('coins-display').innerText = this.player.coins;

        let currentWeight = this.player.equippedGear.weight + (this.player.coins * 2);
        document.getElementById('weight-display').innerText = `${currentWeight} / ${this.player.maxWeight}`;

        const weightBar = document.getElementById('weight-bar');
        weightBar.style.width = `${Math.min((currentWeight / this.player.maxWeight) * 100, 100)}%`;
        if (currentWeight > this.player.maxWeight) {
            weightBar.className = "progress-bar fill-red";
        } else if (currentWeight > this.player.maxWeight * 0.75) {
            weightBar.className = "progress-bar fill-orange";
        } else {
            weightBar.className = "progress-bar fill-green";
        }

        // Bottom Left
        document.getElementById('chassis-display').innerText = this.player.chassis;
        document.getElementById('gear-display').innerText = this.player.equippedGear.name;
    },

    checkRoomClear() {
        if (this.currentState === 'HAZARD') {
            // Did they pass the hazard check?
            if (RoomManager.currentRoom.checkHazard(this.player)) {
                // Passed! Trigger Encounter
                this.currentState = 'ENCOUNTER';
                Encounter.start(RobotManager.getRobotForRoom(this.roomIndex));
            } else {
                // Failed!
                this.player.takeDamage(100, "hazard"); // Instakill
            }
        }
    },

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas
        this.ctx.fillStyle = '#111827';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.currentState === 'HAZARD') {
            this.player.update();
            RoomManager.draw(this.ctx, this.canvas);
            this.player.draw(this.ctx);
        } else if (this.currentState === 'ENCOUNTER') {
            RoomManager.draw(this.ctx, this.canvas);
            this.player.draw(this.ctx);
            // Game logic paused, UI overlay active
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }
};

window.onload = () => {
    Game.init();
};
