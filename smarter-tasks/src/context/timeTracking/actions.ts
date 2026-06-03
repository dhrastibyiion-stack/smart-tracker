import type { Action, TimeLog } from "./reducer";
type Dispatch = (action: Action) => void;

export const refreshTimeLogs = async (opts: {
  dispatch: Dispatch;
}) => {
  const { dispatch } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const timeLogsStored = localStorage.getItem("timeLogs");
    const timeLogs: TimeLog[] = timeLogsStored ? JSON.parse(timeLogsStored) : [];

    dispatch({ type: "API_CALL_END", payload: timeLogs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
  }
};

export const addTimeLogRequest = async (opts: {
  data: {
    taskId: number;
    userId: number;
    userName: string;
    hours: number;
    date: string;
    description: string;
  };
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { data, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const timeLogsStored = localStorage.getItem("timeLogs");
    const timeLogs: TimeLog[] = timeLogsStored ? JSON.parse(timeLogsStored) : [];

    const newTimeLog: TimeLog = {
      id: Date.now(),
      taskId: data.taskId,
      userId: data.userId,
      userName: data.userName,
      hours: data.hours,
      date: data.date,
      description: data.description,
    };

    const updatedTimeLogs = [...timeLogs, newTimeLog];
    localStorage.setItem("timeLogs", JSON.stringify(updatedTimeLogs));

    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};

export const deleteTimeLogRequest = async (opts: {
  id: number;
  dispatch: Dispatch;
  refresh: () => Promise<void>;
}) => {
  const { id, dispatch, refresh } = opts;

  dispatch({ type: "API_CALL_START" });
  try {
    const timeLogsStored = localStorage.getItem("timeLogs");
    let timeLogs: TimeLog[] = timeLogsStored ? JSON.parse(timeLogsStored) : [];

    timeLogs = timeLogs.filter((t) => t.id !== id);
    localStorage.setItem("timeLogs", JSON.stringify(timeLogs));

    dispatch({ type: "REMOVE_TIMELOG_SUCCESS", payload: id });
    await refresh();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    dispatch({ type: "API_CALL_ERROR", payload: message });
    throw err;
  }
};