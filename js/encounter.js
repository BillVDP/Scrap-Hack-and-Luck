const Encounter = {
    currentRobot: null,

    start(robot) {
        this.currentRobot = robot;

        // Setup UI
        document.getElementById('encounter-screen').classList.remove('hidden');
        document.getElementById('encounter-entity-name').innerText = robot.name;
        document.getElementById('encounter-dialogue').innerText = robot.dialogue;

        // Hide sub-menus
        document.getElementById('coax-sub-menu').classList.add('hidden');
        document.querySelector('.encounter-choices').classList.remove('hidden');

        // Check if hostile from backtracking
        if (robot.isHostile) {
            document.getElementById('encounter-dialogue').style.color = "#ef4444";
            document.getElementById('encounter-dialogue').innerText = "SYSTEM ERROR. HOSTILITY DETECTED. PREVIOUS LIE/FIGHT REMEMBERED.";
            // Force Fight
            document.querySelector('.coax-btn').style.display = 'none';
            document.querySelector('.roll-btn').style.display = 'none';
        } else {
            document.getElementById('encounter-dialogue').style.color = "#cbd5e1";
            document.querySelector('.coax-btn').style.display = 'flex';
            document.querySelector('.roll-btn').style.display = 'flex';
        }

        Game.updateHUD();
    },

    chooseAction(action) {
        const player = Game.player;
        const robot = this.currentRobot;

        if (action === 'FIGHT') {
            this.handleFight(player, robot);
        } else if (action === 'COAX') {
            // Show sub-menu
            document.querySelector('.encounter-choices').classList.add('hidden');
            document.getElementById('coax-sub-menu').classList.remove('hidden');
        } else if (action === 'ROLL') {
            this.handleRoll(player, robot);
        }
    },

    executeCoax(subAction) {
        const player = Game.player;
        const robot = this.currentRobot;

        if (subAction === 'BUY') {
            if (player.coins >= 5) {
                player.coins -= 5;
                player.niceMeter = Math.min(100, player.niceMeter + 10);
                this.resolveEncounter("Transaction complete. Hint for next room acquired.");
            } else {
                alert("Not enough coins! (Need 5)");
            }
        } else if (subAction === 'LIE') {
            robot.hasBeenLiedTo = true;
            player.niceMeter = Math.max(0, player.niceMeter - 20);
            this.resolveEncounter("You bluffed successfully. Hint acquired, but they will remember if you return.");
        }
    },

    cancelCoax() {
        document.querySelector('.encounter-choices').classList.remove('hidden');
        document.getElementById('coax-sub-menu').classList.add('hidden');
    },

    handleFight(player, robot) {
        robot.hasBeenFought = true;
        player.niceMeter = Math.max(0, player.niceMeter - 30); // Fighting is aggressive

        let playerWins = false;

        // Rock Paper Scissors logic based on Archetype vs Chassis
        if (robot.archetype === 'Friendly') {
            playerWins = true; // Monster
        } else if (robot.archetype === 'Hulk') {
            playerWins = player.chassis === 'Speed/Bladed';
        } else if (robot.archetype === 'Cutter') {
            playerWins = player.chassis === 'Hacking/Digital';
        } else if (robot.archetype === 'Brain') {
            playerWins = player.chassis === 'Heavy/Armor';
        }

        // If Hostile (pursuer), fighting is harder
        if (robot.isHostile && Math.random() < 0.5) {
            playerWins = false; // 50% chance to lose even with right chassis due to rage
        }

        if (playerWins) {
            player.coins += 10; // Loot
            this.resolveEncounter("You destroyed the guardian and salvaged 10 coins. Hint acquired.");
        } else {
            // Player loses fight
            player.takeDamage(50, 'combat');
            if (player.health > 0) {
                this.resolveEncounter("You barely survived the fight. You took 50 DMG and gained nothing. Fleeing to next room.");
            } else {
                this.endEncounterUI(); // Player died, handled by Game loop resetting to checkpoint
            }
        }
    },

    handleRoll(player, robot) {
        player.niceMeter = Math.max(0, player.niceMeter - 5); // Gambling is slightly impolite

        const roll = Math.random();
        if (roll > 0.5) { // 50/50 Chance
            player.coins += 5; // Lucked out finding coins
            this.resolveEncounter("Lucky Roll! You found 5 coins and snuck past.");
        } else {
            // Bad luck
            this.resolveEncounter("Bad Luck! You tripped an alarm and had to flee blindly.");
        }
    },

    resolveEncounter(message) {
        alert(message);
        this.endEncounterUI();
        Game.roomIndex++;
        Game.resetToCheckpoint();
    },

    endEncounterUI() {
        document.getElementById('encounter-screen').classList.add('hidden');
        document.querySelector('.encounter-choices').classList.remove('hidden');
        document.getElementById('coax-sub-menu').classList.add('hidden');
    }
};
