import { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle, CheckCircle2, PauseCircle, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GanttItem {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color?: string;
}

interface GanttChartProps {
  items: GanttItem[];
  startDate?: Date;
  endDate?: Date;
  onItemClick?: (item: GanttItem) => void;
  className?: string;
}

export function GanttChart({ items, startDate, endDate, onItemClick, className }: GanttChartProps) {
  const [viewStartDate, setViewStartDate] = useState(startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [viewEndDate, setViewEndDate] = useState(endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calcular dias no período
  const daysInView = Math.ceil((viewEndDate.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = Math.max(40, 800 / daysInView);

  // Gerar dias
  const days = [];
  for (let i = 0; i < daysInView; i++) {
    const day = new Date(viewStartDate);
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  // Calcular posição e largura de cada item
  const getItemPosition = (item: GanttItem) => {
    const totalDuration = viewEndDate.getTime() - viewStartDate.getTime();
    const itemStart = Math.max(item.start.getTime(), viewStartDate.getTime());
    const itemEnd = Math.min(item.end.getTime(), viewEndDate.getTime());
    
    const left = ((itemStart - viewStartDate.getTime()) / totalDuration) * 100;
    const width = ((itemEnd - itemStart) / totalDuration) * 100;
    
    return { left: Math.max(0, left), width: Math.max(0, width) };
  };

  const getStatusColor = (status: GanttItem['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: GanttItem['status']) => {
    switch (status) {
      case 'pending': return <Clock className="size-4" />;
      case 'in_progress': return <PauseCircle className="size-4" />;
      case 'completed': return <CheckCircle2 className="size-4" />;
      case 'delayed': return <AlertTriangle className="size-4" />;
      default: return <Clock className="size-4" />;
    }
  };

  const getPriorityColor = (priority: GanttItem['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const navigatePrev = () => {
    const days = (viewEndDate.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24);
    setViewStartDate(new Date(viewStartDate.getTime() - days * 24 * 60 * 60 * 1000));
    setViewEndDate(new Date(viewEndDate.getTime() - days * 24 * 60 * 60 * 1000));
  };

  const navigateNext = () => {
    const days = (viewEndDate.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24);
    setViewStartDate(new Date(viewStartDate.getTime() + days * 24 * 60 * 60 * 1000));
    setViewEndDate(new Date(viewEndDate.getTime() + days * 24 * 60 * 60 * 1000));
  };

  const navigateToday = () => {
    const today = new Date();
    const days = (viewEndDate.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24);
    setViewStartDate(new Date(today.getTime() - (days / 2) * 24 * 60 * 60 * 1000));
    setViewEndDate(new Date(today.getTime() + (days / 2) * 24 * 60 * 60 * 1000));
  };

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Cronograma de Produção</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            ← Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            Próximo →
          </Button>
        </div>
      </div>

      {/* Date Range Info */}
      <div className="text-sm text-muted-foreground mb-4">
        {viewStartDate.toLocaleDateString('pt-BR')} - {viewEndDate.toLocaleDateString('pt-BR')}
      </div>

      {/* Timeline Header */}
      <div className="flex border-b border-border pb-2 mb-4 overflow-x-auto">
        <div className="w-48 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex" style={{ minWidth: `${days.length * dayWidth}px` }}>
            {days.map((day, index) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={cn(
                    "flex-shrink-0 text-center text-xs border-r border-border",
                    isWeekend && "bg-muted/30",
                    isToday && "bg-primary/10"
                  )}
                  style={{ width: `${dayWidth}px` }}
                >
                  <div className="py-1">{day.getDate()}</div>
                  <div className="text-muted-foreground">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gantt Rows */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const position = getItemPosition(item);
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors cursor-pointer"
              onClick={() => onItemClick?.(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Item Name */}
              <div className="w-48 flex-shrink-0 flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="text-sm font-medium truncate">{item.name}</span>
              </div>

              {/* Timeline */}
              <div className="flex-1 relative h-8 bg-muted/30 rounded overflow-hidden">
                {/* Weekend indicators */}
                {days.map((day, dayIndex) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "absolute top-0 bottom-0",
                        isWeekend && "bg-muted/50"
                      )}
                      style={{
                        left: `${(dayIndex / days.length) * 100}%`,
                        width: `${(1 / days.length) * 100}%`,
                      }}
                    />
                  );
                })}

                {/* Item Bar */}
                <div
                  className={cn(
                    "absolute top-1 bottom-1 rounded-md transition-all",
                    getStatusColor(item.status),
                    hoveredItem === item.id && "brightness-110"
                  )}
                  style={{
                    left: `${position.left}%`,
                    width: `${position.width}%`,
                  }}
                >
                  {/* Progress */}
                  <div
                    className="absolute top-0 left-0 bottom-0 bg-black/20 rounded-md"
                    style={{ width: `${item.progress}%` }}
                  />
                  
                  {/* Label */}
                  {position.width > 5 && (
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-xs text-white font-medium truncate">
                        {item.progress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Today indicator */}
                {new Date() >= viewStartDate && new Date() <= viewEndDate && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary"
                    style={{
                      left: `${((new Date().getTime() - viewStartDate.getTime()) / (viewEndDate.getTime() - viewStartDate.getTime())) * 100}%`,
                    }}
                  />
                )}
              </div>

              {/* Priority Badge */}
              <div className="flex-shrink-0">
                <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
                  {item.priority}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-gray-500" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Em Andamento</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Concluído</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Atrasado</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-0.5 h-3 bg-primary" />
          <span>Hoje</span>
        </div>
      </div>
    </Card>
  );
}
