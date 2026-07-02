import { useState, useEffect } from 'react';

const CountUp = ({ end, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const target = parseInt(end, 10);
    
    if (isNaN(target)) return;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      
      const progressNorm = Math.min(progress / duration, 1);
      // easeOutExpo gives a much smoother, premium decelerating feel
      const easeOutExpo = progressNorm === 1 ? 1 : 1 - Math.pow(2, -10 * progressNorm);
      
      const currentVal = Math.floor(easeOutExpo * target);
      setCount(currentVal);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target); // Ensure exact final value
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  // Format with dot separator (e.g. 1.000)
  return <span>{count.toLocaleString('id-ID')}</span>;
};

export default CountUp;
