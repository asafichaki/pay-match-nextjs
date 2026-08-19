"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  DollarSign,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Percent,
  CreditCard,
  Smartphone,
  Globe,
  Sparkles,
  BarChart3,
  PieChart,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/ui/breadcrumbs";

export default function FeeCalculatorClient() {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(50000);
  const [avgTransaction, setAvgTransaction] = useState<number>(30);
  const [inPersonPercent, setInPersonPercent] = useState<number>(80);

  const transactions = useMemo(() => {
    return Math.round(monthlyVolume / avgTransaction);
  }, [monthlyVolume, avgTransaction]);

  const inPersonVolume = useMemo(() => {
    return monthlyVolume * (inPersonPercent / 100);
  }, [monthlyVolume, inPersonPercent]);

  const onlineVolume = useMemo(() => {
    return monthlyVolume * ((100 - inPersonPercent) / 100);
  }, [monthlyVolume, inPersonPercent]);

  const inPersonTransactions = useMemo(() => {
    return Math.round(transactions * (inPersonPercent / 100));
  }, [transactions, inPersonPercent]);

  const onlineTransactions = useMemo(() => {
    return Math.round(transactions * ((100 - inPersonPercent) / 100));
  }, [transactions, inPersonPercent]);

  // Calculate fee ranges
  const feeEstimates = useMemo(() => {
    // Low estimate (interchange-plus like Helcim)
    const lowInPerson = inPersonVolume * 0.018 + inPersonTransactions * 0.08;
    const lowOnline = onlineVolume * 0.022 + onlineTransactions * 0.08;
    const lowTotal = lowInPerson + lowOnline;

    // Mid estimate (flat-rate like Square)
    const midInPerson = inPersonVolume * 0.026 + inPersonTransactions * 0.10;
    const midOnline = onlineVolume * 0.029 + onlineTransactions * 0.30;
    const midTotal = midInPerson + midOnline;

    // High estimate (premium processors)
    const highInPerson = inPersonVolume * 0.029 + inPersonTransactions * 0.15;
    const highOnline = onlineVolume * 0.035 + onlineTransactions * 0.49;
    const highTotal = highInPerson + highOnline;

    // Effective rates
    const lowRate = (lowTotal / monthlyVolume) * 100;
    const midRate = (midTotal / monthlyVolume) * 100;
    const highRate = (highTotal / monthlyVolume) * 100;

    return {
      low: { monthly: lowTotal, annual: lowTotal * 12, rate: lowRate },
      mid: { monthly: midTotal, annual: midTotal * 12, rate: midRate },
      high: { monthly: highTotal, annual: highTotal * 12, rate: highRate },
      savings: (highTotal - lowTotal) * 12
    };
  }, [inPersonVolume, onlineVolume, inPersonTransactions, onlineTransactions, monthlyVolume]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-emerald-500/15 via-emerald-500/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 rounded-full blur-3xl"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <Breadcrumbs
            items={[{ label: "Fee Calculator" }]}
            className="mb-8"
          />

          <header className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/20 via-primary/10 to-emerald-500/20 rounded-full border border-primary/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                Free Calculator Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-tight tracking-tight">
              Credit Card Processing{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                  Fee Calculator
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-emerald-500 rounded-full opacity-50"></span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enter your monthly volume, average ticket and channel mix to get a directional
              estimate of your effective rate under three common pricing models.
            </p>
          </header>

          {/* Main Calculator Grid */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-6 lg:gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <Card className="relative overflow-hidden border-0 shadow-2xl shadow-primary/10">
                {/* Card Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-emerald-500/20 rounded-2xl"></div>
                <div className="absolute inset-[1px] bg-background rounded-2xl"></div>

                <div className="relative p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/30">
                      <Calculator className="h-5 w-5 text-primary-foreground" />
                    </div>
                    Business Details
                  </h2>

                  <div className="space-y-8">
                    {/* Monthly Volume */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monthly Sales Volume
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="text-4xl font-black bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-4">
                          {formatCurrency(monthlyVolume)}
                        </div>
                        <Slider
                          value={[monthlyVolume]}
                          onValueChange={(value) => setMonthlyVolume(value[0])}
                          min={5000}
                          max={500000}
                          step={5000}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>$5K</span>
                          <span>$500K</span>
                        </div>
                      </div>
                    </div>

                    {/* Average Transaction */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Average Transaction
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="text-4xl font-black bg-gradient-to-r from-violet-500 to-primary bg-clip-text text-transparent mb-4">
                          {formatCurrency(avgTransaction)}
                        </div>
                        <Slider
                          value={[avgTransaction]}
                          onValueChange={(value) => setAvgTransaction(value[0])}
                          min={5}
                          max={200}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>$5</span>
                          <span>$200</span>
                        </div>
                      </div>
                    </div>

                    {/* In-Person Percentage */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          In-Person vs Online Sales
                        </Label>
                      </div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm text-muted-foreground">In-Person</span>
                            <span className="text-2xl font-black text-primary">{inPersonPercent}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-emerald-500">{100 - inPersonPercent}%</span>
                            <span className="text-sm text-muted-foreground">Online</span>
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          </div>
                        </div>
                        <Slider
                          value={[inPersonPercent]}
                          onValueChange={(value) => setInPersonPercent(value[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Summary Stats Card */}
              <Card className="relative overflow-hidden border-0 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted/40"></div>
                <div className="relative p-6">
                  <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Volume Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-xl">
                      <span className="text-sm text-muted-foreground">Monthly Transactions</span>
                      <span className="font-mono font-bold text-foreground text-lg">{transactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        In-Person Volume
                      </span>
                      <span className="font-mono font-bold text-primary">{formatCurrency(inPersonVolume)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Online Volume
                      </span>
                      <span className="font-mono font-bold text-emerald-500">{formatCurrency(onlineVolume)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
              {/* Main Results Card */}
              <Card className="relative overflow-hidden border-0 shadow-2xl">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]"></div>

                <div className="relative p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl">
                        <PieChart className="h-5 w-5 text-white" />
                      </div>
                      Estimated Processing Costs
                    </h2>
                    <div className="px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                      <span className="text-xs font-medium text-white/80">Based on industry rates</span>
                    </div>
                  </div>

                  {/* Cost Range Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                    {/* Low Estimate */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <TrendingDown className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Best Rate</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 truncate">
                          {formatCurrency(feeEstimates.low.monthly)}
                        </div>
                        <div className="text-xs sm:text-sm text-white/60">per month</div>
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-white/50">Rate</span>
                            <span className="font-mono font-bold text-emerald-400">{feeEstimates.low.rate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm mt-1">
                            <span className="text-white/50">Annual</span>
                            <span className="font-mono font-semibold text-white">{formatCurrency(feeEstimates.low.annual)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mid Estimate */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <Percent className="h-4 w-4 text-primary" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Typical Rate</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 truncate">
                          {formatCurrency(feeEstimates.mid.monthly)}
                        </div>
                        <div className="text-xs sm:text-sm text-white/60">per month</div>
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-white/50">Rate</span>
                            <span className="font-mono font-bold text-primary">{feeEstimates.mid.rate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm mt-1">
                            <span className="text-white/50">Annual</span>
                            <span className="font-mono font-semibold text-white">{formatCurrency(feeEstimates.mid.annual)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* High Estimate */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                      <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <TrendingUp className="h-4 w-4 text-orange-400" />
                          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">High Rate</span>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 truncate">
                          {formatCurrency(feeEstimates.high.monthly)}
                        </div>
                        <div className="text-xs sm:text-sm text-white/60">per month</div>
                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-white/50">Rate</span>
                            <span className="font-mono font-bold text-orange-400">{feeEstimates.high.rate.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm mt-1">
                            <span className="text-white/50">Annual</span>
                            <span className="font-mono font-semibold text-white">{formatCurrency(feeEstimates.high.annual)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Savings Banner */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20"></div>
                    <div className="relative p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-xl">
                          <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-white/60">Potential Annual Savings</p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400">{formatCurrency(feeEstimates.savings)}</p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-white/50 text-center sm:text-right max-w-xs">
                        by choosing an optimized pricing model
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Info Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-5 border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Interchange-Plus Pricing</h3>
                      <p className="text-sm text-muted-foreground">
                        Typically offers the lowest rates. You pay the actual interchange fee plus a small markup.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-2 border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                      <CreditCard className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">Flat-Rate Pricing</h3>
                      <p className="text-sm text-muted-foreground">
                        Simple and predictable. Same rate for every transaction regardless of card type.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Note:</strong> These are estimates based on typical industry rates.
                  Actual costs vary based on your business type, card mix (credit vs debit), processor, and negotiated rates.
                  Best rates typically require interchange-plus pricing and higher volumes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz CTA Section */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-background shadow-sm p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  Ready to Find Your Perfect<br className="hidden sm:block" />
                  Payment Processor Match?
                </h2>
                <p className="text-muted-foreground max-w-lg">
                  Take our free 2-minute assessment to discover which payment provider aligns with your business goals and helps you save on processing fees.
                </p>
              </div>

              <Link href="/quiz" className="shrink-0">
                <Button
                  size="lg"
                  className="w-full lg:w-auto px-8 h-12 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Content Section */}
      <section className="py-12 sm:py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Understanding Payment Processing
            </h2>
            <p className="text-muted-foreground">
              Key insights to help you make informed decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <Card className="p-6 border-border/50 bg-background/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">The True Cost of Processing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Payment processing fees typically range from 1.5% to 3.5% per transaction. For a business processing $100,000 monthly, the difference between the lowest and highest rates could mean $24,000 annually. Understanding interchange-plus vs. flat-rate pricing is crucial for optimization.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="p-6 border-border/50 bg-background/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Negotiating Better Rates</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    High-volume merchants often qualify for volume discounts. Processing over $50,000 monthly? You may be able to negotiate rates 0.2-0.5% lower than standard pricing. Always get quotes from multiple processors before committing.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="p-6 border-border/50 bg-background/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Card-Present vs. Card-Not-Present</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    In-person transactions (card-present) typically cost 0.3-0.5% less than online payments due to lower fraud risk. If you operate both channels, consider processors that offer competitive rates for both transaction types.
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 4 */}
            <Card className="p-6 border-border/50 bg-background/50">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-violet-500/10 rounded-lg shrink-0">
                  <BarChart3 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Hidden Fees to Watch</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Beyond transaction fees, watch for monthly minimums, PCI compliance fees, batch fees, chargeback fees, and early termination penalties. A transparent processor will clearly disclose all fees upfront - ask for a complete fee schedule before signing.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom insight */}
          <div className="mt-8 p-6 bg-background rounded-xl border border-border/50">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">The 2025 Payment Landscape</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The payment processing industry is evolving rapidly. Contactless payments now account for over 50% of in-person transactions, and buy-now-pay-later options are growing 20% year-over-year. Modern processors offer integrated solutions including POS systems, inventory management, and customer analytics - often at no additional cost. When comparing processors, consider the full value proposition, not just the per-transaction rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
