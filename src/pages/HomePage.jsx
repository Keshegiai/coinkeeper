import React from 'react';
import './HomePage.css';
// import SummaryCard from '../components/SummaryCard'; // Закомментировано, т.к. пока не создавали отдельно
// import CashFlowSection from '../components/CashFlowSection';
// import LastTransactionsSection from '../components/LastTransactionsSection';
// import WalletSection from '../components/WalletSection';
// import RecentTransactionsList from '../components/RecentTransactionsList';

// Иконки для карточек и других элементов
import { FaWallet } from 'react-icons/fa';
// Заменяем проблемные иконки:
import { LuPiggyBank, LuTrendingUp } from 'react-icons/lu'; // LuTrendingUp вместо LuArrowUpRightFromCircle
import { FiMoreHorizontal } from 'react-icons/fi';      // FiMoreHorizontal вместо LuMoreHorizontal


const HomePage = () => {
    const summaryData = [
        { title: 'Cash balance', amount: '$3240.21', icon: <FaWallet />, iconBg: '#1F2937', iconColor: '#FFFFFF' },
        // Используем LuTrendingUp для "Total spent"
        { title: 'Total spent', amount: '$250.80', icon: <LuTrendingUp />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
        { title: 'Savings', amount: '$810.32', icon: <LuPiggyBank />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
    ];

    return (
        <div className="dashboard-grid"> {/* Основная сетка страницы */}
            {/* Левая (основная) колонка */}
            <div className="main-column">
                <h1 className="page-main-title">Your dashboard</h1>

                <section className="summary-cards-container">
                    {summaryData.map(card => (
                        <div className="summary-card" key={card.title}>
                            <div className="summary-card-icon" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                                {React.cloneElement(card.icon, { size: 20 })}
                            </div>
                            <div className="summary-card-info">
                                <span className="summary-card-title">{card.title}</span>
                                <span className="summary-card-amount">{card.amount}</span>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="dashboard-section cash-flow-section">
                    <div className="section-header">
                        <h2 className="section-title">Your cash flow</h2>
                        <div className="section-controls">
                            <span className="cash-flow-legend income">Income</span>
                            <span className="cash-flow-legend expenses">Expenses</span>
                            <select className="time-filter-dropdown">
                                <option>Last week</option>
                                <option>Last month</option>
                            </select>
                        </div>
                    </div>
                    <div className="chart-placeholder">Cash Flow Chart Placeholder</div>
                </section>

                <section className="dashboard-section last-transactions-section">
                    <div className="section-header">
                        <h2 className="section-title">Last Transactions</h2>
                        <a href="#" className="section-link">Check All &gt;</a>
                    </div>
                    <div className="transactions-list-placeholder">Last Transactions List Placeholder</div>
                </section>
            </div>

            {/* Правая колонка */}
            <aside className="right-column">
                <section className="dashboard-section wallet-section">
                    <div className="section-header">
                        <h2 className="section-title">Wallet</h2>
                        <button className="header-icon-button" aria-label="Wallet options">
                            {/* Используем FiMoreHorizontal для опций кошелька */}
                            <FiMoreHorizontal size={20}/>
                        </button>
                    </div>
                    <div className="wallet-card-placeholder">Wallet Card Placeholder</div>
                </section>

                <section className="dashboard-section recent-transactions-alt-section">
                    <div className="section-header">
                        <h2 className="section-title">Recent transactions</h2>
                        <a href="#" className="section-link">Check All &gt;</a>
                    </div>
                    <div className="recent-transactions-list-placeholder">Recent Transactions List Placeholder</div>
                </section>
            </aside>
        </div>
    );
};

export default HomePage;