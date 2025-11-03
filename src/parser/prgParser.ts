import { Command, CommandType, ParsedPath, Point } from '../types/prg';

export class PRGParser {
  private shutterOpen = false;
  private commands: Command[] = [];
  private shutterStates: boolean[] = [];

  parse(prgText: string): ParsedPath {
    this.shutterOpen = false;
    this.commands = [];
    this.shutterStates = [];

    const lines = prgText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('#')) {
        continue;
      }

      // Skip control flow (If, End, Stop)
      const upperLine = trimmed.toUpperCase();
      if (upperLine.startsWith('IF') || upperLine.startsWith('END') ||
          upperLine === 'STOP' || upperLine.startsWith('TILL') ||
          upperLine.startsWith('WAIT')) {

        // Handle wait separately if needed in the future
        if (upperLine.startsWith('WAIT')) {
          // For now, we ignore waits in rendering
        }
        continue;
      }

      // Check for shutter control
      if (upperLine.includes('SHUTTEROPEN')) {
        this.shutterOpen = true;
        continue;
      }
      if (upperLine.includes('SHUTTERCLOSE')) {
        this.shutterOpen = false;
        continue;
      }

      // Parse motion commands
      this.parseMotionCommand(trimmed);
    }

    return {
      commands: this.commands,
      shutterStates: this.shutterStates
    };
  }

  private parseMotionCommand(line: string): void {
    const upperLine = line.toUpperCase();

    // Parse MSEG
    if (upperLine.startsWith('MSEG')) {
      const point = this.extractPoint(line);
      if (point) {
        this.addCommand({ type: CommandType.MSEG, point });
      }
      return;
    }

    // Parse ENDS
    if (upperLine.startsWith('ENDS')) {
      const point = this.extractPoint(line);
      this.addCommand({ type: CommandType.ENDS, point });
      return;
    }

    // Parse LINE
    if (upperLine.startsWith('LINE')) {
      const point = this.extractPoint(line);
      if (point) {
        this.addCommand({ type: CommandType.LINE, point });
      }
      return;
    }

    // Parse ARC2
    if (upperLine.startsWith('ARC2')) {
      const point = this.extractPoint(line);
      const angle = this.extractAngle(line);
      if (point) {
        this.addCommand({ type: CommandType.ARC2, point, angle });
      }
      return;
    }

    // Parse PTP
    if (upperLine.startsWith('PTP')) {
      const point = this.extractPoint(line);
      if (point) {
        this.addCommand({ type: CommandType.PTP, point });
      }
      return;
    }
  }

  private addCommand(command: Command): void {
    this.commands.push(command);
    this.shutterStates.push(this.shutterOpen);
  }

  private extractPoint(line: string): Point | null {
    // Pattern: (X,Y),x_value,y_value
    const match = line.match(/\(X,Y\),\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/i);
    if (match) {
      return {
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      };
    }
    return null;
  }

  private extractAngle(line: string): number | undefined {
    // Arc commands have a third parameter: angle in radians
    const match = line.match(/\(X,Y\),\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/i);
    if (match && match[3]) {
      return parseFloat(match[3]);
    }
    return undefined;
  }
}
