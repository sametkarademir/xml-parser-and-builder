import { useState, useRef } from 'react';
import type { ParsedXMLData } from '../types';
import { parseXML } from '../utils/xmlParser';

interface UploadStepProps {
  onContinue: (sourceData: ParsedXMLData, targetData: ParsedXMLData) => void;
}

export default function UploadStep({ onContinue }: UploadStepProps) {
  const [dragActiveSource, setDragActiveSource] = useState(false);
  const [dragActiveTarget, setDragActiveTarget] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<ParsedXMLData | null>(null);
  const [targetData, setTargetData] = useState<ParsedXMLData | null>(null);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isLoadingTarget, setIsLoadingTarget] = useState(false);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);
  const targetFileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceFile = async (file: File) => {
    setError(null);
    setIsLoadingSource(true);

    if (!file.name.endsWith('.xml')) {
      setError('Please upload a valid .xml file for source');
      setIsLoadingSource(false);
      return;
    }

    try {
      const text = await file.text();
      const data = parseXML(text);
      setSourceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse source XML. Please check the file format.');
    } finally {
      setIsLoadingSource(false);
    }
  };

  const handleTargetFile = async (file: File) => {
    setError(null);
    setIsLoadingTarget(true);

    if (!file.name.endsWith('.xml')) {
      setError('Please upload a valid .xml file for target');
      setIsLoadingTarget(false);
      return;
    }

    try {
      const text = await file.text();
      const data = parseXML(text);
      setTargetData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse target XML. Please check the file format.');
    } finally {
      setIsLoadingTarget(false);
    }
  };

  const handleSourceDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveSource(true);
    } else if (e.type === 'dragleave') {
      setDragActiveSource(false);
    }
  };

  const handleTargetDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActiveTarget(true);
    } else if (e.type === 'dragleave') {
      setDragActiveTarget(false);
    }
  };

  const handleSourceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveSource(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSourceFile(e.dataTransfer.files[0]);
    }
  };

  const handleTargetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTarget(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleTargetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleSourceFile(e.target.files[0]);
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleTargetFile(e.target.files[0]);
    }
  };

  const handleSourceButtonClick = () => {
    sourceFileInputRef.current?.click();
  };

  const handleTargetButtonClick = () => {
    targetFileInputRef.current?.click();
  };

  const handleContinue = () => {
    if (sourceData && targetData) {
      onContinue(sourceData, targetData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload XML Files</h2>
      <p className="text-sm text-gray-600 mb-6">
        Upload both source and target XML files to extract and map their fields
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Source XML Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            1. Source XML
            <span className="text-sm font-normal text-gray-500 ml-2">(Input file to convert)</span>
          </h3>
          
          {!sourceData ? (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActiveSource ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragEnter={handleSourceDrag}
              onDragLeave={handleSourceDrag}
              onDragOver={handleSourceDrag}
              onDrop={handleSourceDrop}
              onClick={handleSourceButtonClick}
            >
              <input
                ref={sourceFileInputRef}
                type="file"
                accept=".xml"
                onChange={handleSourceChange}
                className="hidden"
              />
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">Source XML file</p>

              {isLoadingSource && (
                <div className="mt-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-xs text-gray-600">Parsing...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {sourceData.recordCount} records, {sourceData.fields.length} fields
                    </span>
                  </div>
                  <button
                    onClick={() => setSourceData(null)}
                    className="text-xs text-green-700 hover:text-green-900 underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Field
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sample
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sourceData.fields.map((field, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs font-medium text-gray-900">
                          {field.key}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600 truncate max-w-xs">
                          {field.sampleValue || <span className="text-gray-400 italic">empty</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Target XML Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. Target XML
            <span className="text-sm font-normal text-gray-500 ml-2">(Desired output format)</span>
          </h3>
          
          {!targetData ? (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActiveTarget ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
              `}
              onDragEnter={handleTargetDrag}
              onDragLeave={handleTargetDrag}
              onDragOver={handleTargetDrag}
              onDrop={handleTargetDrop}
              onClick={handleTargetButtonClick}
            >
              <input
                ref={targetFileInputRef}
                type="file"
                accept=".xml"
                onChange={handleTargetChange}
                className="hidden"
              />
              <svg
                className="mx-auto h-10 w-10 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-green-600">Click to upload</span> or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">Target XML file</p>

              {isLoadingTarget && (
                <div className="mt-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  <p className="mt-2 text-xs text-gray-600">Parsing...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-800">
                      {targetData.recordCount} records, {targetData.fields.length} fields
                    </span>
                  </div>
                  <button
                    onClick={() => setTargetData(null)}
                    className="text-xs text-green-700 hover:text-green-900 underline"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Field
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sample
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {targetData.fields.map((field, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-xs font-medium text-gray-900">
                          {field.key}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-600 truncate max-w-xs">
                          {field.sampleValue || <span className="text-gray-400 italic">empty</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!sourceData || !targetData}
          className={`
            px-6 py-2 font-medium rounded-lg transition-colors
            ${sourceData && targetData
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Mapping →
        </button>
      </div>
    </div>
  );
}
