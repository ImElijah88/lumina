import React, { useEffect, useRef } from 'react';

interface SpiritLoaderProps {
  message?: string;
  color?: string;
}

export const SpiritLoader: React.FC<SpiritLoaderProps> = ({ 
  message = "Discernment in progress...", 
  color = "#f2c46d" // Gold/Divine default
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let time = 0;

    // Resize canvas
    const resize = () => {
      canvas.width = 300;
      canvas.height = 300;
    };
    resize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      life: number;
      maxLife: number;
      angle: number;
      radius: number;
      color: string;

      constructor() {
        this.x = canvas!.width / 2;
        this.y = canvas!.height / 2;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 50 + 20;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = 0;
        this.speedY = 0;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
        this.color = color;
      }

      update() {
        this.life++;
        
        // Organic movement - swirling
        this.angle += 0.02 + Math.random() * 0.01;
        const noise = Math.sin(time * 0.05 + this.angle * 2) * 10;
        
        // Target position (orbiting center)
        const targetX = canvas!.width / 2 + Math.cos(this.angle) * (this.radius + noise);
        const targetY = canvas!.height / 2 + Math.sin(this.angle) * (this.radius + noise);

        // Ease towards target
        this.x += (targetX - this.x) * 0.05;
        this.y += (targetY - this.y) * 0.05;

        // Pulse radius
        this.radius += Math.sin(time * 0.1) * 0.5;
      }

      draw() {
        if (!ctx) return;
        const opacity = Math.max(0, 1 - this.life / this.maxLife) * 0.8;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw central core
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Core glow
      const pulse = Math.sin(time * 0.05) * 5 + 20;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, pulse + 20);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.4, `${color}80`); // Hex + alpha
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulse + 20, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.shadowBlur = 30;
      ctx.shadowColor = color;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8 + Math.sin(time * 0.1) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update and draw particles
      if (particles.length < 150) {
        particles.push(new Particle());
      }

      particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.life >= p.maxLife) {
          particles.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]"
          style={{ filter: 'blur(0.5px)' }}
        />
      </div>
      <p className="mt-4 text-lg font-serif italic text-gray-400 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
};
