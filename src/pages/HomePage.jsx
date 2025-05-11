import React, { useState, useMemo } from 'react';
import styles from './HomePage.module.css';
import CashFlowSummary from '../components/CashFlowSummary';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { FaWallet, FaPlus } from 'react-icons/fa';
import { LuPiggyBank, LuTrendingUp, LuTrash2 } from 'react-icons/lu';
import { FiMoreHorizontal, FiEdit } from 'react-icons/fi';

const HomePage = ({
                      transactions = [],
                      categories = [],
                      addTransaction,
                      deleteTransaction,
                      updateTransaction,
                      addCategory
                  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const monthlyIncome = useMemo(() => {
        if (!transactions) return 0;
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        firstDayOfCurrentMonth.setHours(0, 0, 0, 0);
        lastDayOfCurrentMonth.setHours(23, 59, 59, 999);

        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'income' && transactionDate >= firstDayOfCurrentMonth && transactionDate <= lastDayOfCurrentMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const monthlyExpenses = useMemo(() => {
        if (!transactions) return 0;
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        firstDayOfCurrentMonth.setHours(0, 0, 0, 0);
        lastDayOfCurrentMonth.setHours(23, 59, 59, 999);

        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' && transactionDate >= firstDayOfCurrentMonth && transactionDate <= lastDayOfCurrentMonth;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const monthlySavings = useMemo(() => monthlyIncome - monthlyExpenses, [monthlyIncome, monthlyExpenses]);

    const totalBalance = useMemo(() => {
        if (!transactions) return 0;
        let income = 0;
        let expenses = 0;
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expenses += t.amount;
        });
        return income - expenses;
    }, [transactions]);

    const summaryData = [
        { title: 'Cash balance', amount: `$${totalBalance.toFixed(2)}`, icon: <FaWallet />, iconStyleClass: styles.iconStyleDefault },
        { title: 'Total spent (Month)', amount: `$${monthlyExpenses.toFixed(2)}`, icon: <LuTrendingUp />, iconStyleClass: styles.iconStyleDefault },
        { title: 'Savings (Month)', amount: `$${monthlySavings.toFixed(2)}`, icon: <LuPiggyBank />, iconStyleClass: styles.iconStyleDefault },
    ];

    const cashFlowSummaryChartData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        firstDayOfCurrentMonth.setHours(0, 0, 0, 0);
        lastDayOfCurrentMonth.setHours(23, 59, 59, 999);

        const currentMonthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= firstDayOfCurrentMonth && transactionDate <= lastDayOfCurrentMonth;
        });

        const dailyData = {};
        currentMonthTransactions.forEach(t => {
            const dateKey = new Date(t.date).toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { date: dateKey, income: 0, expenses: 0 };
            }
            if (t.type === 'income') {
                dailyData[dateKey].income += t.amount;
            } else if (t.type === 'expense') {
                dailyData[dateKey].expenses += t.amount;
            }
        });

        return Object.values(dailyData)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [transactions]);

    const handleOpenModal = (transaction = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleFormSubmit = (transactionData) => {
        if (editingTransaction) {
            updateTransaction(editingTransaction.id, transactionData);
        } else {
            addTransaction(transactionData);
        }
        handleCloseModal();
    };

    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            deleteTransaction(transactionId);
        }
    };

    const recentTransactions = transactions.slice(0, 5);

    return (
        <>
            <div className={styles.dashboardGrid}>
                <div className={styles.mainColumn}>
                    <div className={styles.pageHeader}>
                        <h1 className={styles.pageMainTitle}>Your dashboard</h1>
                        <button className={styles.addTransactionButton} onClick={() => handleOpenModal()}>
                            <FaPlus size={12} /> Добавить транзакцию
                        </button>
                    </div>

                    <section className={styles.summaryCardsContainer}>
                        {summaryData.map(card => (
                            <div className={styles.summaryCard} key={card.title}>
                                <div className={`${styles.summaryCardIcon} ${card.iconStyleClass || styles.iconStyleDefault}`}>
                                    {React.cloneElement(card.icon, { size: 20 })}
                                </div>
                                <div className={styles.summaryCardInfo}>
                                    <span className={styles.summaryCardTitle}>{card.title}</span>
                                    <span className={styles.summaryCardAmount}>{card.amount}</span>
                                </div>
                            </div>
                        ))}
                    </section>

                    <CashFlowSummary chartData={cashFlowSummaryChartData} />

                    <section className={`${styles.dashboardSection} ${styles.lastTransactionsSection}`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Last Transactions</h2>
                        </div>
                        {recentTransactions && recentTransactions.length > 0 ? (
                            <ul className={styles.transactionList}>
                                {recentTransactions.map(t => (
                                    <li key={t.id} className={`${styles.transactionItem} ${t.type === 'income' ? styles.incomeItem : styles.expenseItem}`}>
                                        <div className={styles.transactionDetails}>
                                            <div className={styles.transactionCategoryNameWrapper}>
                                                <span
                                                    className={styles.transactionCategoryColorDot}
                                                    style={{ backgroundColor: t.category?.color || '#cccccc' }}
                                                ></span>
                                                <span className={styles.transactionCategoryName}>{t.category?.name || 'Без категории'}</span>
                                            </div>
                                            <span className={styles.transactionComment}>{t.comment || '-'}</span>
                                        </div>
                                        <div className={styles.transactionMeta}>
                                            <span className={styles.transactionAmount}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                            </span>
                                            <span className={styles.transactionDateDisplay}>{new Date(t.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                        <div className={styles.transactionActions}>
                                            <button onClick={() => handleOpenModal(t)} className={styles.actionButton} title="Редактировать">
                                                <FiEdit size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Удалить">
                                                <LuTrash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.placeholderContent}>Нет транзакций для отображения.</div>
                        )}
                    </section>
                </div>

                <aside className={styles.rightColumn}>
                    <section className={styles.dashboardSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Wallet</h2>
                            <button className={styles.optionsButton} aria-label="Wallet options">
                                <FiMoreHorizontal size={20}/>
                            </button>
                        </div>
                        <div className={styles.placeholderContent}>Wallet Card Placeholder</div>
                    </section>
                </aside>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? "Редактировать транзакцию" : "Добавить транзакцию"}>
                <TransactionForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                    categories={categories}
                    addCategory={addCategory}
                    initialData={editingTransaction}
                />
            </Modal>
        </>
    );
};

export default HomePage;