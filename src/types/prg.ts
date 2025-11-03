// Type definitions for PRG commands and parsed data

export interface Point {
  x: number;
  y: number;
}

export enum CommandType {
  PTP = 'ptp',           // Point-to-point move
  LINE = 'line',         // Linear motion
  ARC2 = 'arc2',         // Arc motion
  MSEG = 'MSEG',         // Begin motion segment
  ENDS = 'ENDS',         // End motion segment
  SHUTTER_OPEN = 'shutter_open',
  SHUTTER_CLOSE = 'shutter_close',
  WAIT = 'wait',
  UNKNOWN = 'unknown'
}

export interface Command {
  type: CommandType;
  point?: Point;
  angle?: number;        // For arc commands
  speed?: number;        // For ptp commands
}

export interface ParsedPath {
  commands: Command[];
  shutterStates: boolean[]; // true = on, false = off, indexed by command
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
