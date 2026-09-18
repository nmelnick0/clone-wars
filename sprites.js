(function () {
  'use strict';

  function drawBackground(ctx, width, height, time) {
    ctx.save();

    var pulse = 0.5 + 0.5 * Math.sin(time * 1.4);
    var water = ctx.createLinearGradient(0, 0, 0, height);
    water.addColorStop(0, '#010611');
    water.addColorStop(0.52, '#031426');
    water.addColorStop(1, '#01050b');
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, width, height);

    // Soft shafts of light make the deep water feel spacious without hiding the player.
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#39c7d8';
    for (var ray = -1; ray < 7; ray += 1) {
      var rayX = ray * 86 + ((time * 5) % 86) - 34;
      ctx.beginPath();
      ctx.moveTo(rayX, 0);
      ctx.lineTo(rayX + 38, 0);
      ctx.lineTo(rayX + 122, height * 0.76);
      ctx.lineTo(rayX + 54, height * 0.76);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Large distant silhouettes suggest an underwater cavern.
    ctx.fillStyle = '#020914';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.55);
    ctx.lineTo(width * 0.12, height * 0.44);
    ctx.lineTo(width * 0.23, height * 0.53);
    ctx.lineTo(width * 0.35, height * 0.39);
    ctx.lineTo(width * 0.49, height * 0.54);
    ctx.lineTo(width * 0.65, height * 0.43);
    ctx.lineTo(width * 0.79, height * 0.52);
    ctx.lineTo(width, height * 0.4);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Slow bubbles are deterministic, so the reduced-motion frame remains complete.
    ctx.strokeStyle = 'rgba(73, 205, 220, 0.2)';
    ctx.lineWidth = 2;
    for (var bubble = 0; bubble < 9; bubble += 1) {
      var bx = (bubble * 71 + 28) % width;
      var by = (height - ((bubble * 83 + time * (10 + bubble % 3 * 5)) % (height + 44))) + 18;
      var br = 3 + (bubble % 3);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.stroke();
    }

    // A small halo behind the player keeps the character legible in the dark water.
    var halo = ctx.createRadialGradient(width * 0.25, height * 0.46, 2, width * 0.25, height * 0.46, 96 + pulse * 8);
    halo.addColorStop(0, 'rgba(85, 238, 220, 0.06)');
    halo.addColorStop(1, 'rgba(85, 238, 220, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(width * 0.25 - 110, height * 0.46 - 110, 220, 220);

    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    var top = height - groundHeight;
    ctx.fillStyle = '#102c42';
    ctx.fillRect(0, top, width, groundHeight);

    ctx.fillStyle = '#1f6370';
    ctx.fillRect(0, top, width, 5);
    ctx.strokeStyle = '#03101d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, top + 1.5);
    ctx.lineTo(width, top + 1.5);
    ctx.stroke();

    // Repeating seabed stones slide with the world.
    var step = 44;
    var shift = ((offset % step) + step) % step;
    ctx.fillStyle = '#174657';
    for (var x = -step - shift; x < width + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, top + 13);
      ctx.lineTo(x + 16, top + 7);
      ctx.lineTo(x + 32, top + 14);
      ctx.lineTo(x + 39, height);
      ctx.lineTo(x - 3, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = '#061523';
    ctx.lineWidth = 2;
    for (var lineX = -step - shift; lineX < width + step; lineX += step) {
      ctx.beginPath();
      ctx.moveTo(lineX + 8, top + 22);
      ctx.lineTo(lineX + 27, top + 29);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    var tilt = Math.max(-0.28, Math.min(0.38, velocity / 900));
    var half = size * 0.5;
    var bodyW = size * 0.78;
    var bodyH = size * 0.54;
    var glowRadius = size * 0.55;
    ctx.translate(x, y);
    ctx.rotate(tilt);

    // A broad circular pool of light reveals only the nearby water.
    var pool = ctx.createRadialGradient(0, 0, size * 0.18, 0, 0, size * 4.2);
    pool.addColorStop(0, 'rgba(164, 255, 242, 0.62)');
    pool.addColorStop(0.34, 'rgba(89, 223, 215, 0.28)');
    pool.addColorStop(0.68, 'rgba(46, 173, 190, 0.08)');
    pool.addColorStop(1, 'rgba(46, 173, 190, 0)');
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.arc(0, 0, size * 4.2, 0, Math.PI * 2);
    ctx.fill();

    var glow = ctx.createRadialGradient(size * 0.12, -size * 0.36, 1, size * 0.12, -size * 0.36, glowRadius);
    glow.addColorStop(0, 'rgba(255, 247, 151, 0.7)');
    glow.addColorStop(1, 'rgba(255, 220, 75, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(size * 0.12, -size * 0.36, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin.
    ctx.fillStyle = '#1595a0';
    ctx.strokeStyle = '#02131f';
    ctx.lineWidth = Math.max(2, size * 0.075);
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.32, 0);
    ctx.lineTo(-half, -bodyH * 0.45);
    ctx.lineTo(-half * 0.86, bodyH * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rounded angler-fish body.
    ctx.fillStyle = '#36c9bd';
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW * 0.5, bodyH * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mouth and cheek markings.
    ctx.strokeStyle = '#073542';
    ctx.lineWidth = Math.max(2, size * 0.06);
    ctx.beginPath();
    ctx.arc(bodyW * 0.25, bodyH * 0.08, bodyW * 0.2, 0.1, 1.8);
    ctx.stroke();
    ctx.fillStyle = '#0c7583';
    ctx.beginPath();
    ctx.arc(-bodyW * 0.18, bodyH * 0.12, size * 0.055, 0, Math.PI * 2);
    ctx.fill();

    // Light-bulb antenna, fully inside the requested box.
    ctx.strokeStyle = '#06202b';
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.beginPath();
    ctx.moveTo(size * 0.03, -bodyH * 0.4);
    ctx.quadraticCurveTo(size * 0.04, -size * 0.4, size * 0.12, -size * 0.45);
    ctx.stroke();
    ctx.fillStyle = '#fff39a';
    ctx.beginPath();
    ctx.arc(size * 0.12, -size * 0.45, size * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(size * 0.12, -size * 0.45, size * 0.045, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    // The cave walls emerge from the darkness as they approach the angler fish.
    var reveal = x >= 220 ? 0.02 : Math.max(0.02, Math.min(1, (220 - x) / 85));
    ctx.globalAlpha = reveal;
    var outline = '#071322';
    var wall = '#283d5b';
    var wallLight = '#58779a';
    var wallDark = '#14263e';
    var tooth = Math.max(8, Math.min(16, pipeWidth * 0.2));

    // Base rectangles guarantee the cave walls fill the collision rectangles.
    ctx.fillStyle = wall;
    ctx.fillRect(x, 0, pipeWidth, gapTop);
    ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom);

    // Jagged cave mouths point away from the gap, never into it.
    ctx.fillStyle = wallLight;
    ctx.beginPath();
    ctx.moveTo(x, gapTop);
    ctx.lineTo(x + pipeWidth, gapTop);
    ctx.lineTo(x + pipeWidth - tooth, gapTop - tooth * 0.45);
    ctx.lineTo(x + pipeWidth - tooth * 1.8, gapTop);
    ctx.lineTo(x + pipeWidth - tooth * 2.7, gapTop - tooth * 0.7);
    ctx.lineTo(x + pipeWidth - tooth * 3.5, gapTop);
    ctx.lineTo(x, gapTop);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, gapBottom);
    ctx.lineTo(x + pipeWidth, gapBottom);
    ctx.lineTo(x + pipeWidth - tooth, gapBottom + tooth * 0.55);
    ctx.lineTo(x + pipeWidth - tooth * 1.8, gapBottom);
    ctx.lineTo(x + pipeWidth - tooth * 2.7, gapBottom + tooth * 0.7);
    ctx.lineTo(x + pipeWidth - tooth * 3.5, gapBottom);
    ctx.lineTo(x, gapBottom);
    ctx.closePath();
    ctx.fill();

    // Strong edges and a few simple mineral bands keep walls readable.
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(2, pipeWidth * 0.06);
    ctx.strokeRect(x, 0, pipeWidth, gapTop);
    ctx.strokeRect(x, gapBottom, pipeWidth, height - gapBottom);
    ctx.strokeStyle = wallDark;
    ctx.lineWidth = Math.max(2, pipeWidth * 0.045);
    for (var bandY = 30; bandY < gapTop - 8; bandY += 38) {
      ctx.beginPath();
      ctx.moveTo(x + 5, bandY);
      ctx.lineTo(x + pipeWidth - 5, bandY + 7);
      ctx.stroke();
    }
    for (var lowerY = gapBottom + 28; lowerY < height - 8; lowerY += 38) {
      ctx.beginPath();
      ctx.moveTo(x + 5, lowerY);
      ctx.lineTo(x + pipeWidth - 5, lowerY - 7);
      ctx.stroke();
    }
    ctx.restore();
  }

  window.SPRITES = { drawBackground: drawBackground, drawGround: drawGround, drawBird: drawBird, drawPipe: drawPipe };
}());
