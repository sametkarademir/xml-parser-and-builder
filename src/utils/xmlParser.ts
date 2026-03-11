import type { SourceField, ParsedXMLData } from '../types';

export function parseXML(xmlString: string): ParsedXMLData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Could not parse XML. Please check the file format.');
  }

  // Find the root element (skip XML declaration and root wrapper)
  const root = xmlDoc.documentElement;
  
  // Get all direct children of root that are not text nodes
  const children = Array.from(root.children);
  
  if (children.length === 0) {
    throw new Error('No child elements found in XML.');
  }

  // Find the first repeating element (likely the item/record container)
  let items: Element[] = [];
  
  // Strategy: Find all groups of repeating elements at different levels,
  // then choose the one with the most elements (likely the actual records)
  interface RepeatingGroup {
    elements: Element[];
    tagName: string;
    depth: number;
  }
  
  function findAllRepeatingGroups(elements: Element[], depth = 0): RepeatingGroup[] {
    const groups: RepeatingGroup[] = [];
    const tagCounts = new Map<string, Element[]>();
    
    // Count elements by tag name at this level
    for (const element of elements) {
      const tagName = element.tagName;
      if (!tagCounts.has(tagName)) {
        tagCounts.set(tagName, []);
      }
      tagCounts.get(tagName)!.push(element);
    }
    
    // Add groups with multiple elements
    for (const [tagName, elementList] of tagCounts.entries()) {
      if (elementList.length > 1) {
        groups.push({
          elements: elementList,
          tagName,
          depth
        });
      }
      
      // Recursively check children of the first element of each tag
      if (elementList.length > 0) {
        const childElements = Array.from(elementList[0].children);
        if (childElements.length > 0) {
          const childGroups = findAllRepeatingGroups(childElements, depth + 1);
          groups.push(...childGroups);
        }
      }
    }
    
    return groups;
  }
  
  // Find all repeating groups
  const allGroups = findAllRepeatingGroups(children);
  
  if (allGroups.length > 0) {
    // Sort by: 1) number of elements (desc), 2) depth (desc - prefer deeper nested)
    allGroups.sort((a, b) => {
      if (b.elements.length !== a.elements.length) {
        return b.elements.length - a.elements.length;
      }
      return b.depth - a.depth;
    });
    
    items = allGroups[0].elements;
  }

  // If no repeating elements found, use all direct children
  if (items.length === 0) {
    items = children;
  }

  const firstItem = items[0];
  const fields = extractFieldsFromItem(firstItem);

  return {
    fields,
    records: items,
    recordCount: items.length,
  };
}

function extractFieldsFromItem(item: Element): SourceField[] {
  const fields: SourceField[] = [];
  const seenKeys = new Set<string>();

  function traverseElement(element: Element, parentPath = '') {
    const children = Array.from(element.children);

    if (children.length === 0) {
      const textContent = element.textContent?.trim() || '';
      const key = parentPath || element.tagName;
      
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        fields.push({
          key,
          sampleValue: textContent,
        });
      }
    } else {
      for (const child of children) {
        // Use tagName which preserves namespace prefix (e.g., "g:id")
        const childTag = child.tagName;
        const newPath = parentPath ? `${parentPath}.${childTag}` : childTag;
        
        const grandChildren = Array.from(child.children);
        if (grandChildren.length === 0) {
          const textContent = child.textContent?.trim() || '';
          if (!seenKeys.has(newPath)) {
            seenKeys.add(newPath);
            fields.push({
              key: newPath,
              sampleValue: textContent,
            });
          }
        } else {
          traverseElement(child, newPath);
        }
      }
    }
  }

  traverseElement(item);
  return fields;
}

export function getFieldValueFromRecord(record: Element, sourceKey: string): string {
  if (!sourceKey) return '';

  const parts = sourceKey.split('.');
  let current: Element | null = record;

  for (const part of parts) {
    if (!current) return '';
    
    // Handle namespace prefixes by searching through children manually
    // Match both full tagName (with prefix) and localName (without prefix)
    let child: Element | null = null;
    const childElements = Array.from(current.children);
    for (let i = 0; i < childElements.length; i++) {
      const childElement: Element = childElements[i];
      // Try exact match first (e.g., "g:id" === "g:id")
      if (childElement.tagName === part) {
        child = childElement;
        break;
      }
      // Try matching without namespace prefix (e.g., "id" matches "g:id")
      const localName = childElement.tagName.includes(':') 
        ? childElement.tagName.split(':')[1] 
        : childElement.tagName;
      const searchName = part.includes(':') ? part.split(':')[1] : part;
      if (localName === searchName) {
        child = childElement;
        break;
      }
    }
    
    if (!child) return '';
    current = child;
  }

  return current?.textContent?.trim() || '';
}
