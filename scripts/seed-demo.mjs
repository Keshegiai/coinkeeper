#!/usr/bin/env node
/**
 * Adds (or resets) a demo account with ~4 months of realistic data.
 *   npm run seed            → writes into db.json
 *   npm run seed -- other.json
 * Login: demo@coinkeeper.app / Demo1234
 */
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2] ?? 'db.json';
const db = JSON.parse(readFileSync(file, 'utf8'));
const USER_ID = 'demo';

db.users = (db.users ?? []).filter((u) => u.id !== USER_ID);
db.categories = (db.categories ?? []).filter((c) => c.userId !== USER_ID);
db.transactions = (db.transactions ?? []).filter((t) => t.userId !== USER_ID);
db.goals = (db.goals ?? []).filter((g) => g.userId !== USER_ID);

db.users.push({ id: USER_ID, name: 'Demo', email: 'demo@coinkeeper.app', password: 'Demo1234' });

const cats = [
  ['food', 'Продукты', 'cart', '#2E9E5B', 120000],
  ['cafe', 'Кафе', 'coffee', '#F26B1D', 45000],
  ['bus', 'Транспорт', 'bus', '#1C7ED6', 20000],
  ['home', 'Аренда', 'home', '#5C5C5C', null],
  ['net', 'Связь', 'wifi', '#6741D9', null],
  ['fun', 'Развлечения', 'film', '#C2255C', 30000],
  ['health', 'Здоровье', 'health', '#D71921', null],
  ['salary', 'Зарплата', 'salary', '#111111', null],
  ['side', 'Фриланс', 'work', '#A3A3A3', null],
].map(([id, name, icon, color, budget]) => ({ id: `demo-${id}`, userId: USER_ID, name, icon, color, budget }));
db.categories.push(...cats);

let seed = 42;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
let n = 0;
const add = (date, type, cat, amount, comment = '') =>
  db.transactions.push({
    id: `demo-${++n}`,
    userId: USER_ID,
    type,
    amount: Math.round(amount),
    categoryId: `demo-${cat}`,
    date: iso(date),
    comment,
    createdAt: date.getTime() + n,
  });

const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
  const day = new Date(d);
  const dom = day.getDate();
  const dow = day.getDay();
  if (dom === 5) add(day, 'income', 'salary', 650000, 'Зарплата');
  if (dom === 20 && rnd() > 0.3) add(day, 'income', 'side', 80000 + rnd() * 120000, pick(['Лендинг', 'Ревью кода', 'Консультация']));
  if (dom === 1) add(day, 'expense', 'home', 220000, 'Аренда квартиры');
  if (dom === 10) add(day, 'expense', 'net', 8990, pick(['Мобильная связь', 'Интернет']));
  if (rnd() > 0.45) add(day, 'expense', 'food', 3000 + rnd() * 14000, pick(['', 'Магазин у дома', 'Рынок', 'Супермаркет']));
  if (rnd() > 0.55) add(day, 'expense', 'cafe', 1500 + rnd() * 5000, pick(['Кофе', 'Обед', 'Ужин с друзьями', '']));
  if (dow >= 1 && dow <= 5 && rnd() > 0.35) add(day, 'expense', 'bus', 300 + rnd() * 2500, pick(['Такси', 'Автобус', '']));
  if ((dow === 5 || dow === 6) && rnd() > 0.5) add(day, 'expense', 'fun', 4000 + rnd() * 12000, pick(['Кино', 'Концерт', 'Боулинг']));
  if (rnd() > 0.95) add(day, 'expense', 'health', 5000 + rnd() * 30000, pick(['Аптека', 'Стоматолог']));
}

const inMonths = (m) => iso(new Date(today.getFullYear(), today.getMonth() + m, 15));
db.goals.push(
  { id: 'demo-g1', userId: USER_ID, name: 'Подушка безопасности', target: 1500000, saved: 620000, deadline: inMonths(10), icon: 'savings', color: '#D71921', createdAt: 1 },
  { id: 'demo-g2', userId: USER_ID, name: 'Отпуск в Турции', target: 650000, saved: 410000, deadline: inMonths(4), icon: 'plane', color: '#1C7ED6', createdAt: 2 },
  { id: 'demo-g3', userId: USER_ID, name: 'Новый ноутбук', target: 480000, saved: 480000, deadline: null, icon: 'phone', color: '#111111', createdAt: 3 },
);

writeFileSync(file, JSON.stringify(db, null, 2) + '\n');
console.log(`Seeded ${n} demo transactions into ${file}. Login: demo@coinkeeper.app / Demo1234`);
