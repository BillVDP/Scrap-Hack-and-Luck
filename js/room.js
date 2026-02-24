class Room {
    constructor(id, name, hazardType, requirementLogic, bgColors) {
        this.id = id;
        this.name = name;
        this.hazardType = hazardType; // 'None', 'Quicksand', 'Helium', 'Lasers'
        this.requirementLogic = requirementLogic; // Function checking if player survives
        this.bgColors = bgColors;
    }

    checkHazard(player) {
        return this.requirementLogic(player);
    }
}

const RoomManager = {
    rooms: [],
    currentRoom: null,

    init() {
        // Room 0: Tutorial
        this.rooms.push(new Room(
            0,
            "Airlock (Tutorial)",
            "None",
            (player) => true, // Always survive
            ['#1e293b', '#0f172a']
        ));

        // Room 1: Quicksand
        this.rooms.push(new Room(
            1,
            "Sinking Sands",
            "Quicksand",
            (player) => {
                // Fails if total weight > 50 or no Hover Treads
                const isLight = player.getTotalWeight() <= 50;
                const hasHover = player.equippedGear.name === "Hover Treads";
                return isLight && hasHover;
            },
            ['#78350f', '#451a03']
        ));

        // Room 2: Helium Vent
        this.rooms.push(new Room(
            2,
            "Zero-G Vents",
            "Helium",
            (player) => {
                // Fails if total weight < 80 and no Heavy Boots
                const isHeavy = player.getTotalWeight() >= 80;
                const hasHeavyBoots = player.equippedGear.name === "Heavy Boots";
                return isHeavy && hasHeavyBoots;
            },
            ['#1e3a8a', '#172554']
        ));
    },

    loadRoom(index) {
        if (index < this.rooms.length) {
            this.currentRoom = this.rooms[index];
        } else {
            alert("YOU ESCAPED THE FACILITY! YOU WIN!");
            location.reload();
        }
    },

    draw(ctx, canvas) {
        if (!this.currentRoom) return;

        // Draw background gradient based on room type
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, this.currentRoom.bgColors[0]);
        grad.addColorStop(1, this.currentRoom.bgColors[1]);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw basic hazard floor/ceiling
        if (this.currentRoom.hazardType === "Quicksand") {
            ctx.fillStyle = "#b45309";
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        } else if (this.currentRoom.hazardType === "Helium") {
            ctx.fillStyle = "#ef4444"; // Spiked ceiling
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + 10, 20);
                ctx.lineTo(i + 20, 0);
                ctx.fill();
            }
        } else {
            // Normal solid floor
            ctx.fillStyle = "#334155";
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        }

        // Draw room name text subtly in background
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.font = "bold 60px Orbitron";
        ctx.textAlign = "center";
        ctx.fillText(this.currentRoom.name.toUpperCase(), canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left"; // reset

        // Draw the robot placeholder on the right
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(canvas.width - 80, canvas.height - 100, 60, 60);
        ctx.fillStyle = "#000";
        ctx.font = "20px Arial";
        ctx.fillText("🤖", canvas.width - 60, canvas.height - 65);
    }
};
