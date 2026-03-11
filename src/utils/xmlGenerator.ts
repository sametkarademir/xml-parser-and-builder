import type { FieldMapping, ParsedXMLData } from '../types';
import { getFieldValueFromRecord } from './xmlParser';
import { applyTransformation } from './transformations';

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXMLElement(
  tagName: string,
  value: string,
  indent: string,
  hasChildren: boolean = false
): string {
  if (hasChildren) {
    return `${indent}<${tagName}>\n${value}${indent}</${tagName}>`;
  }
  return `${indent}<${tagName}>${escapeXML(value)}</${tagName}>`;
}

export function generateOutputXML(
  sourceRecords: Element[],
  targetData: ParsedXMLData,
  mappings: FieldMapping[]
): string {
  const mappingMap = new Map<string, string>();
  mappings.forEach((m) => {
    if (m.sourceKey) {
      mappingMap.set(m.targetKey, m.sourceKey);
    }
  });

  // Get the root element name from target data
  const targetRootElement = targetData.records[0]?.parentElement?.tagName || 'Items';
  const targetItemElement = targetData.records[0]?.tagName || 'Item';

  const items = sourceRecords.map((sourceRecord) => {
    // Group fields by their parent path to avoid duplicate nested structures
    const fieldGroups = new Map<string, Array<{ key: string; value: string }>>();
    
    targetData.fields.forEach((targetField) => {
      const mapping = mappings.find(m => m.targetKey === targetField.key);
      const sourceKey = mapping?.sourceKey;
      
      let value = '';
      if (sourceKey) {
        const rawValue = getFieldValueFromRecord(sourceRecord, sourceKey);
        // Apply transformation if exists
        value = applyTransformation(rawValue, mapping?.transformation);
      }
      
      const parts = targetField.key.split('.');
      
      if (parts.length === 1) {
        // Top-level field
        const group = fieldGroups.get('__root__') || [];
        group.push({ key: targetField.key, value });
        fieldGroups.set('__root__', group);
      } else {
        // Nested field - group by parent path
        const parentPath = parts.slice(0, -1).join('.');
        const childKey = parts[parts.length - 1];
        const group = fieldGroups.get(parentPath) || [];
        group.push({ key: childKey, value });
        fieldGroups.set(parentPath, group);
      }
    });

    // Build XML content
    let itemContent = '';

    // Add root-level fields first
    const rootFields = fieldGroups.get('__root__') || [];
    rootFields.forEach(({ key, value }) => {
      itemContent += buildXMLElement(key, value, '    ') + '\n';
    });

    // Add nested groups
    fieldGroups.forEach((fields, parentPath) => {
      if (parentPath === '__root__') return; // Already handled

      // Build nested structure
      const pathParts = parentPath.split('.');
      const indent = '    ';
      
      // Open parent tags
      let nestedContent = '';
      pathParts.forEach((part, index) => {
        nestedContent += `${indent}${'  '.repeat(index)}<${part}>\n`;
      });

      // Add child fields
      const childIndent = indent + '  '.repeat(pathParts.length);
      fields.forEach(({ key, value }) => {
        nestedContent += buildXMLElement(key, value, childIndent) + '\n';
      });

      // Close parent tags
      for (let i = pathParts.length - 1; i >= 0; i--) {
        nestedContent += `${indent}${'  '.repeat(i)}</${pathParts[i]}>`;
        if (i > 0) nestedContent += '\n';
      }

      itemContent += nestedContent + '\n';
    });

    return `  <${targetItemElement}>\n${itemContent}  </${targetItemElement}>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<${targetRootElement}>
${items.join('\n')}
</${targetRootElement}>`;
}
