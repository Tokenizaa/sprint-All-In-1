import { useState, useEffect, useRef, useCallback } from "react";

export interface TimerState {
  isRunning: boolean;
  elapsed: number; // em segundos
  startTime: number | null;
  lastTick: number | null;
}

export interface UseTimerOptions {
  onTick?: (elapsed: number) => void;
  onTickInterval?: number; // em milissegundos
  autoStart?: boolean;
}

export function useTimer(options: UseTimerOptions = {}) {
  const {
    onTick,
    onTickInterval = 1000,
    autoStart = false,
  } = options;

  const [state, setState] = useState<TimerState>({
    isRunning: autoStart,
    elapsed: 0,
    startTime: autoStart ? Date.now() : null,
    lastTick: autoStart ? Date.now() : null,
  });

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || !prev.startTime || !prev.lastTick) return prev;

      const now = Date.now();
      const delta = now - prev.lastTick;
      const newElapsed = prev.elapsed + delta / 1000;

      if (onTick) {
        onTick(newElapsed);
      }

      return {
        ...prev,
        elapsed: newElapsed,
        lastTick: now,
      };
    });
  }, [onTick]);

  const start = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning) return prev;

      const now = Date.now();
      return {
        ...prev,
        isRunning: true,
        startTime: now,
        lastTick: now,
      };
    });
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      startTime: null,
      lastTick: null,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      startTime: null,
      lastTick: null,
    }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.isRunning) return prev;

      const now = Date.now();
      return {
        ...prev,
        isRunning: true,
        startTime: now,
        lastTick: now,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      elapsed: 0,
      startTime: null,
      lastTick: null,
    });
  }, []);

  const setElapsed = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      elapsed: seconds,
      startTime: prev.isRunning ? Date.now() - seconds * 1000 : null,
      lastTick: prev.isRunning ? Date.now() : null,
    }));
  }, []);

  // Efeito para gerenciar o intervalo
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(tick, onTickInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, tick, onTickInterval]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !state.isRunning) {
      start();
    }
  }, [autoStart, start]);

  return {
    ...state,
    start,
    stop,
    pause,
    resume,
    reset,
    setElapsed,
    formatTime: (seconds: number = state.elapsed) => formatTimerTime(seconds),
  };
}

export function formatTimerTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useProductionTimer(options: UseTimerOptions = {}) {
  const timer = useTimer({
    ...options,
    onTickInterval: 1000, // atualiza a cada segundo
  });

  const recordProduction = useCallback(async (quantity: number, rejected: number = 0) => {
    // Esta função será implementada para registrar produção
    // Por enquanto, apenas retorna o tempo atual
    return {
      elapsed: timer.elapsed,
      quantity,
      rejected,
      efficiency: quantity > 0 ? (quantity / (quantity + rejected)) * 100 : 0,
    };
  }, [timer.elapsed]);

  return {
    ...timer,
    recordProduction,
  };
}
