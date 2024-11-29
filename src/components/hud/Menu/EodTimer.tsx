import { useCallback, useEffect, useRef, useState } from 'react';

const EODTimer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timerInterval = useRef<NodeJS.Timer>();

  const updateTimer = useCallback(() => {
    const date = new Date();
    const second = date.getUTCSeconds();
    const minute = date.getUTCMinutes();
    const hour = date.getUTCHours();

    const leftHour = 23 - hour;
    const leftMinute = 59 - minute;
    const leftSeconds = 59 - second;

    const leftTime = leftHour * 3600 + leftMinute * 60 + leftSeconds;

    const h = Math.floor(leftTime / 3600);
    const m = Math.floor((leftTime - h * 3600) / 60);
    const s = Math.floor(leftTime % 60);
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, []);

  useEffect(() => {
    if (!timerInterval.current) {
      updateTimer();
      timerInterval.current = setInterval(updateTimer, 1000);
    }
  }, [updateTimer]);

  return (
    <span>{`${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
  );
};

export default EODTimer;
