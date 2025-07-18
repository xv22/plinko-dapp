const canvas = document.getElementById("plinkoBoard");
const engine = Matter.Engine.create();
const world = engine.world;
const render = Matter.Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvas.width,
    height: canvas.height,
    background: '#111',
    wireframes: false
  }
});

const slotCount = 7;
const slotHeight = 40;
const slotMultipliers = [0, 0.5, 1, 2, 1, 0.5, 0];
const slotWidth = canvas.width / slotCount;

const pinRadius = 5;
const rows = 8;
const cols = 9;
const spacing = 40;

let ball = null;
let slots = [];
let pins = [];

// Генерация слотов
function generateSlots() {
  slots = [];
  const labelsContainer = document.getElementById("slotLabels");
  labelsContainer.innerHTML = "";

  for (let i = 0; i < slotCount; i++) {
    let x = i * slotWidth + slotWidth / 2;
    let y = canvas.height - slotHeight / 2;
    const wall = Matter.Bodies.rectangle(x, y, slotWidth, slotHeight, {
      isStatic: true,
      render: {
        fillStyle: '#222',
        strokeStyle: '#555',
        lineWidth: 2
      }
    });
    wall.label = `slot_${i}`;
    slots.push(wall);

    // Добавляем HTML-лейбл
    const label = document.createElement("span");
    label.textContent = `x${slotMultipliers[i]}`;
    labelsContainer.appendChild(label);
  }

  // Боковые стены
  const ground = Matter.Bodies.rectangle(canvas.width / 2, canvas.height + 20, canvas.width, 40, { isStatic: true });
  const leftWall = Matter.Bodies.rectangle(-10, canvas.height / 2, 20, canvas.height, { isStatic: true });
  const rightWall = Matter.Bodies.rectangle(canvas.width + 10, canvas.height / 2, 20, canvas.height, { isStatic: true });
  Matter.World.add(world, [ground, leftWall, rightWall]);
}

// Генерация пинов
function generatePins() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let offsetX = row % 2 === 0 ? 0 : spacing / 2;
      let x = col * spacing + offsetX + 40;
      let y = row * spacing + 60;
      const pin = Matter.Bodies.circle(x, y, pinRadius, {
        isStatic: true,
        restitution: 0.8,
        render: {
          fillStyle: '#00ffff'
        }
      });
      pins.push(pin);
    }
  }
}

// Падение шарика
function dropBall() {
  if (ball) {
    Matter.World.remove(world, ball);
  }
  ball = Matter.Bodies.circle(canvas.width / 2, 20, 10, {
    restitution: 0.6,
    friction: 0.01,
    frictionAir: 0.0005,
    render: {
      fillStyle: '#ff00ff',
      shadow: { color: '#ff00ff', blur: 10 }
    }
  });
  ball.label = "ball";
  Matter.World.add(world, ball);
}

// Проверка попадания в слот
Matter.Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach(pair => {
    const labels = [pair.bodyA.label, pair.bodyB.label];
    if (labels.includes("ball")) {
      const slot = slots.find(s => labels.includes(s.label));
      if (slot) {
        const index = parseInt(slot.label.split("_")[1]);
        const multiplier = slotMultipliers[index];
        setTimeout(() => alert(`Шарик попал в ячейку x${multiplier}! 🎉`), 100);
        Matter.World.remove(world, ball);
        ball = null;
      }
    }
  });
});

// Инициализация
generatePins();
generateSlots();
Matter.World.add(world, [...pins, ...slots]);
Matter.Engine.run(engine);
Matter.Render.run(render);
