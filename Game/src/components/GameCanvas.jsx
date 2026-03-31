import React, { useEffect, useRef, useState } from 'react';
import { drawBackground, drawPlayerCharacter, drawTextFit } from '../utils/draw';
import { ENTITIES, CHOICES, STEP_POSITIONS, COLORS } from '../constants/gameData';
import '../styles/GameCanvas.css';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState({
    currentStep: 0,
    showChoices: false,
    money: 0,
    growth: 0,
    reputation: 50,
    playerPos: [STEP_POSITIONS[0][0], STEP_POSITIONS[0][1] - 25 - 29 + 20],
    targetPos: [STEP_POSITIONS[0][0], STEP_POSITIONS[0][1] - 25 - 29 + 20],
    jumping: false,
    jumpProgress: 0,
    hoveredStep: -1,
    hoveredOption: -1,
    mousePos: [0, 0],
  });

  const WIDTH = 950;
  const HEIGHT = 700;
  const STEP_WIDTH = 110;
  const STEP_HEIGHT = 50;
  const STEP_Y_OFFSET = 20;
  const CHARACTER_FEET_OFFSET = 29;

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setGameState(prev => ({ ...prev, mousePos: [x, y] }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle click
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    setGameState(prev => {
      // Click on current step
      if (!prev.showChoices && prev.currentStep < STEP_POSITIONS.length) {
        const stepRect = {
          x: STEP_POSITIONS[prev.currentStep][0] - STEP_WIDTH / 2,
          y: STEP_POSITIONS[prev.currentStep][1] - STEP_HEIGHT / 2 + STEP_Y_OFFSET,
          width: STEP_WIDTH,
          height: STEP_HEIGHT,
        };

        if (
          clickX >= stepRect.x &&
          clickX <= stepRect.x + stepRect.width &&
          clickY >= stepRect.y &&
          clickY <= stepRect.y + stepRect.height
        ) {
          return { ...prev, showChoices: true };
        }
      }

      // Click on option
      if (prev.showChoices) {
        const currentEntity = ENTITIES[prev.currentStep];
        const optionList = CHOICES[currentEntity];
        const panelY = 580;
        const spacing = (WIDTH - 40) / optionList.length;
        const optionWidth = spacing - 20;
        const optionHeight = 50;
        const optionY = panelY + 45;

        for (let i = 0; i < optionList.length; i++) {
          const option = optionList[i];
          const optionX = 30 + i * spacing + (spacing - optionWidth) / 2;
          const optionRect = {
            x: optionX,
            y: optionY,
            width: optionWidth,
            height: optionHeight,
          };

          if (
            clickX >= optionRect.x &&
            clickX <= optionRect.x + optionRect.width &&
            clickY >= optionRect.y &&
            clickY <= optionRect.y + optionRect.height
          ) {
            // Apply logic and move to next step
            let newMoney = prev.money;
            let newGrowth = prev.growth;
            let newReputation = prev.reputation;

            if (option === 'Skilled') {
              newMoney -= 30;
              newGrowth += 20;
            } else if (option === 'Unskilled') {
              newMoney -= 10;
              newGrowth += 5;
            } else if (option === 'High Spending') {
              newMoney -= 40;
              newGrowth += 25;
            } else if (option === 'Balanced') {
              newMoney -= 20;
              newGrowth += 15;
            } else if (option === 'Low Spending') {
              newGrowth += 5;
            } else if (option === 'High Quality') {
              newMoney -= 30;
              newReputation += 20;
            } else if (option === 'Medium Quality') {
              newMoney -= 15;
              newReputation += 10;
            } else if (option === 'Low Quality') {
              newReputation -= 10;
            } else if (option === 'Celebrity') {
              newMoney -= 40;
              newGrowth += 30;
            } else if (option === 'Social Media') {
              newMoney -= 20;
              newGrowth += 15;
            } else if (option === 'Influencer') {
              newMoney -= 15;
              newGrowth += 12;
            } else if (option === 'No Marketing') {
              newGrowth -= 5;
            } else if (option === 'Competitive Pricing') {
              newGrowth += 20;
            } else if (option === 'Premium Branding') {
              newReputation += 20;
            } else if (option === 'Train Team') {
              newMoney -= 15;
              newGrowth += 10;
            } else if (option === 'Hire More') {
              newMoney -= 25;
              newGrowth += 15;
            } else if (option === 'Expand') {
              newMoney -= 30;
              newGrowth += 30;
            } else if (option === 'Stay Local') {
              newGrowth += 10;
            }

            const nextStep = prev.currentStep + 1;
            const newState = {
              ...prev,
              money: newMoney,
              growth: newGrowth,
              reputation: newReputation,
              currentStep: nextStep,
              showChoices: false,
              jumping: nextStep < STEP_POSITIONS.length,
              jumpProgress: 0,
            };

            if (nextStep < STEP_POSITIONS.length) {
              newState.targetPos = [
                STEP_POSITIONS[nextStep][0],
                STEP_POSITIONS[nextStep][1] - STEP_HEIGHT / 2 - CHARACTER_FEET_OFFSET + STEP_Y_OFFSET,
              ];
            }

            return newState;
          }
        }
      }

      return prev;
    });
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Animation loop
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };

        if (prev.jumping) {
          newState.jumpProgress = prev.jumpProgress + 0.08;

          if (newState.jumpProgress >= 1) {
            newState.jumping = false;
            newState.playerPos = [...prev.targetPos];
            newState.jumpProgress = 1;
          } else {
            const ease =
              newState.jumpProgress *
              newState.jumpProgress *
              (3 - 2 * newState.jumpProgress);
            const x =
              prev.playerPos[0] +
              (prev.targetPos[0] - prev.playerPos[0]) * ease;
            const y =
              prev.playerPos[1] +
              (prev.targetPos[1] - prev.playerPos[1]) * ease -
              120 * (4 * newState.jumpProgress * (1 - newState.jumpProgress));
            newState.playerPos = [x, y];
          }
        }

        // Update hovered step
        newState.hoveredStep = -1;
        for (let i = 0; i < ENTITIES.length; i++) {
          const stepRect = {
            x: STEP_POSITIONS[i][0] - STEP_WIDTH / 2,
            y: STEP_POSITIONS[i][1] - STEP_HEIGHT / 2 + STEP_Y_OFFSET,
            width: STEP_WIDTH,
            height: STEP_HEIGHT,
          };
          if (
            prev.mousePos[0] >= stepRect.x &&
            prev.mousePos[0] <= stepRect.x + stepRect.width &&
            prev.mousePos[1] >= stepRect.y &&
            prev.mousePos[1] <= stepRect.y + stepRect.height
          ) {
            newState.hoveredStep = i;
            break;
          }
        }

        // Update hovered option
        newState.hoveredOption = -1;
        if (prev.showChoices && prev.currentStep < ENTITIES.length) {
          const optionList = CHOICES[ENTITIES[prev.currentStep]];
          const panelY = 580;
          const spacing = (WIDTH - 40) / optionList.length;
          const optionWidth = spacing - 20;
          const optionHeight = 50;
          const optionY = panelY + 45;

          for (let i = 0; i < optionList.length; i++) {
            const optionX = 30 + i * spacing + (spacing - optionWidth) / 2;
            const optionRect = {
              x: optionX,
              y: optionY,
              width: optionWidth,
              height: optionHeight,
            };
            if (
              prev.mousePos[0] >= optionRect.x &&
              prev.mousePos[0] <= optionRect.x + optionRect.width &&
              prev.mousePos[1] >= optionRect.y &&
              prev.mousePos[1] <= optionRect.y + optionRect.height
            ) {
              newState.hoveredOption = i;
              break;
            }
          }
        }

        return newState;
      });
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(animationFrame);
  }, []);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear and draw background
    drawBackground(ctx, WIDTH, HEIGHT);

    // Draw steps
    for (let i = 0; i < ENTITIES.length; i++) {
      const stepRect = {
        x: STEP_POSITIONS[i][0] - STEP_WIDTH / 2,
        y: STEP_POSITIONS[i][1] - STEP_HEIGHT / 2 + STEP_Y_OFFSET,
        width: STEP_WIDTH,
        height: STEP_HEIGHT,
      };

      // Determine color
      let color;
      if (i === gameState.currentStep) {
        color = 'rgb(80, 160, 255)';
      } else if (i < gameState.currentStep) {
        color = 'rgb(76, 175, 80)';
      } else {
        color = 'rgb(220, 230, 245)';
      }

      // Draw shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(stepRect.x, stepRect.y + 2, stepRect.width, stepRect.height);

      // Draw main box
      ctx.fillStyle = color;
      ctx.fillRect(stepRect.x, stepRect.y, stepRect.width, stepRect.height);

      // Draw border
      ctx.strokeStyle = i === gameState.currentStep ? 'rgb(40, 100, 180)' : 'rgb(100, 100, 120)';
      ctx.lineWidth = i === gameState.currentStep ? 3 : 2;
      ctx.strokeRect(stepRect.x, stepRect.y, stepRect.width, stepRect.height);

      // Draw step number
      ctx.fillStyle = i === gameState.currentStep ? 'rgb(255, 255, 255)' : 'rgb(20, 40, 80)';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        String(i + 1),
        stepRect.x + stepRect.width / 2,
        stepRect.y + stepRect.height / 2
      );
    }

    // Draw player
    drawPlayerCharacter(ctx, gameState.playerPos[0], gameState.playerPos[1], gameState.jumpProgress < 1 ? 1.0 + 0.4 * (4 * gameState.jumpProgress * (1 - gameState.jumpProgress)) : 1.0);

    // Draw options panel
    if (gameState.showChoices && gameState.currentStep < ENTITIES.length) {
      const currentEntity = ENTITIES[gameState.currentStep];
      const optionList = CHOICES[currentEntity];
      const panelY = 580;
      const panelHeight = 100;

      // Panel background
      ctx.fillStyle = 'rgb(200, 240, 200)';
      ctx.fillRect(20, panelY, WIDTH - 40, panelHeight);
      ctx.strokeStyle = 'rgb(76, 175, 80)';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, panelY, WIDTH - 40, panelHeight);

      // Title
      ctx.fillStyle = 'rgb(20, 40, 80)';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`Choose for ${currentEntity}:`, 40, panelY + 10);

      // Options
      const spacing = (WIDTH - 40) / optionList.length;
      const optionWidth = spacing - 20;
      const optionHeight = 50;
      const optionY = panelY + 45;

      for (let i = 0; i < optionList.length; i++) {
        const option = optionList[i];
        const optionX = 30 + i * spacing + (spacing - optionWidth) / 2;

        const isHovered = gameState.hoveredOption === i;
        const optColor = isHovered ? 'rgb(80, 200, 255)' : 'rgb(150, 230, 150)';
        const borderColor = isHovered ? 'rgb(40, 150, 255)' : 'rgb(76, 175, 80)';

        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(optionX, optionY + 2, optionWidth, optionHeight);

        // Draw option box
        ctx.fillStyle = optColor;
        ctx.fillRect(optionX, optionY, optionWidth, optionHeight);

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeRect(optionX, optionY, optionWidth, optionHeight);

        // Draw text
        ctx.fillStyle = isHovered ? 'rgb(255, 255, 255)' : 'rgb(20, 40, 80)';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(option, optionX + optionWidth / 2, optionY + optionHeight / 2);
      }
    }

    // Draw stats panel
    const statsPanelX = WIDTH - 280;
    const statsPanelY = 10;
    const statsPanelW = 270;
    const statsPanelH = 110;

    ctx.fillStyle = 'rgb(255, 255, 200)';
    ctx.fillRect(statsPanelX, statsPanelY, statsPanelW, statsPanelH);
    ctx.strokeStyle = 'rgb(200, 180, 50)';
    ctx.lineWidth = 3;
    ctx.strokeRect(statsPanelX, statsPanelY, statsPanelW, statsPanelH);

    ctx.fillStyle = 'rgb(200, 120, 0)';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('STATS', statsPanelX + 20, statsPanelY + 20);

    // Money
    ctx.fillStyle = gameState.money > 50 ? 'rgb(76, 175, 80)' : 'rgb(200, 100, 100)';
    ctx.font = '18px Arial';
    ctx.fillText(`Money: $${gameState.money}`, statsPanelX + 20, statsPanelY + 50);

    // Growth
    ctx.fillStyle = 'rgb(100, 150, 255)';
    ctx.fillText(`Growth: +${gameState.growth}`, statsPanelX + 20, statsPanelY + 70);

    // Reputation
    ctx.fillStyle = 'rgb(255, 180, 0)';
    ctx.fillText(`Reputation: ${gameState.reputation}`, statsPanelX + 20, statsPanelY + 90);

    // End screen
    if (gameState.currentStep >= ENTITIES.length) {
      // Overlay
      ctx.fillStyle = 'rgba(20, 40, 80, 0.7)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Title
      ctx.fillStyle = 'rgb(255, 220, 100)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎉 Simulation Complete! 🎉', WIDTH / 2, HEIGHT / 2 - 80);

      // Stats
      ctx.fillStyle = 'rgb(255, 255, 200)';
      ctx.font = '22px Arial';
      const finalText = `💰 Money: $${gameState.money}  |  📈 Growth: ${gameState.growth}  |  ⭐ Reputation: ${gameState.reputation}`;
      ctx.fillText(finalText, WIDTH / 2, HEIGHT / 2 + 20);

      // Restart message
      ctx.fillStyle = 'rgb(200, 220, 255)';
      ctx.font = '18px Arial';
      ctx.fillText('Refresh the page to replay', WIDTH / 2, HEIGHT / 2 + 100);
    }
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="game-canvas"
    />
  );
};

export default GameCanvas;
