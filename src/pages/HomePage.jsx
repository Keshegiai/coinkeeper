import React from 'react';
import styles from './HomePage.module.css'; // Импорт CSS-модуля для HomePage
import CashFlowSummary from '../components/CashFlowSummary'; // CashFlowSummary использует свои модульные стили

// Иконки (убедись, что все импортированы и работают)
import { FaWallet } from 'react-icons/fa';
import { LuPiggyBank, LuTrendingUp } from 'react-icons/lu'; // Предполагаем, что эти иконки рабочие
import { FiMoreHorizontal } from 'react-icons/fi';       // Предполагаем, что эта иконка рабочая

const HomePage = () => {
    const summaryData = [
        { title: 'Cash balance', amount: '$3240.21', icon: <FaWallet />, iconBg: '#1F2937', iconColor: '#FFFFFF' },
        { title: 'Total spent', amount: '$250.80', icon: <LuTrendingUp />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
        { title: 'Savings', amount: '$810.32', icon: <LuPiggyBank />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
    ];

    return (
        <div className={styles.dashboardGrid}>
            <div className={styles.mainColumn}>
                <h1 className={styles.pageMainTitle}>Your dashboard</h1>

                <section className={styles.summaryCardsContainer}>
                    {summaryData.map(card => (
                        <div className={styles.summaryCard} key={card.title}>
                            <div className={styles.summaryCardIcon} style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                                {React.cloneElement(card.icon, { size: 20 })}
                            </div>
                            <div className={styles.summaryCardInfo}>
                                <span className={styles.summaryCardTitle}>{card.title}</span>
                                <span className={styles.summaryCardAmount}>{card.amount}</span>
                            </div>
                        </div>
                    ))}
                </section>

                <CashFlowSummary />

                <section className={styles.dashboardSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Last Transactions</h2>
                        <a href="#" className={styles.sectionLink}>Check All &gt;</a>
                    </div>
                    <div className={styles.transactionsListPlaceholder}>Last Transactions List Placeholder</div>
                </section>
            </div>

            <aside className={styles.rightColumn}>
                <section className={styles.dashboardSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Wallet</h2>
                        {/* Используем новый класс .optionsButton из HomePage.module.css */}
                        <button className={styles.optionsButton} aria-label="Wallet options">
                            <FiMoreHorizontal size={20}/>
                        </button>
                    </div>
                    <div className={styles.walletCardPlaceholder}>Wallet Card Placeholder</div>
                </section>
                {/* Секция "Recent transactions" была удалена по твоему запросу */}
            </aside>
        </div>
    );
};

export default HomePage;