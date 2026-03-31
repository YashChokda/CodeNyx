const drawBackground = (ctx, width, height) => {
  // Sky
  ctx.fillStyle = 'rgb(100, 200, 255)';
  ctx.fillRect(0, 0, width, height);

  // Clouds
  const cloudPositions = [
    [80, 40],
    [350, 60],
    [650, 30],
    [850, 80],
  ];

  cloudPositions.forEach(([cx, cy]) => {
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 30, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 55, cy, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 15, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 12, 16, 0, Math.PI * 2);
    ctx.fill();
  });

  // Grass layer
  ctx.strokeStyle = 'rgb(76, 175, 80)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.lineTo(width, 520);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 523);
  ctx.lineTo(width, 523);
  ctx.stroke();

  // Grass pattern
  ctx.strokeStyle = 'rgb(56, 142, 60)';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 516);
    ctx.lineTo(x + 15, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 20, 516);
    ctx.lineTo(x + 35, 512);
    ctx.stroke();
  }

  // Dirt layers
  const dirtStart = 520 + 15;
  const dirtLayerHeight = (height - dirtStart) / 3;
  const colors = ['rgb(139, 69, 19)', 'rgb(120, 60, 15)', 'rgb(100, 50, 10)'];

  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, dirtStart + i * dirtLayerHeight, width, dirtLayerHeight);
  });
};

const drawPlayerCharacter = (ctx, x, y, scale = 1.0) => {
  x = Math.round(x);
  y = Math.round(y);

  // Head
  const headRadius = Math.round(18 * scale);
  ctx.fillStyle = 'rgb(220, 20, 60)';
  ctx.beginPath();
  ctx.arc(x, y - headRadius, headRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgb(180, 10, 50)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - headRadius, headRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes
  const eyeOffset = Math.round(7 * scale);
  const eyeRadius = Math.round(3 * scale);

  ctx.fillStyle = 'rgb(255, 255, 255)';
  ctx.beginPath();
  ctx.arc(x - eyeOffset, y - headRadius - 2, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + eyeOffset, y - headRadius - 2, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.beginPath();
  ctx.arc(x - eyeOffset, y - headRadius - 2, Math.round(2 * scale), 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + eyeOffset, y - headRadius - 2, Math.round(2 * scale), 0, Math.PI * 2);
  ctx.fill();

  // Body
  const bodyWidth = Math.round(14 * scale);
  const bodyHeight = Math.round(20 * scale);

  ctx.fillStyle = 'rgb(30, 100, 200)';
  ctx.fillRect(x - bodyWidth / 2, y, bodyWidth, bodyHeight);

  ctx.strokeStyle = 'rgb(20, 80, 180)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - bodyWidth / 2, y, bodyWidth, bodyHeight);

  // Legs
  const legWidth = Math.round(5 * scale);
  const legHeight = Math.round(9 * scale);

  ctx.fillStyle = 'rgb(200, 100, 50)';
  ctx.fillRect(x - 7 * scale, y + bodyHeight, legWidth, legHeight);
  ctx.fillRect(x + 2 * scale, y + bodyHeight, legWidth, legHeight);
};

export { drawBackground, drawPlayerCharacter, drawTextFit };
