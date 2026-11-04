import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { AppProviders, createQueryClient } from './providers';
import { today } from '@/lib/date';

const db = {
  users: [{ id: 'u1', name: 'Aidyn', email: 'a@b.co', password: 'secret123' }],
  categories: [{ id: 'c1', userId: 'u1', name: 'Продукты', icon: 'LuShapes', color: '#289013' }],
  transactions: [
    { id: 't1', userId: 'u1', type: 'income', amount: 1500, categoryId: 'c1', date: today(), comment: '', createdAt: 1 },
    // legacy shape with embedded category
    { id: 't2', userId: 'u1', type: 'expense', amount: 250, category: { id: 'c1' }, date: today(), comment: 'молоко', createdAt: 2 },
  ],
};

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), 'http://localhost');
    const [, , resource] = url.pathname.split('/'); // /api/<resource>
    let rows = (db as Record<string, Array<Record<string, unknown>>>)[resource ?? ''] ?? [];
    const where = JSON.parse(url.searchParams.get('_where') ?? '{}') as Record<string, { eq: unknown }>;
    for (const [k, { eq }] of Object.entries(where)) rows = rows.filter((r) => r[k] === eq);
    return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', mockFetch());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('redirects to login, signs in, and shows the dashboard', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppProviders client={createQueryClient()}>
          <App />
        </AppProviders>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Пароль'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Войти' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');

    await user.clear(screen.getByLabelText('Пароль'));
    await user.type(screen.getByLabelText('Пароль'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('heading', { name: 'Обзор' })).toBeInTheDocument();
    // Balance = 1500 - 250 across both the new and legacy record shapes.
    await waitFor(() => expect(screen.getAllByText('1 250').length).toBeGreaterThan(0));
    expect(screen.getByText('молоко')).toBeInTheDocument();
  });
});
