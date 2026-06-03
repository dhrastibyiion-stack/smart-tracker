import { useContext } from "react";
import { TimeTrackingContext } from "./TimeTrackingContext";

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error("useTimeTracking must be used within a TimeTrackingProvider");
  }
  return context;
};