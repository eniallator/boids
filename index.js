const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const paramConfig = new ParamConfig(
  "./config.json",
  window.location.search,
  $("#cfg-outer")
);
paramConfig.addCopyToClipboardHandler("#share-btn");

window.onresize = (evt) => {
  canvas.width = $("#canvas").width();
  canvas.height = $("#canvas").height();
};
window.onresize();

ctx.fillStyle = "black";
ctx.strokeStyle = "white";

const mouse = {
  down: false,
  clicked: false,
  pos: Vector.ZERO.copy(),
};
canvas.onmousemove = (ev) => {
  mouse.pos.setHead(ev.clientX / canvas.width, ev.clientY / canvas.height);
};
canvas.ontouchmove = (ev) => {
  mouse.pos.setHead(
    ev.touches[0].clientX / canvas.width,
    ev.touches[0].clientY / canvas.height
  );
};
canvas.onmousedown = canvas.ontouchstart = (ev) => {
  mouse.clicked = mouse.down === false;
  mouse.down = true;
  if (!isNaN(ev.clientX) && !isNaN(ev.clientY)) {
    mouse.pos.setHead(ev.clientX / canvas.width, ev.clientY / canvas.height);
  }
};
canvas.onmouseup = canvas.ontouchend = () => {
  mouse.clicked = false;
  mouse.down = false;
};

let boids = [];

function update(dt) {
  for (let boid of boids) {
    boid.update(
      dt,
      boids,
      paramConfig.getVal("boid_speed"),
      paramConfig.getVal("boid_wall_detection_radius"),
      paramConfig.getVal("other_boid_detection_radius"),
      paramConfig.getVal("boid_separation"),
      paramConfig.getVal("boid_alignment"),
      paramConfig.getVal("boid_cohesion"),
      paramConfig.getVal("boid_mouse_influence"),
      canvas.width / canvas.height,
      mouse.down ? mouse.pos : null
    );
  }
}

function draw(ctx) {
  ctx.fillStyle = "white";
  for (let boid of boids) {
    boid.draw(ctx, canvas.width, canvas.height);
  }
  ctx.fillStyle = "black";
}

let lastTime = Date.now();
function run() {
  const currTime = Date.now();
  const dt = currTime - lastTime;
  lastTime = currTime;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  update(dt);
  draw(ctx);

  requestAnimationFrame(run);
}

function init() {
  paramConfig.addListener(
    (state) => {
      const numBoids = state["num_boids"];
      if (boids.length === numBoids) return;
      if (boids.length > numBoids) {
        boids = boids.slice(boids.length - numBoids);
      } else {
        for (let i = boids.length; i < numBoids; i++) {
          boids.push(Boid.newRandom());
        }
      }
    },
    ["num_boids"]
  );

  paramConfig.tellListeners(true);
  run();
}

paramConfig.onLoad(init);
