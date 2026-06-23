import { useProductionTimer, formatTimerTime } from "@/hooks/useTimer";
import { Play, Pause, Square, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductionTimerProps {
  orderId?: string;
  equipmentId?: string;
  employeeId?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: (data: { elapsed: number; quantity: number; rejected: number }) => void;
  onReset?: () => void;
  className?: string;
}

export function ProductionTimer({
  orderId,
  equipmentId,
  employeeId,
  onStart,
  onPause,
  onStop,
  onReset,
  className,
}: ProductionTimerProps) {
  const timer = useProductionTimer();
  const [quantity, setQuantity] = useState(0);
  const [rejected, setRejected] = useState(0);

  const handleStart = () => {
    timer.start();
    onStart?.();
  };

  const handlePause = () => {
    timer.pause();
    onPause?.();
  };

  const handleResume = () => {
    timer.resume();
  };

  const handleStop = () => {
    timer.stop();
    onStop?.({
      elapsed: timer.elapsed,
      quantity,
      rejected,
    });
  };

  const handleReset = () => {
    timer.reset();
    setQuantity(0);
    setRejected(0);
    onReset?.();
  };

  const efficiency = quantity > 0 ? ((quantity / (quantity + rejected)) * 100).toFixed(1) : "0";

  return (
    <div className={cn("surface-elevated rounded-xl p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <Clock className="size-4" /> Timer de Produção
        </div>
        {timer.isRunning && (
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" />
            Em andamento
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold tracking-tight">
            {timer.formatTime()}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {timer.isRunning ? "Tempo decorrido" : "Timer parado"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!timer.isRunning && timer.elapsed === 0 ? (
          <Button onClick={handleStart} size="lg" className="gap-2">
            <Play className="size-5" /> Iniciar
          </Button>
        ) : !timer.isRunning ? (
          <>
            <Button onClick={handleResume} size="lg" variant="outline" className="gap-2">
              <Play className="size-5" /> Retomar
            </Button>
            <Button onClick={handleReset} size="lg" variant="ghost" className="gap-2">
              <RotateCcw className="size-5" /> Reiniciar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handlePause} size="lg" variant="outline" className="gap-2">
              <Pause className="size-5" /> Pausar
            </Button>
            <Button onClick={handleStop} size="lg" variant="destructive" className="gap-2">
              <Square className="size-5" /> Finalizar
            </Button>
          </>
        )}
      </div>

      {/* Production Data */}
      {timer.elapsed > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <Label className="text-xs">Quantidade Produzida</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={timer.isRunning}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Refugo</Label>
            <Input
              type="number"
              value={rejected}
              onChange={(e) => setRejected(parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={timer.isRunning}
            />
          </div>
        </div>
      )}

      {/* Efficiency */}
      {timer.elapsed > 0 && quantity > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className={cn("size-4", parseFloat(efficiency) >= 95 ? "text-green-500" : parseFloat(efficiency) >= 85 ? "text-yellow-500" : "text-red-500")} />
            <span className="text-muted-foreground">Eficiência:</span>
          </div>
          <div className={cn("text-2xl font-bold", parseFloat(efficiency) >= 95 ? "text-green-500" : parseFloat(efficiency) >= 85 ? "text-yellow-500" : "text-red-500")}>
            {efficiency}%
          </div>
        </div>
      )}

      {/* Info */}
      {(orderId || equipmentId || employeeId) && (
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            {orderId && <div>OP ID: {orderId}</div>}
            {equipmentId && <div>Equipamento: {equipmentId}</div>}
            {employeeId && <div>Operador: {employeeId}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
