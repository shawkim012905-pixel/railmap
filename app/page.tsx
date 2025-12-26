'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import RouteDiagram from './components/RouteDiagram';
import CostTimeSimulator from './components/CostTimeSimulator';
import { scenarios } from './data/scenarios';
import { Scenario } from './data/types';

// Helper function to find scenario by ID, with fallback
function findScenarioById(id: string | null): Scenario | null {
  if (!id) return null;
  return scenarios.find(s => s.id === id) || null;
}

// Helper function to get short display name for scenarios
function getShortDisplayName(scenario: Scenario): string {
  // Use shortName if available, otherwise return title
  return scenario.shortName || scenario.title;
}

// Dropdown component for scenario selection
function ScenarioDropdown({
  label,
  selectedScenario,
  onSelect,
  color = 'teal',
}: {
  label: string;
  selectedScenario: Scenario;
  onSelect: (scenario: Scenario) => void;
  color?: 'teal' | 'purple';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorClasses = {
    teal: {
      button: 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-100 hover:border-teal-300 dark:hover:border-teal-700',
      selected: 'bg-teal-50 dark:bg-teal-950/30',
    },
    purple: {
      button: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 hover:border-purple-300 dark:hover:border-purple-700',
      selected: 'bg-purple-50 dark:bg-purple-950/30',
    },
  };

  const classes = colorClasses[color];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Show all scenarios, but we'll handle the swap logic in the parent
  const availableScenarios = scenarios;

  const handleSelect = (scenario: Scenario) => {
    onSelect(scenario);
    setIsOpen(false);
  };

  const shortName = getShortDisplayName(selectedScenario);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        {label}
      </div>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full max-w-full px-5 py-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 overflow-hidden ${classes.button} ${isOpen ? 'shadow-md' : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="min-w-0 flex-1">
          <span className="text-base font-semibold text-gray-900 dark:text-gray-50 leading-tight whitespace-nowrap overflow-hidden text-ellipsis block">
            {shortName}
          </span>
        </div>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="mt-1.5 min-w-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
          {selectedScenario.title}
        </span>
      </div>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl max-h-[360px] overflow-y-auto w-[520px] max-w-[90vw]"
            style={{ 
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              animation: 'fadeInScale 0.2s ease-out forwards',
              pointerEvents: 'auto',
              scrollbarWidth: 'thin',
            }}
            role="listbox"
          >
            <div className="px-4 py-3">
              {availableScenarios.map((scenario) => {
                const isSelected = scenario.id === selectedScenario.id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleSelect(scenario)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center justify-between gap-4 ${
                      isSelected ? classes.selected : ''
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-base font-medium text-gray-900 dark:text-gray-50 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {scenario.title}
                    </span>
                    {isSelected && (
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          color === 'teal'
                            ? 'text-teal-500 dark:text-teal-400'
                            : 'text-purple-500 dark:text-purple-400'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default function Explorer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params - compute once using useMemo
  const initialState = (() => {
    const compare = searchParams.get('compare') === '1';
    const scenarioId = searchParams.get('s');
    const scenarioAId = searchParams.get('a');
    const scenarioBId = searchParams.get('b');

    if (compare) {
      // Compare mode
      const a = findScenarioById(scenarioAId) || scenarios[0];
      const b = findScenarioById(scenarioBId) || scenarios[1];
      // Ensure A and B are different
      const finalB = a.id === b.id ? scenarios.find(s => s.id !== a.id) || scenarios[1] : b;
      return { compareMode: true, selected: a, a, b: finalB };
    } else {
      // Single scenario mode
      const selected = findScenarioById(scenarioId) || scenarios[0];
      return { compareMode: false, selected, a: scenarios[0], b: scenarios[1] };
    }
  })();

  const [compareMode, setCompareMode] = useState(initialState.compareMode);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(initialState.selected);
  const [scenarioA, setScenarioA] = useState<Scenario>(initialState.a);
  const [scenarioB, setScenarioB] = useState<Scenario>(initialState.b);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    failures: boolean;
    whyRoute: boolean;
    failuresCompare: boolean;
    whyRouteCompare: boolean;
  }>({
    failures: false,
    whyRoute: false,
    failuresCompare: false,
    whyRouteCompare: false,
  });
  const [expandedInsights, setExpandedInsights] = useState<{
    a: boolean;
    b: boolean;
  }>({
    a: false,
    b: false,
  });
  const [diagramKey, setDiagramKey] = useState(0);
  const [simpleMode, setSimpleMode] = useState(false);

  // Function to simplify node labels for beginner mode
  const simplifyNodeLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      'Issuer Bank': 'Your bank',
      'Your Bank': 'Your bank',
      'Payment Processor': 'Payment processor',
      'Card Network': 'Visa / Mastercard network',
      'Interac Network': 'Interac network',
      'SWIFT Network': 'SWIFT network',
      'Interac e-Transfer': 'Interac e-Transfer',
      'Acquirer Bank': "Merchant's bank",
      'Recipient Bank': "Recipient's bank",
      'Payment Gateway': 'Payment processor',
      'Settlement': 'Funds transferred',
    };
    return labelMap[label] || label;
  };

  // Update URL when state changes (but not on initial load)
  const updateURL = useCallback((compare: boolean, selected?: Scenario, a?: Scenario, b?: Scenario) => {
    if (!isInitialized) return;
    
    const params = new URLSearchParams();
    
    if (compare) {
      params.set('compare', '1');
      if (a) params.set('a', a.id);
      if (b) params.set('b', b.id);
    } else {
      if (selected) params.set('s', selected.id);
    }
    
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [router, isInitialized]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Update diagram key when scenario changes for fade transition
  useEffect(() => {
    if (isInitialized) {
      setDiagramKey(prev => prev + 1);
    }
  }, [selectedScenario.id, scenarioA.id, scenarioB.id, isInitialized]);

  // Sync URL when state changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    if (compareMode) {
      updateURL(true, undefined, scenarioA, scenarioB);
    } else {
      updateURL(false, selectedScenario);
    }
  }, [compareMode, selectedScenario, scenarioA, scenarioB, updateURL, isInitialized]);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] dark:bg-[#0f172a]">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-transparent to-transparent dark:from-teal-950/20 rounded-3xl -z-10" />
          <div className="relative px-8 py-12 sm:px-12 sm:py-16">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 tracking-tight mb-4">
                Explore how payments move in Canada
          </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl">
                RailMap visualizes the complete journey of Canadian payment transactions, showing you the flow, timing, fees, and potential failure points for each payment method.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    // Scroll to scenarios section
                    const scenariosSection = document.querySelector('[data-scenarios-section]');
                    scenariosSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center px-6 py-3 rounded-full font-medium text-base bg-teal-500 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:bg-teal-600 transition-all duration-200"
                >
                  Explore payment routes
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Simplify terminology</span>
                  <button
                    onClick={() => setSimpleMode(!simpleMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      simpleMode ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-label={simpleMode ? 'Disable simple mode' : 'Enable simple mode'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        simpleMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Scenario Picker */}
          <div className="lg:col-span-3 order-1 lg:order-1" data-scenarios-section>
            <div className="lg:sticky lg:top-8 overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {compareMode ? 'Select Scenarios' : 'Scenarios'}
                </h2>
                {!compareMode && (
                  <button
                    onClick={() => {
                      const newCompareMode = !compareMode;
                      setCompareMode(newCompareMode);
                      if (newCompareMode) {
                        if (scenarioA.id === scenarioB.id) {
                          const newB = scenarios.find(s => s.id !== scenarioA.id) || scenarios[1];
                          setScenarioB(newB);
                        }
                      }
                    }}
                    className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    Compare Mode
                  </button>
                )}
              </div>
              {compareMode && (
                <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-full overflow-visible">
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="min-w-0 relative overflow-visible">
                      <ScenarioDropdown
                        label="Scenario A"
                        selectedScenario={scenarioA}
                        onSelect={(scenario) => {
                          // If selecting the same as B, swap them
                          if (scenario.id === scenarioB.id) {
                            setScenarioA(scenarioB);
                            setScenarioB(scenario);
                          } else {
                            setScenarioA(scenario);
                          }
                        }}
                        color="teal"
                      />
                    </div>
                    <div className="min-w-0 relative overflow-visible">
                      <ScenarioDropdown
                        label="Scenario B"
                        selectedScenario={scenarioB}
                        onSelect={(scenario) => {
                          // If selecting the same as A, swap them
                          if (scenario.id === scenarioA.id) {
                            setScenarioB(scenarioA);
                            setScenarioA(scenario);
                          } else {
                            setScenarioB(scenario);
                          }
                        }}
                        color="purple"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Compare timing, fees, and failure points.
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {scenarios.map((scenario) => {
                  if (compareMode) {
                    const isA = scenarioA.id === scenario.id;
                    const isB = scenarioB.id === scenario.id;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          if (isA) {
                            // Clicking A swaps A and B
                            const newA = scenarioB;
                            const newB = scenario;
                            setScenarioA(newA);
                            setScenarioB(newB);
                          } else if (isB) {
                            // Clicking B swaps A and B
                            const newA = scenario;
                            const newB = scenarioA;
                            setScenarioA(newA);
                            setScenarioB(newB);
                          } else {
                            // Clicking unselected scenario: set as B (or A if A and B are same)
                            if (scenarioA.id === scenarioB.id) {
                              setScenarioA(scenario);
                            } else {
                              setScenarioB(scenario);
                            }
                          }
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                          isA
                            ? 'border-teal-400 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md shadow-teal-500/10'
                            : isB
                            ? 'border-purple-400 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-md shadow-purple-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className={`font-semibold text-base leading-snug ${
                            isA
                              ? 'text-teal-900 dark:text-teal-100'
                              : isB
                              ? 'text-purple-900 dark:text-purple-100'
                              : 'text-gray-900 dark:text-gray-50'
                          }`}>
                            {scenario.title}
                          </h3>
                          {(isA || isB) && (
                            <span className={`px-2 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                              isA
                                ? 'bg-teal-500 dark:bg-teal-400 text-white'
                                : 'bg-purple-500 dark:bg-purple-400 text-white'
                            }`}>
                              {isA ? 'A' : 'B'}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mb-3 leading-relaxed ${
                          isA
                            ? 'text-teal-700 dark:text-teal-300'
                            : isB
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {scenario.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {scenario.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                isA
                                  ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                                  : isB
                                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  } else {
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenario(scenario);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                          selectedScenario.id === scenario.id
                            ? 'border-teal-400 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-md shadow-teal-500/10'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-gray-50 leading-snug">
                            {scenario.title}
                          </h3>
                          {selectedScenario.id === scenario.id && (
                            <svg className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {scenario.subtitle}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {scenario.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Middle - Diagram */}
          <div className={compareMode ? "lg:col-span-5 order-2 lg:order-2" : "lg:col-span-6 order-2 lg:order-2"}>
            {compareMode ? (
              <div className="space-y-6">
                {/* Scenario A */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative z-0">
                  <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-teal-50/50 via-transparent to-transparent dark:from-teal-950/20 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="px-3 py-1.5 rounded-full bg-teal-500 text-white text-xs font-bold flex-shrink-0">
                          Scenario A
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 leading-tight truncate">
                            {scenarioA.title}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {scenarioA.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div key={`a-${scenarioA.id}`} className="transition-opacity duration-300">
                      <RouteDiagram scenario={scenarioA} simpleMode={simpleMode} simplifyLabel={simplifyNodeLabel} />
                    </div>
                  </div>
                </div>
                {/* Scenario B */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative z-0">
                  <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-purple-50/50 via-transparent to-transparent dark:from-purple-950/20 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="px-3 py-1.5 rounded-full bg-purple-500 text-white text-xs font-bold flex-shrink-0">
                          Scenario B
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 leading-tight truncate">
                            {scenarioB.title}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {scenarioB.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div key={`b-${scenarioB.id}`} className="transition-opacity duration-300">
                      <RouteDiagram scenario={scenarioB} simpleMode={simpleMode} simplifyLabel={simplifyNodeLabel} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden relative z-0">
                <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-teal-50/50 via-transparent to-transparent dark:from-teal-950/20 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-1.5 leading-tight">
                        {selectedScenario.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedScenario.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div key={selectedScenario.id} className="transition-opacity duration-300">
                    <RouteDiagram scenario={selectedScenario} simpleMode={simpleMode} simplifyLabel={simplifyNodeLabel} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Metrics & Info */}
          <div className={compareMode ? "lg:col-span-4 order-3 lg:order-3" : "lg:col-span-3 order-3 lg:order-3"}>
            <div className="lg:sticky lg:top-8 space-y-6">
              {compareMode ? (
                <>
                  {/* Metrics Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                      At a Glance
                    </h3>
                    {(scenarioA.insight || scenarioB.insight) && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {scenarioA.insight && (
                          <div className="p-6 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50">
                            <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-3">Scenario A</div>
                            <div className="min-w-0">
                              {scenarioA.insight.length > 90 ? (
                                <>
                                  <p 
                                    className={`text-sm text-gray-700 dark:text-gray-300 leading-loose transition-all duration-200 ${
                                      expandedInsights.a ? '' : 'line-clamp-2'
                                    }`}
                                    style={expandedInsights.a ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                  >
                                    {scenarioA.insight}
                                  </p>
                                  <button
                                    onClick={() => setExpandedInsights(prev => ({ ...prev, a: !prev.a }))}
                                    className="mt-3 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                                  >
                                    {expandedInsights.a ? 'Read less' : 'Read more'}
                                  </button>
                                </>
                              ) : (
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-loose">
                                  {scenarioA.insight}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {scenarioB.insight && (
                          <div className="p-6 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50">
                            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-3">Scenario B</div>
                            <div className="min-w-0">
                              {scenarioB.insight.length > 90 ? (
                                <>
                                  <p 
                                    className={`text-sm text-gray-700 dark:text-gray-300 leading-loose transition-all duration-200 ${
                                      expandedInsights.b ? '' : 'line-clamp-2'
                                    }`}
                                    style={expandedInsights.b ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                  >
                                    {scenarioB.insight}
                                  </p>
                                  <button
                                    onClick={() => setExpandedInsights(prev => ({ ...prev, b: !prev.b }))}
                                    className="mt-3 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                  >
                                    {expandedInsights.b ? 'Read less' : 'Read more'}
                                  </button>
                                </>
                              ) : (
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-loose">
                                  {scenarioB.insight}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`grid gap-3 transition-all duration-300 ${simpleMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {simpleMode ? 'How fast?' : 'Authorization Time'}
                        </div>
                        <div className="space-y-2">
                          <div className="px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                            <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">Scenario A</div>
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                              {scenarioA.metrics.authTime}
                            </div>
                          </div>
                          <div className="px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Scenario B</div>
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                              {scenarioB.metrics.authTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {simpleMode ? 'When do you pay?' : 'Consumer Fee'}
                        </div>
                        <div className="space-y-2">
                          <div className="px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                            <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">Scenario A</div>
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                              {scenarioA.metrics.consumerFee}
                            </div>
                          </div>
                          <div className="px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                            <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Scenario B</div>
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                              {scenarioB.metrics.consumerFee}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!simpleMode && (
                        <>
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Settlement Time</div>
                            <div className="space-y-2">
                              <div className="px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                                <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">Scenario A</div>
                                <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                  {scenarioA.metrics.settlementTime}
                                </div>
                              </div>
                              <div className="px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Scenario B</div>
                                <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                  {scenarioB.metrics.settlementTime}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Merchant Fee</div>
                            <div className="space-y-2">
                              <div className="px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
                                <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">Scenario A</div>
                                <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                  {scenarioA.metrics.merchantFee}
                                </div>
                              </div>
                              <div className="px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Scenario B</div>
                                <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                  {scenarioB.metrics.merchantFee}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cost & Time Simulator Comparison */}
                  {scenarioA.economics && scenarioB.economics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <CostTimeSimulator scenario={scenarioA} label="Scenario A" color="teal" />
                      <CostTimeSimulator scenario={scenarioB} label="Scenario B" color="purple" />
                    </div>
                  )}

                  {/* Common Failures Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, failuresCompare: !prev.failuresCompare }))}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Common Failure Points
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.failuresCompare ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.failuresCompare && (
                      <div className="px-6 pb-6 transition-all duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-3">Scenario A</div>
                            <ul className="space-y-2.5">
                              {scenarioA.commonFailures.map((failure, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-teal-400 dark:text-teal-500 mr-2 mt-0.5 text-sm">•</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {failure}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">Scenario B</div>
                            <ul className="space-y-2.5">
                              {scenarioB.commonFailures.map((failure, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-purple-400 dark:text-purple-500 mr-2 mt-0.5 text-sm">•</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {failure}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Why This Route Comparison */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, whyRouteCompare: !prev.whyRouteCompare }))}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Why This Route
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.whyRouteCompare ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.whyRouteCompare && (
                      <div className="px-6 pb-6 transition-all duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-3">Scenario A</div>
                            <ul className="space-y-2.5">
                              {scenarioA.whyThisRoute.map((reason, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-teal-400 dark:text-teal-500 mr-2 mt-0.5 text-sm">•</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {reason}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3">Scenario B</div>
                            <ul className="space-y-2.5">
                              {scenarioB.whyThisRoute.map((reason, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-purple-400 dark:text-purple-500 mr-2 mt-0.5 text-sm">•</span>
                                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {reason}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Metrics */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">
                      At a Glance
                    </h3>
                    {selectedScenario.insight && (
                      <div className="mb-4 p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedScenario.insight}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className={`grid gap-3 transition-all duration-300 ${simpleMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {simpleMode ? 'How fast?' : 'Authorization Time'}
                        </div>
                        <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                          <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            {selectedScenario.metrics.authTime}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          {simpleMode ? 'When do you pay?' : 'Consumer Fee'}
                        </div>
                        <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                          <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            {selectedScenario.metrics.consumerFee}
                          </div>
                        </div>
                      </div>
                      {!simpleMode && (
                        <>
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Settlement Time</div>
                            <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                              <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                {selectedScenario.metrics.settlementTime}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Merchant Fee</div>
                            <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                              <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                {selectedScenario.metrics.merchantFee}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cost & Time Simulator */}
                  {selectedScenario.economics && (
                    <CostTimeSimulator scenario={selectedScenario} />
                  )}

                  {/* Common Failures */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, failures: !prev.failures }))}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Common Failure Points
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.failures ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.failures && (
                      <div className="px-6 pb-6 transition-all duration-300">
                        <ul className="space-y-2.5">
                          {selectedScenario.commonFailures.map((failure, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-teal-400 dark:text-teal-500 mr-2 mt-0.5 text-sm">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {failure}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Why This Route */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, whyRoute: !prev.whyRoute }))}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        Why This Route
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedSections.whyRoute ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSections.whyRoute && (
                      <div className="px-6 pb-6 transition-all duration-300">
                        <ul className="space-y-2.5">
                          {selectedScenario.whyThisRoute.map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-teal-400 dark:text-teal-500 mr-2 mt-0.5 text-sm">•</span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
