'use client';

import { useState, useMemo } from 'react';
import { Scenario } from '../data/types';

interface CostTimeSimulatorProps {
  scenario: Scenario;
  label?: string;
  color?: 'teal' | 'purple';
}

export default function CostTimeSimulator({ scenario, label, color = 'teal' }: CostTimeSimulatorProps) {
  const [amount, setAmount] = useState(50);
  const [monthlyVolume, setMonthlyVolume] = useState(200);

  const colorClasses = {
    teal: {
      border: 'border-teal-200 dark:border-teal-800',
      bg: 'bg-teal-50/50 dark:bg-teal-950/20',
      accent: 'text-teal-600 dark:text-teal-400',
      slider: 'accent-teal-500',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      accent: 'text-purple-600 dark:text-purple-400',
      slider: 'accent-purple-500',
    },
  };

  const classes = colorClasses[color];

  const economics = scenario.economics;
  if (!economics) {
    return null;
  }

  // Derive international status from scenario data
  const isInternational = !!economics.settlement.internationalDays || 
                          scenario.transactionType === 'International' ||
                          (economics.feeModel.type === 'flat_with_international');

  const feePerTransaction = useMemo(() => {
    if (!economics.feeModel) return 0;

    const { feeModel } = economics;
    let fee = 0;

    if (feeModel.type === 'percent_plus_fixed') {
      fee = amount * (feeModel.percent || 0) + (feeModel.fixed || 0);
    } else if (feeModel.type === 'percent_plus_fixed_with_cap') {
      const calculatedFee = amount * (feeModel.percent || 0) + (feeModel.fixed || 0);
      fee = feeModel.cap !== undefined ? Math.min(calculatedFee, feeModel.cap) : calculatedFee;
    } else if (feeModel.type === 'flat') {
      fee = feeModel.flat || 0;
    } else if (feeModel.type === 'flat_with_international') {
      fee = isInternational ? (feeModel.flatInternational || 0) : (feeModel.flatDomestic || 0);
    } else if (feeModel.type === 'wire') {
      fee = (feeModel.flat || 0);
      if (isInternational && feeModel.internationalMultiplier) {
        fee *= feeModel.internationalMultiplier;
      }
    } else if (feeModel.type === 'free') {
      fee = 0;
    }

    return Math.max(0, fee);
  }, [amount, economics.feeModel, isInternational]);

  const monthlyFees = useMemo(() => {
    return feePerTransaction * monthlyVolume;
  }, [feePerTransaction, monthlyVolume]);

  const settlementTime = useMemo(() => {
    // Use settlementTimingLabel if available, otherwise derive from domestic/international
    if (economics.settlement.settlementTimingLabel) {
      return economics.settlement.settlementTimingLabel;
    }
    if (isInternational && economics.settlement.internationalDays) {
      return economics.settlement.internationalDays;
    }
    return economics.settlement.domesticDays;
  }, [isInternational, economics.settlement]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={`rounded-2xl border ${classes.border} ${classes.bg} p-6 shadow-sm`}>
      {label && (
        <div className={`text-xs font-medium ${classes.accent} mb-4`}>
          {label}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Cost & Time Simulator
        </h3>
        {/* Transaction Type Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          isInternational
            ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
            : 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300'
        }`}>
          {isInternational ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              International transaction
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Domestic transaction
            </>
          )}
        </div>
      </div>

      {/* Amount Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Transaction Amount
          </label>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {formatCurrency(amount)}
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="5000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className={`w-full h-2 rounded-lg ${classes.slider} cursor-pointer transition-all`}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>$5</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Monthly Volume Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Monthly Volume
          </label>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            {monthlyVolume.toLocaleString()} transactions
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="2000"
          value={monthlyVolume}
          onChange={(e) => setMonthlyVolume(Number(e.target.value))}
          className={`w-full h-2 rounded-lg ${classes.slider} cursor-pointer transition-all`}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1</span>
          <span>2,000</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Fee per Transaction
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 transition-all duration-200">
            {formatCurrency(feePerTransaction)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Monthly Fees
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 transition-all duration-200">
            {formatCurrency(monthlyFees)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Settlement Time
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {settlementTime}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        Educational estimates. Real fees vary by provider and contract.
      </p>
    </div>
  );
}

