"use client";

import { useMemo, useState } from "react";
import { Calculator, Coins, Fuel, TrendingUp } from "lucide-react";
import { formatKes } from "@/lib/format";

type Props = {
  priceKes: number;
  engineCc: number | null;
  brand: string;
  model: string;
};

export function FuelCalculator({ priceKes, engineCc, brand, model }: Props) {
  // Auto-calibrate default km/L based on engine size
  const defaultEfficiency = useMemo(() => {
    if (!engineCc) return 45;
    if (engineCc <= 125) return 50;
    if (engineCc <= 150) return 42;
    if (engineCc <= 200) return 36;
    return 30;
  }, [engineCc]);

  const [dailyKm, setDailyKm] = useState(50);
  const [fuelPriceKes, setFuelPriceKes] = useState(185);
  const [efficiencyKmL, setEfficiencyKmL] = useState(defaultEfficiency);
  const [dailyGrossKes, setDailyGrossKes] = useState(1200);

  // Computed calculations (26 working days per month standard in Kenya)
  const calculation = useMemo(() => {
    const dailyLitres = dailyKm / Math.max(1, efficiencyKmL);
    const dailyFuelCost = Math.round(dailyLitres * fuelPriceKes);
    const monthlyFuelCost = dailyFuelCost * 26;

    const dailyNet = Math.max(0, dailyGrossKes - dailyFuelCost);
    const monthlyNet = dailyNet * 26;

    const payoffDays = dailyNet > 0 ? Math.ceil(priceKes / dailyNet) : 0;
    const payoffMonths = (payoffDays / 26).toFixed(1);

    return {
      dailyFuelCost,
      monthlyFuelCost,
      dailyNet,
      monthlyNet,
      payoffDays,
      payoffMonths,
    };
  }, [dailyKm, fuelPriceKes, efficiencyKmL, dailyGrossKes, priceKes]);

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-xl bg-accent-500/15 text-accent-700">
          <Calculator className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-ink-900">
            Fuel & Payback Estimator
          </h3>
          <p className="text-xs text-mist-500">
            Estimate daily fuel costs and earnings payoff for the {brand} {model}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Sliders & Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-ink-800">
              <label htmlFor="calc-daily-km">Daily riding distance</label>
              <span className="font-bold text-accent-700">{dailyKm} km / day</span>
            </div>
            <input
              id="calc-daily-km"
              type="range"
              min={10}
              max={150}
              step={5}
              value={dailyKm}
              onChange={(e) => setDailyKm(Number(e.target.value))}
              className="mt-1.5 w-full accent-accent-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-mist-400">
              <span>10 km (Quick commute)</span>
              <span>150 km (Active Boda)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-ink-800">
              <label htmlFor="calc-efficiency">Fuel economy</label>
              <span className="font-bold text-accent-700">{efficiencyKmL} km / litre</span>
            </div>
            <input
              id="calc-efficiency"
              type="range"
              min={25}
              max={60}
              step={1}
              value={efficiencyKmL}
              onChange={(e) => setEfficiencyKmL(Number(e.target.value))}
              className="mt-1.5 w-full accent-accent-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-mist-400">
              <span>25 km/L</span>
              <span>60 km/L (Ultra-efficient)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="calc-fuel-price" className="field-label text-xs">
                Petrol price (KSh/L)
              </label>
              <input
                id="calc-fuel-price"
                type="number"
                value={fuelPriceKes}
                onChange={(e) => setFuelPriceKes(Number(e.target.value))}
                className="w-full rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-semibold text-ink-900 focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="calc-daily-gross" className="field-label text-xs">
                Daily earnings / savings
              </label>
              <input
                id="calc-daily-gross"
                type="number"
                value={dailyGrossKes}
                onChange={(e) => setDailyGrossKes(Number(e.target.value))}
                className="w-full rounded-lg border border-mist-300 px-3 py-1.5 text-xs font-semibold text-ink-900 focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Calculation Cards */}
        <div className="grid grid-cols-2 gap-3 self-center rounded-xl bg-mist-50 p-4">
          <div className="rounded-lg bg-white p-3 shadow-xs">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-mist-500">
              <Fuel className="size-3.5 text-accent-600" />
              Daily Fuel
            </span>
            <p className="mt-1 text-base font-extrabold text-ink-900 sm:text-lg">
              {formatKes(calculation.dailyFuelCost)}
            </p>
            <span className="text-[10px] text-mist-400">
              ~{formatKes(calculation.monthlyFuelCost)} / mo
            </span>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-xs">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-mist-500">
              <Coins className="size-3.5 text-emerald-600" />
              Net Income / Mo
            </span>
            <p className="mt-1 text-base font-extrabold text-emerald-700 sm:text-lg">
              {formatKes(calculation.monthlyNet)}
            </p>
            <span className="text-[10px] text-mist-400">
              {formatKes(calculation.dailyNet)} / day
            </span>
          </div>

          <div className="col-span-2 rounded-lg border border-accent-100 bg-accent-50/70 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs font-bold text-accent-900">
                <TrendingUp className="size-3.5 text-accent-600" />
                Estimated Payoff Time
              </span>
              <span className="text-sm font-extrabold text-accent-900">
                ~{calculation.payoffMonths} months
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-accent-800">
              At this pace, this {formatKes(priceKes)} motorcycle pays for itself in about{" "}
              <strong>{calculation.payoffDays} working days</strong>.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-mist-400">
        *Estimates are illustrative based on standard 26-day working months in Nairobi. Actual fuel
        economy depends on riding style, load, and traffic on Juja Road / Eastleigh corridors.
      </p>
    </div>
  );
}
