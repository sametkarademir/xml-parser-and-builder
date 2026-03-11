import { useState } from 'react';
import type { FieldMapping, ParsedXMLData, FieldTransformation, TransformationType } from '../types';
import { getFieldValueFromRecord } from '../utils/xmlParser';
import { applyTransformation } from '../utils/transformations';
import SearchableSelect from './SearchableSelect';

interface MappingStepProps {
  sourceData: ParsedXMLData;
  targetData: ParsedXMLData;
  initialMappings?: FieldMapping[];
  onComplete: (mappings: FieldMapping[]) => void;
  onBack: () => void;
}

export default function MappingStep({
  sourceData,
  targetData,
  initialMappings,
  onComplete,
  onBack,
}: MappingStepProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(() => {
    if (initialMappings) return initialMappings;
    return targetData.fields.map((field) => ({
      targetKey: field.key,
      sourceKey: null,
      transformation: { type: 'none' },
    }));
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedTransforms, setExpandedTransforms] = useState<Set<string>>(new Set());

  const handleMappingChange = (targetKey: string, sourceKey: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.targetKey === targetKey
          ? { ...m, sourceKey: sourceKey === '' ? null : sourceKey }
          : m
      )
    );
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[targetKey];
      return newErrors;
    });
  };

  const handleTransformationTypeChange = (targetKey: string, type: TransformationType) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.targetKey === targetKey
          ? {
              ...m,
              transformation: {
                type,
                ...(type === 'split' && { splitDelimiter: '>', splitIndex: 0 }),
                ...(type === 'substring' && { substringStart: 0, substringEnd: 10 }),
                ...(type === 'replace' && { replaceFrom: '', replaceTo: '' }),
              },
            }
          : m
      )
    );
  };

  const handleTransformationParamChange = (
    targetKey: string,
    param: keyof FieldTransformation,
    value: string | number
  ) => {
    setMappings((prev) =>
      prev.map((m) => {
        if (m.targetKey === targetKey && m.transformation) {
          return {
            ...m,
            transformation: {
              ...m.transformation,
              [param]: value,
            },
          };
        }
        return m;
      })
    );
  };

  const toggleTransformExpanded = (targetKey: string) => {
    setExpandedTransforms((prev) => {
      const next = new Set(prev);
      if (next.has(targetKey)) {
        next.delete(targetKey);
      } else {
        next.add(targetKey);
      }
      return next;
    });
  };

  const validateMappings = (): boolean => {
    return true;
  };

  const handleSubmit = () => {
    if (validateMappings()) {
      onComplete(mappings);
    }
  };

  const getPreviewValue = (targetKey: string): string => {
    const mapping = mappings.find((m) => m.targetKey === targetKey);
    if (!mapping?.sourceKey || sourceData.records.length === 0) return '—';

    const rawValue = getFieldValueFromRecord(sourceData.records[0], mapping.sourceKey);
    if (!rawValue) return '—';

    const transformedValue = applyTransformation(rawValue, mapping.transformation);
    return transformedValue || '—';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Field Mapping</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Map Fields</h3>
            <p className="text-xs text-gray-500 mt-1">
              Map source fields to target fields and apply transformations
            </p>
          </div>
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
            {targetData.fields.map((targetField) => {
              const mapping = mappings.find((m) => m.targetKey === targetField.key);
              const isExpanded = expandedTransforms.has(targetField.key);
              const hasSourceField = !!mapping?.sourceKey;

              return (
                <div key={targetField.key} className="border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {targetField.key}
                  </label>
                  
                  <SearchableSelect
                    value={mapping?.sourceKey || ''}
                    onChange={(val) => handleMappingChange(targetField.key, val)}
                    options={[
                      { value: '', label: '— Not mapped —' },
                      ...sourceData.fields.map((field) => ({
                        value: field.key,
                        label: `${field.key} → ${field.sampleValue.substring(0, 30)}${field.sampleValue.length > 30 ? '...' : ''}`,
                      })),
                    ]}
                    placeholder="Select source field..."
                  />

                  {hasSourceField && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleTransformExpanded(targetField.key)}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                      >
                        <svg
                          className={`w-3 h-3 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {isExpanded ? 'Hide' : 'Add'} Transformation
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Transform Type
                            </label>
                            <select
                              value={mapping?.transformation?.type || 'none'}
                              onChange={(e) =>
                                handleTransformationTypeChange(targetField.key, e.target.value as TransformationType)
                              }
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="none">No transformation</option>
                              <option value="split">Split by delimiter</option>
                              <option value="substring">Substring</option>
                              <option value="replace">Find & Replace</option>
                              <option value="uppercase">Uppercase</option>
                              <option value="lowercase">Lowercase</option>
                            </select>
                          </div>

                          {mapping?.transformation?.type === 'split' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Delimiter
                                </label>
                                <input
                                  type="text"
                                  value={mapping.transformation.splitDelimiter || ''}
                                  onChange={(e) =>
                                    handleTransformationParamChange(targetField.key, 'splitDelimiter', e.target.value)
                                  }
                                  placeholder="e.g., > or , or |"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Index (0-based, or -1 for last)
                                </label>
                                <input
                                  type="number"
                                  value={mapping.transformation.splitIndex ?? 0}
                                  onChange={(e) =>
                                    handleTransformationParamChange(targetField.key, 'splitIndex', parseInt(e.target.value))
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Example: "A &gt; B &gt; C" with index 2 = "C"
                                </p>
                              </div>
                            </>
                          )}

                          {mapping?.transformation?.type === 'substring' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Start Position
                                </label>
                                <input
                                  type="number"
                                  value={mapping.transformation.substringStart ?? 0}
                                  onChange={(e) =>
                                    handleTransformationParamChange(targetField.key, 'substringStart', parseInt(e.target.value))
                                  }
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  End Position (optional)
                                </label>
                                <input
                                  type="number"
                                  value={mapping.transformation.substringEnd ?? ''}
                                  onChange={(e) =>
                                    handleTransformationParamChange(
                                      targetField.key,
                                      'substringEnd',
                                      e.target.value ? parseInt(e.target.value) : ''
                                    )
                                  }
                                  placeholder="Leave empty for end of string"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </>
                          )}

                          {mapping?.transformation?.type === 'replace' && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Find Text
                                </label>
                                <input
                                  type="text"
                                  value={mapping.transformation.replaceFrom || ''}
                                  onChange={(e) =>
                                    handleTransformationParamChange(targetField.key, 'replaceFrom', e.target.value)
                                  }
                                  placeholder="Text to find"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Replace With
                                </label>
                                <input
                                  type="text"
                                  value={mapping.transformation.replaceTo || ''}
                                  onChange={(e) =>
                                    handleTransformationParamChange(targetField.key, 'replaceTo', e.target.value)
                                  }
                                  placeholder="Replacement text"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {errors[targetField.key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[targetField.key]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Preview Mapping</h3>
            <p className="text-xs text-gray-500 mt-1">First record with current mapping and transformations</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {targetData.fields.map((targetField) => {
              const value = getPreviewValue(targetField.key);
              const mapping = mappings.find((m) => m.targetKey === targetField.key);
              const isMapped = !!mapping?.sourceKey;
              const hasTransform = mapping?.transformation?.type && mapping.transformation.type !== 'none';

              return (
                <div
                  key={targetField.key}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium text-gray-500">
                      {targetField.key}
                    </div>
                    {hasTransform && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {mapping.transformation?.type}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm font-mono break-words ${
                      isMapped && value !== '—' ? 'text-green-700' : 'text-gray-400'
                    }`}
                  >
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Complete Mapping →
        </button>
      </div>
    </div>
  );
}
