export type QuadrantType = 
  | "high-urgency-low-impact" 
  | "high-urgency-high-impact" 
  | "low-urgency-low-impact" 
  | "low-urgency-high-impact"
  | null;

export interface DragItem {
  id: number;
  type: "todo-item";
  text: string;
  number: number;
}

export interface Position {
  x: number;
  y: number;
}
