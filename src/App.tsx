import { useState } from 'react';
import StepIndicator from './components/StepIndicator';
import UploadStep from './components/UploadStep';
import MappingStep from './components/MappingStep';
import OutputStep from './components/OutputStep';
import type { ParsedXMLData, FieldMapping } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceData, setSourceData] = useState<ParsedXMLData | null>(null);
  const [targetData, setTargetData] = useState<ParsedXMLData | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  const handleUploadComplete = (source: ParsedXMLData, target: ParsedXMLData) => {
    setSourceData(source);
    setTargetData(target);
    setCurrentStep(2);
  };

  const handleMappingComplete = (newMappings: FieldMapping[]) => {
    setMappings(newMappings);
    setCurrentStep(3);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSourceData(null);
    setTargetData(null);
    setMappings([]);
  };

  const handleBackToUpload = () => {
    setCurrentStep(1);
  };

  const handleBackToMapping = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">XML Field Mapper</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload, map, and transform XML files to your target schema
          </p>
        </div>
      </header>

      <StepIndicator currentStep={currentStep} />

      <main className="py-8">
        {currentStep === 1 && <UploadStep onContinue={handleUploadComplete} />}
        {currentStep === 2 && sourceData && targetData && (
          <MappingStep
            sourceData={sourceData}
            targetData={targetData}
            initialMappings={mappings.length > 0 ? mappings : undefined}
            onComplete={handleMappingComplete}
            onBack={handleBackToUpload}
          />
        )}
        {currentStep === 3 && sourceData && targetData && (
          <OutputStep
            sourceData={sourceData}
            targetData={targetData}
            mappings={mappings}
            onStartOver={handleStartOver}
            onBack={handleBackToMapping}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          XML Field Mapper — Client-side XML transformation tool
        </div>
      </footer>
    </div>
  );
}

export default App;
