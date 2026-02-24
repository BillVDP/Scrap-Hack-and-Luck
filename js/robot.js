class Robot {
    constructor(id, name, archetype, dialogue) {
        this.id = id;
        this.name = name;
        this.archetype = archetype; // 'Friendly', 'Hulk', 'Cutter', 'Brain'
        this.dialogue = dialogue;

        // State tracking for nemeses system
        this.hasBeenLiedTo = false;
        this.hasBeenFought = false;
        this.isHostile = false;
    }

    checkHostility() {
        if (this.hasBeenLiedTo || this.hasBeenFought) {
            this.isHostile = true;
            this.dialogue = "SYSTEM ERROR. HOSTILITY DETECTED. DEACTIVATION IMMINENT.";
        }
    }
}

const RobotManager = {
    robots: {}, // Store all encountered bots by room index

    init() {
        // Room 0 Guardian
        this.robots[0] = new Robot(
            "bot-0",
            "Unit-7A (Friendly)",
            "Friendly",
            "Hello, Traveler! I am here to help. You need to equip HOVER TREADS to pass the next room. Beware the Quicksand."
        );

        // Room 1 Guardian
        this.robots[1] = new Robot(
            "bot-1",
            "The Hulk-Bot",
            "Hulk",
            "HALT. Heavy armor frame active. Cannot pass without paying processing fee."
        );

        // Room 2 Guardian
        this.robots[2] = new Robot(
            "bot-2",
            "The Cutter-Drone",
            "Cutter",
            "Target Acquired. Commencing slice operations... unless input overriding variables (5 coins)."
        );
    },

    getRobotForRoom(roomIndex) {
        if (this.robots[roomIndex]) {
            // Update its hostility state in case player backtracked
            this.robots[roomIndex].checkHostility();
            return this.robots[roomIndex];
        }
        return new Robot("bot-X", "Unknown Entity", "Friendly", "End of prototype data.");
    }
};
