import { useState, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePie, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, CreditCard, Receipt, BarChart3, Bot, Settings, Crown,
  TrendingUp, TrendingDown, ArrowDownLeft, Search, Bell, Menu, X,
  Upload, Send, Sparkles, Target, Check, Plus, ChevronRight,
  Wallet, LogOut, Eye, EyeOff, Filter, Zap, Music, Flame, ShoppingBag,
  Car, Utensils, Laptop, Dumbbell, Home, Plane, Coffee, Star,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "transactions"
  | "receipts"
  | "budget"
  | "analytics"
  | "assistant"
  | "settings"
  | "subscription";

// ─── DATA ────────────────────────────────────────────────────────────────────

const cashflowData = [
  { month: "Feb", income: 8200, expenses: 4950 },
  { month: "Mar", income: 8200, expenses: 6100 },
  { month: "Apr", income: 9400, expenses: 5380 },
  { month: "May", income: 8200, expenses: 5900 },
  { month: "Jun", income: 8750, expenses: 4680 },
  { month: "Jul", income: 8200, expenses: 3842 },
];

const spendingCategories = [
  { name: "Housing", value: 1800, color: "#4A8EF5" },
  { name: "Food & Dining", value: 680, color: "#F59E0B" },
  { name: "Shopping", value: 420, color: "#A78BFA" },
  { name: "Transport", value: 320, color: "#06B6D4" },
  { name: "Entertainment", value: 240, color: "#EC4899" },
  { name: "Health", value: 180, color: "#00D47E" },
  { name: "Other", value: 202, color: "#6A7F97" },
];

const monthlyComparison = [
  { month: "Mar", spent: 6100, budget: 5500 },
  { month: "Apr", spent: 5380, budget: 5500 },
  { month: "May", spent: 5900, budget: 5500 },
  { month: "Jun", spent: 4680, budget: 5500 },
  { month: "Jul", spent: 3842, budget: 5500 },
];

const transactions = [
  { id: 1, merchant: "Whole Foods Market", category: "Groceries", icon: ShoppingBag, iconBg: "#7C3AED", amount: -89.43, date: "Today, 2:34 PM" },
  { id: 2, merchant: "Spotify Premium", category: "Entertainment", icon: Music, iconBg: "#1DB954", amount: -9.99, date: "Today, 12:00 PM" },
  { id: 3, merchant: "Salary Deposit", category: "Income", icon: ArrowDownLeft, iconBg: "#00D47E", amount: 8200.0, date: "Yesterday" },
  { id: 4, merchant: "Netflix", category: "Entertainment", icon: Flame, iconBg: "#E50914", amount: -15.49, date: "Yesterday" },
  { id: 5, merchant: "Uber", category: "Transport", icon: Car, iconBg: "#06B6D4", amount: -24.5, date: "Jul 18" },
  { id: 6, merchant: "Apple Store", category: "Tech", icon: Laptop, iconBg: "#6A7F97", amount: -249.0, date: "Jul 17" },
  { id: 7, merchant: "Chipotle", category: "Food & Dining", icon: Utensils, iconBg: "#F59E0B", amount: -13.75, date: "Jul 17" },
  { id: 8, merchant: "Planet Fitness", category: "Health", icon: Dumbbell, iconBg: "#A855F7", amount: -24.99, date: "Jul 16" },
  { id: 9, merchant: "Delta Airlines", category: "Travel", icon: Plane, iconBg: "#3B82F6", amount: -387.0, date: "Jul 15" },
  { id: 10, merchant: "Starbucks", category: "Coffee", icon: Coffee, iconBg: "#92400E", amount: -6.85, date: "Jul 14" },
];

const budgets = [
  { category: "Housing", spent: 1800, limit: 1800, icon: Home, color: "#4A8EF5" },
  { category: "Food & Dining", spent: 680, limit: 800, icon: Utensils, color: "#F59E0B" },
  { category: "Shopping", spent: 420, limit: 600, icon: ShoppingBag, color: "#A78BFA" },
  { category: "Transport", spent: 320, limit: 400, icon: Car, color: "#06B6D4" },
  { category: "Entertainment", spent: 240, limit: 200, icon: Flame, color: "#EC4899" },
  { category: "Health & Fitness", spent: 180, limit: 250, icon: Dumbbell, color: "#00D47E" },
];

const aiMessages = [
  {
    role: "assistant",
    text: "Hi Alex! I've analyzed your July spending. You're on track to save $4,358 this month — 20% more than last month. You're ahead on three of your six budgets. Want me to show where you're saving most?",
  },
  { role: "user", text: "Yes, show me where I'm saving." },
  {
    role: "assistant",
    text: "Your biggest savings are in dining (down 32% from June) and entertainment (down 18%). At this rate you'll hit your emergency fund goal 6 weeks ahead of schedule. 🎯",
  },
  { role: "user", text: "What about my subscriptions?" },
  {
    role: "assistant",
    text: "You have 8 subscriptions totaling $87/month. Based on usage, you haven't opened Hulu in 47 days — canceling it would save $162/year. Want me to flag it as a candidate to cut?",
  },
];

// ─── REUSABLE COMPONENTS ─────────────────────────────────────────────────────

function StatCard({
  label, value, change, positive, mono = false,
}: {
  label: string; value: string; change?: string; positive?: boolean; mono?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-white/10 transition-colors">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] font-semibold">{label}</p>
      <p className={`text-2xl font-semibold mt-2 text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </div>
      )}
    </div>
  );
}

function BudgetBar({ category, spent, limit, icon: Icon, color }: (typeof budgets)[0]) {
  const pct = Math.min((spent / limit) * 100, 100);
  const over = spent > limit;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-foreground">{category}</span>
          <span className={`text-xs font-mono ${over ? "text-rose-400" : "text-muted-foreground"}`}>
            ${spent.toLocaleString()}
            <span className="opacity-40"> / ${limit.toLocaleString()}</span>
          </span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: over ? "#F87171" : color }}
          />
        </div>
      </div>
      <span className={`text-[11px] font-mono w-8 text-right ${over ? "text-rose-400" : "text-muted-foreground"}`}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function TxRow({ tx, compact = false }: { tx: (typeof transactions)[0]; compact?: boolean }) {
  const pos = tx.amount > 0;
  return (
    <div className={`flex items-center gap-3 hover:bg-white/[0.03] rounded-xl transition-colors cursor-pointer ${compact ? "py-2 px-2 -mx-2" : "py-3 px-3 -mx-3"}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tx.iconBg + "28" }}>
        <tx.icon className="w-4 h-4" style={{ color: tx.iconBg }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{tx.merchant}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{compact ? tx.category : tx.date}</p>
      </div>
      {!compact && (
        <span className="text-xs text-muted-foreground/50 hidden sm:block flex-shrink-0">{tx.date}</span>
      )}
      <span className={`text-sm font-mono font-semibold flex-shrink-0 ${pos ? "text-emerald-400" : "text-foreground/90"}`}>
        {pos ? "+" : "−"}${Math.abs(tx.amount).toFixed(2)}
      </span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1828] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-mono font-medium" style={{ color: p.color ?? p.fill }}>
          {p.name}: ${Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function DashboardScreen() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div className="space-y-6">
      {/* Balance Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-7"
        style={{ background: "linear-gradient(135deg, #0C2540 0%, #071830 50%, #071F12 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-[0.12]" style={{ backgroundColor: "#00D47E", transform: "translate(35%,-35%)" }} />
        <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full blur-3xl opacity-[0.09]" style={{ backgroundColor: "#4A8EF5", transform: "translateY(40%)" }} />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.18em] font-semibold">Total Balance</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-5xl font-mono font-bold text-white leading-none tracking-tight">
                  {balanceVisible ? "$47,284" : "••••••"}
                  {balanceVisible && <span className="text-3xl text-white/50">.63</span>}
                </p>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="mb-0.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="flex items-center gap-1.5 bg-emerald-400/15 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/20">
                  <TrendingUp className="w-3 h-3" />
                  +$1,284 this month
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Jul 2026</p>
              <p className="text-white/80 font-semibold mt-1 text-sm">Alex Chen</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-400/20">
                <Star className="w-2.5 h-2.5" /> Pro
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-white/[0.08]">
            {[
              { label: "Income", value: "$8,200", color: "#00D47E" },
              { label: "Spending", value: "$3,842", color: "#4A8EF5" },
              { label: "Savings Rate", value: "53.1%", color: "#A78BFA" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-white/35 uppercase tracking-[0.14em] font-semibold">{item.label}</p>
                <p className="text-lg font-mono font-bold mt-1" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net Worth" value="$147,284" change="+12.4% YTD" positive mono />
        <StatCard label="Credit Score" value="784" change="+12 pts" positive />
        <StatCard label="Monthly Budget" value="$5,500" change="30% remaining" positive />
        <StatCard label="Investments" value="$62,400" change="+$890 today" positive mono />
      </div>

      {/* Cashflow + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Cash Flow</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Income vs Expenses · 6 months</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={cashflowData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D47E" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#00D47E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A8EF5" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#4A8EF5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6A7F97", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6A7F97", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#00D47E" strokeWidth={1.5} fill="url(#gIncome)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#4A8EF5" strokeWidth={1.5} fill="url(#gExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent</h3>
            <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-0.5">
            {transactions.slice(0, 5).map((tx) => (
              <TxRow key={tx.id} tx={tx} compact />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: TrendingUp, color: "#00D47E", bg: "#00D47E18", text: "You could save $162/year by canceling Hulu — you haven't opened it in 47 days." },
              { icon: Target, color: "#F59E0B", bg: "#F59E0B18", text: "Entertainment budget exceeded by $40. Consider limiting streaming services next month." },
              { icon: Sparkles, color: "#A78BFA", bg: "#A78BFA18", text: "Predicted next month: $4,100 in spending based on 6-month seasonal patterns." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ backgroundColor: item.bg }}>
                <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: item.color }} />
                <p className="text-sm text-foreground/80 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Budget Progress</h3>
            <span className="text-[11px] text-muted-foreground font-medium">Jul 2026</span>
          </div>
          <div className="divide-y divide-border/40">
            {budgets.slice(0, 5).map((b) => (
              <BudgetBar key={b.category} {...b} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsScreen() {
  const [search, setSearch] = useState("");
  const filtered = transactions.filter(
    (tx) =>
      tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400/40 transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-white/12 transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button className="flex items-center gap-2 bg-emerald-400/12 border border-emerald-400/20 rounded-xl px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-400/18 transition-colors font-semibold">
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">{filtered.length} transactions</p>
          <p className="text-xs text-muted-foreground">Jul 2026</p>
        </div>
        <div className="space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">No transactions found</p>
          ) : (
            filtered.map((tx) => <TxRow key={tx.id} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptsScreen() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState([
    { name: "Whole Foods Market", amount: "$89.43", status: "Categorized as Groceries" },
    { name: "Apple Store", amount: "$249.00", status: "Categorized as Tech" },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 max-w-2xl">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); setUploaded((p) => [...p, { name: "New Receipt", amount: "—", status: "Processing…" }]); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${dragging ? "border-emerald-400/50 bg-emerald-400/5" : "border-border hover:border-white/14 hover:bg-white/[0.02]"}`}
      >
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={() => setUploaded((p) => [...p, { name: "Uploaded Receipt", amount: "—", status: "Processing…" }])} />
        <div className="w-14 h-14 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-base font-semibold text-foreground">Drop your receipt here</p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          AI extracts merchant, amount, date, and categorizes automatically.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-3">JPG · PNG · PDF up to 10 MB</p>
      </div>

      {uploaded.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Processed Receipts</h3>
          <div className="space-y-3">
            {uploaded.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl">
                <div className="w-8 h-8 bg-emerald-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.status}</p>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetScreen() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Budget" value="$5,500" />
        <StatCard label="Spent" value="$3,842" change="70% of budget used" positive={false} mono />
        <StatCard label="Remaining" value="$1,658" change="30% left" positive mono />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Category Budgets · Jul 2026</h3>
          <button className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
        <div className="divide-y divide-border/40">
          {budgets.map((b) => (
            <BudgetBar key={b.category} {...b} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const [period, setPeriod] = useState("6M");
  const RADIAN = Math.PI / 180;

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    return (
      <text
        x={cx + r * Math.cos(-midAngle * RADIAN)}
        y={cy + r * Math.sin(-midAngle * RADIAN)}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        {["1M", "3M", "6M", "1Y"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? "bg-emerald-400/12 text-emerald-400 border border-emerald-400/20" : "text-muted-foreground hover:text-foreground"}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={210}>
            <RePie>
              <Pie data={spendingCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="value" labelLine={false} label={renderPieLabel}>
                {spendingCategories.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </RePie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
            {spendingCategories.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name}</span>
                <span className="text-foreground font-mono ml-auto">${s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5">Spending vs Budget</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={monthlyComparison} margin={{ top: 0, right: 0, left: -22, bottom: 0 }} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6A7F97", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6A7F97", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="budget" name="Budget" fill="#4A8EF528" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#4A8EF5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-5">Top Merchants</h3>
        <div className="space-y-4">
          {[
            { name: "Whole Foods Market", total: 312.5, count: 8, icon: ShoppingBag, color: "#7C3AED" },
            { name: "Starbucks", total: 89.4, count: 13, icon: Coffee, color: "#92400E" },
            { name: "Uber", total: 156.8, count: 12, icon: Car, color: "#06B6D4" },
            { name: "Netflix", total: 61.96, count: 4, icon: Flame, color: "#E50914" },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground/50 w-4 font-mono text-center">{i + 1}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color + "28" }}>
                <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.count} transactions</p>
              </div>
              <p className="text-sm font-mono font-semibold text-foreground">${m.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssistantScreen() {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", text: input }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I'm analyzing your financial data to give you a personalized recommendation. Based on your spending patterns, I can see several optimization opportunities that could free up $200–$400/month." },
      ]);
      setThinking(false);
    }, 1600);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)", maxHeight: 740 }}>
      <div className="bg-card border border-border rounded-2xl flex flex-col flex-1 overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Ledger AI Assistant</p>
            <p className="text-xs text-emerald-400 font-medium">Online · Analyzing your finances</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-400/14 text-foreground rounded-tr-sm border border-emerald-400/15"
                    : "bg-muted text-foreground/85 rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/15 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="bg-muted px-4 py-3.5 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${j * 0.16}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-border/50 flex gap-2 flex-wrap flex-shrink-0">
          {["Analyze my spending", "How to save more?", "Investment advice", "Cut subscriptions"].map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs bg-muted hover:bg-white/[0.06] text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors border border-border/60"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your finances..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400/40 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-10 h-10 bg-emerald-400 disabled:opacity-40 text-black rounded-xl flex items-center justify-center hover:bg-emerald-300 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const [notif, setNotif] = useState({ spending: true, insights: true, weekly: false });

  return (
    <div className="space-y-5 max-w-xl">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Alex Chen</p>
            <p className="text-sm text-muted-foreground">alex@example.com</p>
          </div>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors px-3 py-1.5 rounded-lg border border-emerald-400/20 hover:bg-emerald-400/8">
            Edit
          </button>
        </div>
        <div className="space-y-0">
          {[
            { label: "Full Name", value: "Alex Chen" },
            { label: "Email", value: "alex@example.com" },
            { label: "Currency", value: "USD ($)" },
            { label: "Timezone", value: "America/New_York" },
          ].map((field) => (
            <div key={field.label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span className="text-sm text-foreground font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Notifications</h3>
        <div className="space-y-5">
          {[
            { key: "spending" as const, label: "Spending Alerts", desc: "Notify when a budget category is exceeded" },
            { key: "insights" as const, label: "AI Insights", desc: "Weekly personalized financial insights" },
            { key: "weekly" as const, label: "Weekly Report", desc: "Summary of your weekly finances every Monday" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotif((n) => ({ ...n, [item.key]: !n[item.key] }))}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${notif[item.key] ? "bg-emerald-400" : "bg-muted"}`}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                  style={{ left: notif[item.key] ? "22px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Connected Accounts</h3>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="space-y-3">
          {[
            { bank: "Chase Bank", type: "Checking ••4521", initial: "C", bg: "#003087", connected: true },
            { bank: "Apple Card", type: "Credit ••8832", initial: "A", bg: "#1C1C1E", connected: true },
            { bank: "Fidelity", type: "Investment ••2210", initial: "F", bg: "#4F8A10", connected: false },
          ].map((acc) => (
            <div key={acc.bank} className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: acc.bg }}>
                {acc.initial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{acc.bank}</p>
                <p className="text-xs text-muted-foreground">{acc.type}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${acc.connected ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20" : "bg-muted text-muted-foreground border border-border"}`}>
                {acc.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionScreen() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      name: "Basic",
      price: { monthly: 0, annual: 0 },
      desc: "For getting started",
      color: "#6A7F97",
      features: ["Manual transaction entry", "Basic budgeting", "3 connected accounts", "30-day history"],
      cta: "Current Plan",
      highlight: false,
    },
    {
      name: "Pro",
      price: { monthly: 12, annual: 8 },
      desc: "For serious money managers",
      color: "#00D47E",
      features: ["Unlimited accounts", "AI insights & predictions", "Receipt scanning", "Unlimited history", "Priority support", "CSV export"],
      cta: "Upgrade to Pro",
      highlight: true,
    },
    {
      name: "Family",
      price: { monthly: 20, annual: 15 },
      desc: "For households",
      color: "#4A8EF5",
      features: ["Everything in Pro", "Up to 5 members", "Shared budgets", "Family dashboard", "Custom categories", "API access"],
      cta: "Upgrade to Family",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-center">
        <div className="bg-card border border-border rounded-xl p-1 flex items-center gap-1">
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize flex items-center gap-2 ${billing === b ? "bg-emerald-400/12 text-emerald-400 border border-emerald-400/18" : "text-muted-foreground hover:text-foreground"}`}
            >
              {b}
              {b === "annual" && <span className="text-[10px] bg-amber-400/15 text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-400/20">−33%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-card border rounded-2xl p-6 relative flex flex-col transition-all hover:border-white/12 ${plan.highlight ? "border-emerald-400/30" : "border-border"}`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-400 text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                Most Popular
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4" style={{ color: plan.color }} />
                <p className="text-sm font-bold text-foreground">{plan.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">{plan.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-mono font-bold text-foreground">${plan.price[billing]}</span>
                <span className="text-sm text-muted-foreground mb-0.5">/mo</span>
              </div>
              {billing === "annual" && plan.price.annual > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">Billed ${plan.price.annual * 12}/year</p>
              )}
            </div>

            <div className="mt-5 space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                  {f}
                </div>
              ))}
            </div>

            <button
              className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                plan.highlight
                  ? "bg-emerald-400 text-black hover:bg-emerald-300"
                  : "bg-muted text-foreground hover:bg-white/[0.06] border border-border"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-400/12 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">30-day money-back guarantee</p>
          <p className="text-xs text-muted-foreground mt-0.5">Not satisfied? We'll refund your first payment, no questions asked.</p>
        </div>
      </div>
    </div>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "receipts", label: "Receipts", icon: Receipt },
  { id: "budget", label: "Budget Planner", icon: Target },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "subscription", label: "Subscription", icon: Crown },
];

const SCREEN_TITLES: Record<Screen, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  receipts: "Receipt Upload",
  budget: "Budget Planner",
  analytics: "Analytics",
  assistant: "AI Assistant",
  settings: "Settings",
  subscription: "Subscription",
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (s: Screen) => {
    setScreen(s);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-[#0A1220] border-r border-border flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-4 py-4 flex items-center gap-2.5 border-b border-border flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">
            Ledger <span className="text-emerald-400">AI</span>
          </span>
          <button className="ml-auto lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  active
                    ? "bg-emerald-400/12 text-emerald-400 border border-emerald-400/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "assistant" && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Alex Chen</p>
              <p className="text-[10px] text-muted-foreground">Pro Plan</p>
            </div>
            <LogOut className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-13 border-b border-border bg-[#0A1220]/80 backdrop-blur-sm flex items-center gap-4 px-5 flex-shrink-0" style={{ minHeight: 52 }}>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{SCREEN_TITLES[screen]}</h1>
          <div className="ml-auto flex items-center gap-2.5">
            <button className="hidden sm:flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-1.5 hover:border-white/12 transition-colors">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Quick search…</span>
            </button>
            <button className="relative w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-black font-bold text-xs cursor-pointer">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {screen === "dashboard" && <DashboardScreen />}
          {screen === "transactions" && <TransactionsScreen />}
          {screen === "receipts" && <ReceiptsScreen />}
          {screen === "budget" && <BudgetScreen />}
          {screen === "analytics" && <AnalyticsScreen />}
          {screen === "assistant" && <AssistantScreen />}
          {screen === "settings" && <SettingsScreen />}
          {screen === "subscription" && <SubscriptionScreen />}
        </main>
      </div>
    </div>
  );
}
