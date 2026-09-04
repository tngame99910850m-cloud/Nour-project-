"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const PALETTE = ["#b4785f", "#c4a05c", "#8a5844", "#cda08a", "#6b7280", "#9ca3af"];

export function SalesAreaChart({ data }: { data: { date: string; sales: number; orders: number }[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b4785f" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#b4785f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={50} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="sales" stroke="#b4785f" strokeWidth={2} fill="url(#sales)" name="Sales" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersBarChart({ data }: { data: { date: string; orders: number }[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="orders" fill="#c4a05c" radius={[6, 6, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BestSellersBar({ data }: { data: { name: string; quantity: number }[] }) {
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" tick={{ fontSize: 12, fill: "#78716c" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#78716c" }} width={120} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="quantity" fill="#8a5844" radius={[0, 6, 6, 0]} name="Units sold" />
      </BarChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #00000010",
  fontSize: 13,
  boxShadow: "0 4px 20px -8px rgba(0,0,0,0.2)",
};

function EmptyChart() {
  return <div className="flex h-[280px] items-center justify-center text-sm text-muted">No data for this period</div>;
}

export function ChartLegend({ items }: { items: { name: string; value: string }[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((it, i) => (
        <li key={it.name} className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            {it.name}
          </span>
          <span className="font-medium">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}
