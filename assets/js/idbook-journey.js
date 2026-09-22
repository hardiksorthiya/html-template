(function () {
  const section = document.querySelector("#idbook-journey");
  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const paper = section.querySelector("#journey-paper");
  const pencil = section.querySelector(".idbook-journey__pencil");
  const structure = section.querySelector("#journey-structure");
  const cad = section.querySelector("#journey-cad");
  const cadLabels = section.querySelector(".idbook-journey__cad-labels");
  const purchase = section.querySelector("#journey-purchase");
  const progressItems = section.querySelectorAll(".idbook-journey__progress-item");
  const stageInner = section.querySelector(".idbook-journey__stage-inner");

  function isHtmlNode(el) {
    return !!(el && el.namespaceURI === "http://www.w3.org/1999/xhtml");
  }

  function ensureScene(id, classNames, html) {
    var el = section.querySelector("#" + id);
    if (el && !isHtmlNode(el)) {
      el.parentNode.removeChild(el);
      el = null;
    }
    if (el) return el;
    if (!stageInner) return null;
    el = document.createElement("div");
    el.id = id;
    el.className = "idbook-journey__scene " + classNames;
    el.innerHTML = html;
    stageInner.appendChild(el);
    return el;
  }

  const threeD = ensureScene(
    "journey-three",
    "idbook-journey__three",
    '<img src="assets/images/3d.png?v=16" alt="IDBook 3D interior" width="1018" height="720">'
  );
  const reality = ensureScene(
    "journey-reality",
    "idbook-journey__reality",
    '<img src="assets/images/herobg2.webp?v=16" alt="IDBook interior design" width="1444" height="900"><div class="idbook-journey__scan" id="scanLine"></div>'
  );
  const scanLine = section.querySelector("#scanLine");

  const sketchLines = section.querySelectorAll(
    ".idbook-journey__sketch path, .idbook-journey__sketch line, .idbook-journey__sketch polyline, .idbook-journey__sketch rect, .idbook-journey__sketch ellipse, .idbook-journey__sketch circle"
  );
  const structureLines = section.querySelectorAll(
    ".idbook-journey__structure line, .idbook-journey__structure polyline, .idbook-journey__structure rect"
  );
  const cadLines = section.querySelectorAll(
    ".idbook-journey__cad-svg line, .idbook-journey__cad-svg rect, .idbook-journey__cad-svg path, .idbook-journey__cad-svg circle"
  );

  function prepLines(nodes) {
    nodes.forEach(function (shape) {
      var length = 1000;
      try {
        if (typeof shape.getTotalLength === "function") length = Math.max(shape.getTotalLength(), 1);
      } catch (err) {
        length = 1000;
      }
      shape.style.strokeDasharray = String(length);
      shape.style.strokeDashoffset = String(length);
    });
  }

  prepLines(sketchLines);
  prepLines(structureLines);
  prepLines(cadLines);

  function setStage(progress) {
    var active = 1;
    if (progress > 0.28) active = 2;
    if (progress > 0.46) active = 3;
    if (progress > 0.60) active = 4;
    if (progress > 0.75) active = 5;
    if (progress > 0.94) active = 6;

    progressItems.forEach(function (item, index) {
      item.classList.toggle("is-active", index + 1 === active);
    });
  }

  var mm = gsap.matchMedia();

  mm.add("(min-width: 992px)", function () {
    if (paper) gsap.set(paper, { autoAlpha: 0, scale: 0.8, rotation: -2 });
    if (pencil) gsap.set(pencil, { autoAlpha: 0, x: 0 });
    if (structure) gsap.set(structure, { autoAlpha: 0, scale: 0.86, y: 20 });
    if (cad) gsap.set(cad, { autoAlpha: 0, scale: 0.92 });
    if (cadLabels) gsap.set(cadLabels, { autoAlpha: 0 });
    if (threeD) gsap.set(threeD, { autoAlpha: 0, scale: 0.94, y: 16 });
    if (reality) gsap.set(reality, { autoAlpha: 0, scale: 0.94 });
    if (scanLine) gsap.set(scanLine, { autoAlpha: 0, x: 0 });
    if (purchase) gsap.set(purchase, { autoAlpha: 0, y: 40 });

    var tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=7200",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: function (self) {
          setStage(self.progress);
        }
      }
    });

    // 1. Paper sketch
    tl.to(paper, { autoAlpha: 1, scale: 1, rotation: -2, duration: 1.2, ease: "power3.out" });
    tl.to(pencil, { autoAlpha: 1, duration: 0.3 });
    tl.to(sketchLines, { strokeDashoffset: 0, duration: 3.2, stagger: 0.04, ease: "none" });
    tl.to(pencil, { autoAlpha: 0, x: 120, duration: 0.5 });
    tl.to(paper, { autoAlpha: 0, scale: 1.08, duration: 0.7, ease: "power2.in" });

    // 2. Structure
    tl.to(structure, { autoAlpha: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }, "+=0.08");
    tl.to(structureLines, { strokeDashoffset: 0, duration: 2.4, stagger: 0.025, ease: "none" });
    tl.to(structure, { autoAlpha: 0, scale: 0.94, duration: 0.7 });

    // 3. CAD
    tl.to(cad, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, "<");
    tl.to(cadLines, { strokeDashoffset: 0, duration: 2.4, stagger: 0.02, ease: "none" }, "<0.1");
    tl.to(cadLabels, { autoAlpha: 1, duration: 0.5 }, "<1");
    tl.to(cad, { autoAlpha: 0, scale: 1.04, duration: 0.7 });

    // 4. 3D image — held on screen
    if (threeD) {
      tl.to(threeD, { autoAlpha: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }, "<");
      tl.to(threeD, { scale: 1.04, duration: 2.2, ease: "none" });
      tl.to(threeD, { autoAlpha: 0, scale: 1.08, duration: 0.7 });
    }

    // 5. Reality image — held on screen
    if (reality) {
      tl.to(reality, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, "<");
      if (scanLine) {
        tl.to(scanLine, { autoAlpha: 1, duration: 0.3 });
        tl.to(scanLine, { x: 680, duration: 1.8, ease: "power2.inOut" });
        tl.to(scanLine, { autoAlpha: 0, duration: 0.3 });
      }
      tl.to(reality, { scale: 1.04, duration: 1.6, ease: "none" });
    }

    // 6. Purchase over reality
    tl.to(purchase, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, "-=0.8");

    var onMove = function (e) {
      if (!stageInner) return;
      var x = e.clientX / window.innerWidth - 0.5;
      var y = e.clientY / window.innerHeight - 0.5;
      gsap.to(stageInner, { x: x * 10, y: y * 6, duration: 1.2, ease: "power2.out" });
    };
    section.addEventListener("mousemove", onMove);

    return function () {
      section.removeEventListener("mousemove", onMove);
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  });

  mm.add("(max-width: 991px)", function () {
    gsap.set([paper, structure, cad, threeD, reality, purchase, pencil, cadLabels].filter(Boolean), {
      clearProps: "all"
    });
    gsap.set([sketchLines, structureLines, cadLines], { strokeDashoffset: 0 });
    setStage(1);
  });
})();
