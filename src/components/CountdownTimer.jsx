import { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: mid-December (December 15, 2024)
    const targetDate = new Date('2024-12-15T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 justify-center items-center mt-8">
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 border border-white/20">
          <div className="text-3xl md:text-5xl font-bold text-white">{timeLeft.days}</div>
          <div className="text-sm md:text-base text-white/90 mt-1">Days</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 border border-white/20">
          <div className="text-3xl md:text-5xl font-bold text-white">{timeLeft.hours}</div>
          <div className="text-sm md:text-base text-white/90 mt-1">Hours</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 border border-white/20">
          <div className="text-3xl md:text-5xl font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-sm md:text-base text-white/90 mt-1">Minutes</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 md:px-6 md:py-4 border border-white/20">
          <div className="text-3xl md:text-5xl font-bold text-white">{timeLeft.seconds}</div>
          <div className="text-sm md:text-base text-white/90 mt-1">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

