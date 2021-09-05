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
      canvas.width / canvas.height
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
