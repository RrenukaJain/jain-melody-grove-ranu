
import { formatTime } from "../utils/formatTime";

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  size?: "sm" | "lg";
}

export const TimeDisplay = ({ currentTime, duration, size = "sm" }: TimeDisplayProps) => {
  return (
    <>
      <span className={`${size === "lg" ? "text-sm" : "text-[10px] md:text-xs"} text-gray-400 ${size === "lg" ? "w-12" : "w-8 md:w-12"} text-right`}>
        {formatTime(currentTime)}
      </span>
      <span className={`${size === "lg" ? "text-sm" : "text-[10px] md:text-xs"} text-gray-400 ${size === "lg" ? "w-12" : "w-8 md:w-12"}`}>
        {formatTime(duration)}
      </span>
    </>
  );
};
