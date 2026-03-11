import type { FieldTransformation } from '../types';

export function applyTransformation(value: string, transformation?: FieldTransformation): string {
  if (!transformation || transformation.type === 'none' || !value) {
    return value;
  }

  try {
    switch (transformation.type) {
      case 'split':
        if (transformation.splitDelimiter !== undefined && transformation.splitIndex !== undefined) {
          const parts = value.split(transformation.splitDelimiter);
          const index = transformation.splitIndex;
          
          if (index < 0) {
            // Negative index: count from end
            return parts[parts.length + index]?.trim() || '';
          }
          return parts[index]?.trim() || '';
        }
        return value;

      case 'substring':
        if (transformation.substringStart !== undefined) {
          const start = transformation.substringStart;
          const end = transformation.substringEnd;
          return end !== undefined ? value.substring(start, end) : value.substring(start);
        }
        return value;

      case 'replace':
        if (transformation.replaceFrom !== undefined && transformation.replaceTo !== undefined) {
          return value.replace(new RegExp(transformation.replaceFrom, 'g'), transformation.replaceTo);
        }
        return value;

      case 'uppercase':
        return value.toUpperCase();

      case 'lowercase':
        return value.toLowerCase();

      default:
        return value;
    }
  } catch (error) {
    console.error('Transformation error:', error);
    return value;
  }
}
