// 15 harmonious colors for todo item numbers
export const TODO_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F472B6', // Rose
  '#22D3EE', // Sky
  '#A855F7', // Purple
  '#FB7185', // Rose-400
];

export const getColorForNumber = (number: number): string => {
  return TODO_COLORS[(number - 1) % TODO_COLORS.length];
};