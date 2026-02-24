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

        // Draw the robot on the right using the provided SVG
        if (!RoomManager.robotImage) {
            // Initialize image once and cache it
            RoomManager.robotImage = new Image();
            const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500" width="300" height="500">
              <defs>
                <linearGradient id="metal-grad-side" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#a0aec0" />
                  <stop offset="100%" stop-color="#718096" />
                </linearGradient>
                <linearGradient id="dark-metal-grad-side" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#718096" />
                  <stop offset="100%" stop-color="#4a5568" />
                </linearGradient>
                <linearGradient id="rust-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#c05621" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#9c4221" stop-opacity="0.9" />
                </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="2" dy="4" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <g transform="translate(50, 50)" filter="url(#shadow)">
                
                <g transform="translate(20, 320)">
                  <rect x="0" y="0" width="140" height="60" rx="30" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="4"/>
                  <circle cx="30" cy="30" r="20" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <circle cx="30" cy="30" r="8" fill="#2d3748"/>
                  <circle cx="110" cy="30" r="20" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <circle cx="110" cy="30" r="8" fill="#2d3748"/>
                  <line x1="60" y1="0" x2="60" y2="60" stroke="#2d3748" stroke-width="2"/>
                  <line x1="80" y1="0" x2="80" y2="60" stroke="#2d3748" stroke-width="2"/>
                  <path d="M 10 40 Q 30 55 50 45" fill="url(#rust-grad)" opacity="0.8"/>
                </g>

                <rect x="70" y="290" width="40" height="40" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="3"/>

                <rect x="40" y="150" width="100" height="140" rx="10" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                <rect x="55" y="170" width="70" height="100" rx="5" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="2" opacity="0.5"/>
                <path d="M 40 160 Q 60 180 40 220 L 40 160 Z" fill="url(#rust-grad)"/>
                <path d="M 140 250 Q 110 270 140 290 L 140 250 Z" fill="url(#rust-grad)"/>

                <rect x="70" y="130" width="40" height="20" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="3"/>

                <rect x="30" y="30" width="120" height="100" rx="10" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                <rect x="90" y="45" width="50" height="70" rx="5" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="2" opacity="0.3"/>
                <path d="M 30 40 Q 50 60 30 80 Z" fill="url(#rust-grad)"/>
                
                <line x1="130" y1="30" x2="130" y2="0" stroke="#2d3748" stroke-width="4" />
                <circle cx="130" cy="0" r="6" fill="#718096" stroke="#2d3748" stroke-width="2" />

                <g transform="translate(90, 160)">
                  <circle cx="0" cy="0" r="25" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <rect x="-15" y="0" width="30" height="70" rx="5" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <circle cx="0" cy="70" r="15" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <rect x="-12" y="70" width="24" height="60" rx="5" fill="url(#metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  <g transform="translate(0, 135)">
                      <path d="M -10 0 L -15 30 L 0 25 L 15 30 L 10 0 Z" fill="url(#dark-metal-grad-side)" stroke="#2d3748" stroke-width="3"/>
                  </g>
                   <path d="M -15 20 Q 0 40 15 20" fill="url(#rust-grad)" opacity="0.7"/>
                </g>

              </g>
            </svg>`;
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            RoomManager.robotImage.src = url;
        }

        // Draw the robot image near the right exit door if it has loaded
        if (RoomManager.robotImage.complete) {
            // The SVG is native 300x500. Scale it down to fit nicely in the room
            const scale = 0.3;
            const imgW = 300 * scale;
            const imgH = 500 * scale;
            const imgX = canvas.width - imgW - 20;
            const imgY = canvas.height - imgH - 40; // Rest it on the floor

            // If the robot is hostile, maybe draw a red glow behind it
            const currentRobot = RobotManager.getRobotForRoom(Game.roomIndex);
            if (currentRobot && currentRobot.isHostile) {
                ctx.save();
                ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
                ctx.shadowBlur = 20;
                ctx.drawImage(RoomManager.robotImage, imgX, imgY, imgW, imgH);
                ctx.restore();
            } else {
                ctx.drawImage(RoomManager.robotImage, imgX, imgY, imgW, imgH);
            }
        }
    }
};
