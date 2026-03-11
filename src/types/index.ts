export interface SourceField {
  key: string;
  sampleValue: string;
}

export interface TargetField {
  key: string;
  label: string;
  required: boolean;
  outputPath: string;
}

export type TransformationType = 'none' | 'split' | 'substring' | 'replace' | 'uppercase' | 'lowercase';

export interface FieldTransformation {
  type: TransformationType;
  // For split
  splitDelimiter?: string;
  splitIndex?: number;
  // For substring
  substringStart?: number;
  substringEnd?: number;
  // For replace
  replaceFrom?: string;
  replaceTo?: string;
}

export interface FieldMapping {
  targetKey: string;
  sourceKey: string | null;
  transformation?: FieldTransformation;
}

export interface ParsedXMLData {
  fields: SourceField[];
  records: Element[];
  recordCount: number;
}
