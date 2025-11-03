import { Command, CommandType, ParsedPath, Point, BoundingBox } from '../types/prg';

export interface RenderOptions {
  width?: number;
  height?: number;
  lineThickness?: number;
}

export class SVGRenderer {
  private currentX = 0;
  private currentY = 0;
  private paths: string[] = [];
  private currentPath: string[] = [];
  private isInSegment = false;

  render(parsedPath: ParsedPath, options: RenderOptions = {}): string {
    const { width = 800, height = 600, lineThickness = 1 } = options;
    this.paths = [];
    this.currentPath = [];
    this.currentX = 0;
    this.currentY = 0;
    this.isInSegment = false;

    // Calculate bounding box for proper scaling
    const bbox = this.calculateBoundingBox(parsedPath);
    const { viewBox, transform } = this.calculateViewBox(bbox, width, height);

    // Process commands
    for (let i = 0; i < parsedPath.commands.length; i++) {
      const command = parsedPath.commands[i];
      const shutterOn = parsedPath.shutterStates[i];

      this.processCommand(command, shutterOn);
    }

    // Finalize any remaining path
    if (this.currentPath.length > 0) {
      this.finalizePath(false);
    }

    // Build SVG
    const pathElements = this.paths.map((d, i) => {
      const isShutterOn = d.includes('data-shutter="on"');
      const stroke = isShutterOn ? '#2563eb' : '#dc2626'; // Blue for printing, Red for rapid move
      const strokeWidth = isShutterOn ? lineThickness : lineThickness * 0.7;

      return `<path d="${d.replace(/data-shutter="[^"]*"\s*/, '')}"
                    stroke="${stroke}"
                    stroke-width="${strokeWidth}"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round" />`;
    }).join('\n');

    return `<svg viewBox="${viewBox}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g transform="${transform}">
        ${pathElements}
      </g>
    </svg>`;
  }

  private processCommand(command: Command, shutterOn: boolean): void {
    switch (command.type) {
      case CommandType.MSEG:
        // Start a new segment
        if (this.currentPath.length > 0) {
          this.finalizePath(false);
        }
        if (command.point) {
          this.currentX = command.point.x;
          this.currentY = command.point.y;
          this.currentPath = [`M ${command.point.x} ${command.point.y}`];
          this.isInSegment = true;
        }
        break;

      case CommandType.ENDS:
        // End current segment
        if (this.currentPath.length > 0) {
          this.finalizePath(shutterOn);
        }
        this.isInSegment = false;
        break;

      case CommandType.LINE:
        if (command.point) {
          if (!this.isInSegment) {
            // Start a new path if not in segment
            this.currentPath = [`M ${this.currentX} ${this.currentY}`];
          }
          this.currentPath.push(`L ${command.point.x} ${command.point.y}`);
          this.currentX = command.point.x;
          this.currentY = command.point.y;
        }
        break;

      case CommandType.ARC2:
        if (command.point && command.angle !== undefined) {
          if (!this.isInSegment) {
            this.currentPath = [`M ${this.currentX} ${this.currentY}`];
          }

          // Calculate arc parameters
          const startX = this.currentX;
          const startY = this.currentY;
          const endX = command.point.x;
          const endY = command.point.y;
          const angle = command.angle;

          // Calculate chord length
          const dx = endX - startX;
          const dy = endY - startY;
          const chordLength = Math.sqrt(dx * dx + dy * dy);

          // Calculate radius from angle and chord length
          // For an arc, radius = chord / (2 * sin(angle/2))
          const halfAngle = Math.abs(angle) / 2;
          const radius = chordLength / (2 * Math.sin(halfAngle));

          // Determine sweep direction and large arc flag
          const sweepFlag = angle < 0 ? 0 : 1;
          const largeArcFlag = Math.abs(angle) > Math.PI ? 1 : 0;

          // Add SVG arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
          this.currentPath.push(`A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`);

          this.currentX = endX;
          this.currentY = endY;
        }
        break;

      case CommandType.PTP:
        // Point-to-point (rapid move)
        if (command.point) {
          // Finalize current path before rapid move
          if (this.currentPath.length > 0) {
            this.finalizePath(shutterOn);
          }
          // Move to new position
          this.currentX = command.point.x;
          this.currentY = command.point.y;
        }
        break;
    }
  }

  private finalizePath(shutterOn: boolean): void {
    if (this.currentPath.length > 1) {
      const pathData = this.currentPath.join(' ');
      const shutterAttr = shutterOn ? 'on' : 'off';
      this.paths.push(`data-shutter="${shutterAttr}" ${pathData}`);
    }
    this.currentPath = [];
  }

  private calculateBoundingBox(parsedPath: ParsedPath): BoundingBox {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const command of parsedPath.commands) {
      if (command.point) {
        minX = Math.min(minX, command.point.x);
        minY = Math.min(minY, command.point.y);
        maxX = Math.max(maxX, command.point.x);
        maxY = Math.max(maxY, command.point.y);
      }
    }

    // Add padding
    const padding = 1;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    };
  }

  private calculateViewBox(bbox: BoundingBox, width: number, height: number):
    { viewBox: string; transform: string } {

    const bboxWidth = bbox.maxX - bbox.minX;
    const bboxHeight = bbox.maxY - bbox.minY;

    // Create viewBox that fits content
    const viewBox = `${bbox.minX} ${bbox.minY} ${bboxWidth} ${bboxHeight}`;

    // Flip Y-axis (SVG has Y increasing downward, but machine coords usually go up)
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    const transform = `translate(${centerX}, ${centerY}) scale(1, -1) translate(${-centerX}, ${-centerY})`;

    return { viewBox, transform };
  }
}
