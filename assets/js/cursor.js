(function () {
  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  var customCursor = document.querySelector(".velocity-cursor");
  var cursorDot = document.querySelector(".velocity-cursor__dot");
  var cursorRing = document.querySelector(".velocity-cursor__ring");
  var cursorGlow = document.querySelector(".velocity-cursor__glow");
  var pageCanvas = document.querySelector(".page-particles");

  if (!customCursor || !cursorDot || !cursorRing || !cursorGlow) {
    return;
  }

  var pageContext = pageCanvas ? pageCanvas.getContext("2d") : null;
  var maximumVelocity = 1500;
  var particles = [];

  var pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    time: performance.now(),
    rawVelocity: 0,
    velocity: 0,
    angle: 0,
    active: false
  };

  var ring = { x: pointer.x, y: pointer.y };
  var dot = { x: pointer.x, y: pointer.y };

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function resizeCanvas() {
    if (!pageCanvas || !pageContext) {
      return;
    }

    var ratio = Math.min(window.devicePixelRatio || 1, 2);

    pageCanvas.width = window.innerWidth * ratio;
    pageCanvas.height = window.innerHeight * ratio;
    pageCanvas.style.width = window.innerWidth + "px";
    pageCanvas.style.height = window.innerHeight + "px";
    pageContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function getEnergy() {
    return clamp(pointer.velocity / maximumVelocity, 0, 1);
  }

  function createParticle(x, y, energy) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.4 + energy * 3.2 * Math.random();

    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.016 + Math.random() * 0.02,
      size: 1.2 + energy * 3.5,
      energy: energy
    });
  }

  function updatePointer(event) {
    var now = performance.now();
    var dx = event.clientX - pointer.x;
    var dy = event.clientY - pointer.y;
    var distance = Math.hypot(dx, dy);
    var deltaTime = Math.max(now - pointer.time, 1);
    var velocity = distance / (deltaTime / 1000);

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.time = now;
    pointer.rawVelocity = clamp(velocity, 0, 4000);
    pointer.angle = Math.atan2(dy, dx);
    pointer.active = true;

    customCursor.classList.add("is-active");

    var energy = clamp(pointer.rawVelocity / maximumVelocity, 0, 1);

    if (energy > 0.32) {
      var count = Math.floor(1 + energy * 5);
      for (var i = 0; i < count; i += 1) {
        createParticle(pointer.x, pointer.y, energy);
      }
    }
  }

  function updateVelocity() {
    pointer.velocity += (pointer.rawVelocity - pointer.velocity) * 0.12;
    pointer.rawVelocity *= 0.9;

    if (pointer.rawVelocity < 8) {
      pointer.rawVelocity = 0;
    }

    if (pointer.velocity < 8) {
      pointer.velocity = 0;
    }
  }

  function updateCursor() {
    var energy = getEnergy();

    dot.x += (pointer.x - dot.x) * 0.55;
    dot.y += (pointer.y - dot.y) * 0.55;
    ring.x += (pointer.x - ring.x) * 0.16;
    ring.y += (pointer.y - ring.y) * 0.16;

    var stretchX = 1 + energy * 1.15;
    var stretchY = 1 - energy * 0.34;
    var glowScale = 0.7 + energy * 1.35;
    var glowOpacity = 0.12 + energy * 0.5;

    cursorDot.style.transform =
      "translate(" + dot.x + "px, " + dot.y + "px) translate(-50%, -50%)";

    cursorRing.style.transform =
      "translate(" + ring.x + "px, " + ring.y + "px) translate(-50%, -50%) rotate(" +
      pointer.angle + "rad) scale(" + stretchX + ", " + stretchY + ")";

    cursorGlow.style.opacity = glowOpacity;
    cursorGlow.style.transform =
      "translate(" + ring.x + "px, " + ring.y + "px) translate(-50%, -50%) scale(" +
      glowScale + ")";
  }

  function updateParticles() {
    for (var index = particles.length - 1; index >= 0; index -= 1) {
      var particle = particles[index];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.975;
      particle.vy *= 0.975;
      particle.life -= particle.decay;

      if (particle.life <= 0) {
        particles.splice(index, 1);
      }
    }
  }

  function renderPageParticles() {
    if (!pageContext) {
      return;
    }

    pageContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach(function (particle) {
      pageContext.beginPath();
      pageContext.arc(
        particle.x,
        particle.y,
        particle.size * particle.life,
        0,
        Math.PI * 2
      );

      pageContext.fillStyle =
        "rgba(255, 255, 255, " + particle.life * 0.7 + ")";
      pageContext.shadowBlur = 7 + particle.energy * 12;
      pageContext.shadowColor = "rgba(255, 255, 255, 0.55)";
      pageContext.fill();
    });

    pageContext.shadowBlur = 0;
  }

  function render() {
    updateVelocity();
    updateCursor();
    updateParticles();
    renderPageParticles();
    requestAnimationFrame(render);
  }

  document.addEventListener("pointermove", updatePointer);

  document.addEventListener("pointerleave", function () {
    customCursor.classList.remove("is-active");
  });

  document.addEventListener("pointerenter", function () {
    customCursor.classList.add("is-active");
  });

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  render();
})();
