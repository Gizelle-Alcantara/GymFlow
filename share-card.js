/**
 * share-card.js
 * Renders a visually appealing workout completion card onto an HTML5 <canvas>
 * for social media sharing or downloading.
 */

function generateShareCard(canvas, summary) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set dimensions (standard mobile card proportions: 400x500)
  const width = canvas.width;
  const height = canvas.height;
  
  // 1. Draw Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#161233');
  bgGrad.addColorStop(1, '#2e114d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);
  
  // 2. Draw Decorative Glows (circles with gradients)
  ctx.save();
  // Purple glow top-right
  let glowGrad1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, 150);
  glowGrad1.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
  glowGrad1.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = glowGrad1;
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.2, 150, 0, Math.PI * 2);
  ctx.fill();

  // Pink glow bottom-left
  let glowGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 10, width * 0.2, height * 0.8, 180);
  glowGrad2.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
  glowGrad2.addColorStop(1, 'rgba(236, 72, 153, 0)');
  ctx.fillStyle = glowGrad2;
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.8, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Draw Outer Card border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // 4. Draw Header Logo
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 20px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Gym', 35, 45);
  
  // "Flow" in pink/purple
  ctx.fillStyle = '#ec4899';
  ctx.fillText('Flow', 75, 45);

  // Draw small dumbbell icon in logo
  ctx.save();
  ctx.fillStyle = '#8b5cf6';
  ctx.translate(130, 38);
  ctx.rotate(-Math.PI / 8);
  // Bar
  ctx.fillRect(-12, -2, 24, 4);
  // Plates left
  ctx.fillRect(-16, -6, 4, 12);
  ctx.fillRect(-20, -4, 3, 8);
  // Plates right
  ctx.fillRect(12, -6, 4, 12);
  ctx.fillRect(17, -4, 3, 8);
  ctx.restore();

  // Draw Date on Right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '500 12px Outfit, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(summary.dateString || new Date().toLocaleDateString('pt-BR'), width - 35, 42);

  // 5. Draw Glassmorphism Inner Card container
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  // Draw rounded rect
  const rX = 25;
  const rY = 70;
  const rW = width - 50;
  const rH = height - 120;
  const rRad = 20;
  ctx.beginPath();
  ctx.moveTo(rX + rRad, rY);
  ctx.lineTo(rX + rW - rRad, rY);
  ctx.quadraticCurveTo(rX + rW, rY, rX + rW, rY + rRad);
  ctx.lineTo(rX + rW, rY + rH - rRad);
  ctx.quadraticCurveTo(rX + rW, rY + rH, rX + rW - rRad, rY + rH);
  ctx.lineTo(rX + rRad, rY + rH);
  ctx.quadraticCurveTo(rX, rY + rH, rX, rY + rH - rRad);
  ctx.lineTo(rX, rY + rRad);
  ctx.quadraticCurveTo(rX, rY, rX + rRad, rY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 6. Athlete Congrats & Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '800 24px Outfit, sans-serif';
  ctx.fillText('TREINO CONCLUÍDO!', width / 2, 115);

  ctx.fillStyle = '#ec4899';
  ctx.font = '600 14px Outfit, sans-serif';
  ctx.fillText(`ATLETA: ${summary.athleteName.toUpperCase()}`, width / 2, 142);

  // Workout Name Banner
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px Outfit, sans-serif';
  // Shorten name if too long
  let wName = summary.workoutName || 'Treino Personalizado';
  if (wName.length > 25) wName = wName.substring(0, 22) + '...';
  ctx.fillText(wName, width / 2, 185);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, 210);
  ctx.lineTo(width - 45, 210);
  ctx.stroke();

  // 7. Grid of Stats (4 elements: Duration, Exercises, Vol, Calories)
  const gridY = 240;
  const colWidth = (width - 70) / 2;
  const rowHeight = 75;

  // Set metrics data array
  const metrics = [
    {
      label: 'TEMPO TOTAL',
      val: summary.duration || '00:00',
      color: '#ffffff',
      iconDraw: (x, y) => {
        // Draw clock icon
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 4, y);
        ctx.stroke();
      }
    },
    {
      label: 'EXERCÍCIOS',
      val: `${summary.exercisesCount || 0} concluídos`,
      color: '#ffffff',
      iconDraw: (x, y) => {
        // Draw list/check icon
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 2);
        ctx.lineTo(x - 2, y + 2);
        ctx.lineTo(x + 6, y - 5);
        ctx.stroke();
      }
    },
    {
      label: 'CARGA TOTAL',
      val: summary.totalWeight || '0 kg',
      color: '#10b981',
      iconDraw: (x, y) => {
        // Draw weight scale icon
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 6);
        ctx.lineTo(x + 8, y + 6);
        ctx.lineTo(x + 6, y - 4);
        ctx.lineTo(x - 6, y - 4);
        ctx.closePath();
        ctx.fill();
        // Ring top
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 4, 3, Math.PI, 0);
        ctx.stroke();
      }
    },
    {
      label: 'CALORIAS',
      val: summary.calories || '0 kcal',
      color: '#f97316',
      iconDraw: (x, y) => {
        // Draw fire flame icon
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        // Simple flame representation shape
        ctx.moveTo(x, y + 8);
        ctx.bezierCurveTo(x - 6, y + 8, x - 8, y + 3, x - 5, y - 3);
        ctx.bezierCurveTo(x - 7, y - 1, x - 4, y - 8, x, y - 8);
        ctx.bezierCurveTo(x + 2, y - 5, x + 6, y - 4, x + 6, y + 2);
        ctx.bezierCurveTo(x + 6, y + 6, x + 4, y + 8, x, y + 8);
        ctx.closePath();
        ctx.fill();
      }
    }
  ];

  // Draw 2x2 Grid
  metrics.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cellX = 35 + col * colWidth;
    const cellY = gridY + row * rowHeight;

    // Draw background highlight box for cell
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(cellX, cellY, colWidth - 10, rowHeight - 15, 10) : ctx.rect(cellX, cellY, colWidth - 10, rowHeight - 15);
    ctx.fill();

    // Draw Icon
    m.iconDraw(cellX + 22, cellY + 28);

    // Draw Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '700 9px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(m.label, cellX + 42, cellY + 22);

    // Draw Value
    ctx.fillStyle = m.color;
    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillText(m.val, cellX + 42, cellY + 39);
  });

  // Divider Line 2
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(45, gridY + rowHeight * 2 - 5);
  ctx.lineTo(width - 45, gridY + rowHeight * 2 - 5);
  ctx.stroke();

  // 8. Optional post-workout photo
  if (summary.photoData) {
    const img = new Image();
    img.onload = () => {
      const photoX = 45;
      const photoY = height - 220;
      const photoW = width - 90;
      const photoH = 100;

      // Subtle border and shadow for the photo
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(photoX - 5, photoY - 5, photoW + 10, photoH + 10);
      ctx.restore();

      ctx.drawImage(img, photoX, photoY, photoW, photoH);
      drawMotivationalQuote();
      drawFooter();
    };
    img.src = summary.photoData;
  } else {
    drawMotivationalQuote();
    drawFooter();
  }

  function drawMotivationalQuote() {
    const quotes = [
      '"O único treino ruim é aquele que você não fez."',
      '"Consistência vence o talento todos os dias."',
      '"A disciplina te leva aonde a motivação não consegue."',
      '"Foco, força e progresso constante."',
      '"Seu corpo pode aguentar quase tudo. Convença sua mente."'
    ];
    const quoteIndex = Math.abs(wName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % quotes.length;
    const quote = quotes[quoteIndex];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'italic 500 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(quote, width / 2, height - 15);
  }

  function drawFooter() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '500 10px Outfit, sans-serif';
    ctx.fillText('GERADO PELO APP GYMFLOW', width / 2, height - 35);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { generateShareCard };
}
