import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './HomePage.module.css';
import CashFlowSummary from '../components/CashFlowSummary';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import DateRangeFilter from '../components/DateRangeFilter';
import { FaWallet, FaPlus } from 'react-icons/fa';
import { LuPiggyBank, LuTrendingUp, LuTrash2, LuSearch } from 'react-icons/lu'; // Добавили LuSearch
import { FiMoreHorizontal, FiEdit } from 'react-icons/fi';
import { logAction, logStateChange, logEffect, logError } from '../utils/logger';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const [homePageSearchTerm, setHomePageSearchTerm] = useState(''); // Состояние для поиска на HomePage

    const getInitialHomepageDateRange = useCallback(() => {
        const urlStartDate = searchParams.get('hpStartDate');
        const urlEndDate = searchParams.get('hpEndDate');
        const urlAllTime = searchParams.get('hpAllTime');

        if (urlAllTime === 'true') {
            return { startDate: '', endDate: '', allTime: true };
        }
        if (urlStartDate && urlEndDate) {
            return { startDate: urlStartDate, endDate: urlEndDate, allTime: false };
        }
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        return { startDate, endDate, allTime: false };
    }, [searchParams]);

    const [dateRange, setDateRange] = useState(getInitialHomepageDateRange);

    useEffect(() => {
        const currentInitialRange = getInitialHomepageDateRange();
        if(dateRange.startDate !== currentInitialRange.startDate || dateRange.endDate !== currentInitialRange.endDate || dateRange.allTime !== currentInitialRange.allTime) {
            const params = {};
            searchParams.forEach((value, key) => {
                if (!key.startsWith('hp')) {
                    params[key] = value;
                }
            });

            if (dateRange.allTime) {
                params.hpAllTime = 'true';
                delete params.hpStartDate;
                delete params.hpEndDate;
            } else {
                if (dateRange.startDate) params.hpStartDate = dateRange.startDate;
                if (dateRange.endDate) params.hpEndDate = dateRange.endDate;
                delete params.hpAllTime;
            }
            setSearchParams(params, { replace: true });
        }
    }, [dateRange, setSearchParams, searchParams, getInitialHomepageDateRange]);


    const handleDateRangeApplyForHomepage = useCallback((newDateRange) => {
        setDateRange(prev => {
            const newState = { startDate: newDateRange.startDate, endDate: newDateRange.endDate, allTime: !newDateRange.startDate && !newDateRange.endDate };
            return newState;
        });
    }, []);

    const transactionsForPeriodCalculations = useMemo(() => {
        if (!Array.isArray(transactions)) return [];
        if (dateRange.allTime || (!dateRange.startDate && !dateRange.endDate)) {
            return transactions;
        }
        if (!dateRange.endDate) {
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);
            return transactions.filter(t => new Date(t.date) <= endOfToday);
        }
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return transactions.filter(t => new Date(t.date) <= end);
    }, [transactions, dateRange]);

    const cashBalanceForPeriod = useMemo(() => {
        if (!Array.isArray(transactionsForPeriodCalculations)) return 0;
        let income = 0;
        let expenses = 0;
        transactionsForPeriodCalculations.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else if (t.type === 'expense') expenses += t.amount;
        });
        return income - expenses;
    }, [transactionsForPeriodCalculations]);

    const transactionsStrictlyInSelectedPeriod = useMemo(() => {
        if (dateRange.allTime || (!dateRange.startDate && !dateRange.endDate)) {
            return transactions;
        }
        if (!dateRange.startDate || !dateRange.endDate) {
            return [];
        }
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [transactions, dateRange]);

    const periodIncome = useMemo(() => {
        return transactionsStrictlyInSelectedPeriod
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactionsStrictlyInSelectedPeriod]);

    const periodExpenses = useMemo(() => {
        return transactionsStrictlyInSelectedPeriod
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactionsStrictlyInSelectedPeriod]);

    const periodSavings = useMemo(() => periodIncome - periodExpenses, [periodIncome, periodExpenses]);

    const getPeriodLabel = useCallback(() => {
        if (dateRange.allTime || (!dateRange.startDate && !dateRange.endDate)) {
            return "За все время";
        }
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

        if (dateRange.startDate === sevenDaysAgoStr && dateRange.endDate === todayStr) {
            return "За 7 дней";
        }
        if (dateRange.startDate === firstDayCurrentMonth && dateRange.endDate === todayStr) {
            return "За месяц";
        }
        if (dateRange.startDate && dateRange.endDate) {
            const startLocale = new Date(dateRange.startDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
            const endLocale = new Date(dateRange.endDate).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
            if (startLocale === endLocale) return startLocale;
            return `${startLocale} - ${endLocale}`;
        }
        return "За период";
    }, [dateRange]);

    const summaryData = useMemo(() => {
        const currentPeriodLabel = getPeriodLabel();
        const cashBalanceLabelText = dateRange.allTime || (!dateRange.startDate && !dateRange.endDate)
            ? "Cash balance (Все время)"
            : `Cash balance (до ${new Date(dateRange.endDate || new Date()).toLocaleDateString('ru-RU')})`;

        const spentTitleText = currentPeriodLabel === "За все время" || currentPeriodLabel === "За период"
            ? `Total spent (${currentPeriodLabel})`
            : `Total spent (${currentPeriodLabel})`;

        const savingsTitleText = currentPeriodLabel === "За все время" || currentPeriodLabel === "За период"
            ? `Savings (${currentPeriodLabel})`
            : `Savings (${currentPeriodLabel})`;

        return [
            { title: cashBalanceLabelText, amount: `$${cashBalanceForPeriod.toFixed(2)}`, icon: <FaWallet />, iconStyleClass: styles.iconStyleDefault },
            { title: spentTitleText, amount: `$${periodExpenses.toFixed(2)}`, icon: <LuTrendingUp />, iconStyleClass: styles.iconStyleDefault },
            { title: savingsTitleText, amount: `$${periodSavings.toFixed(2)}`, icon: <LuPiggyBank />, iconStyleClass: styles.iconStyleDefault },
        ];
    }, [cashBalanceForPeriod, periodExpenses, periodSavings, getPeriodLabel, dateRange]);

    const cashFlowSummaryChartData = useMemo(() => {
        if (!transactionsStrictlyInSelectedPeriod || transactionsStrictlyInSelectedPeriod.length === 0) return [];
        const dailyData = {};
        transactionsStrictlyInSelectedPeriod.forEach(t => {
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
    }, [transactionsStrictlyInSelectedPeriod]);

    const handleOpenModal = (transaction = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(false);
    };

    const handleFormSubmit = async (transactionData) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, transactionData);
            } else {
                await addTransaction(transactionData);
            }
            handleCloseModal();
        } catch (err) {
            logError('HomePage', 'handleFormSubmit', err);
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            try {
                await deleteTransaction(transactionId);
            } catch (err) {
                logError('HomePage', 'handleDeleteTransaction', err);
            }
        }
    };

    const recentTransactions = useMemo(() => {
        if (!Array.isArray(transactions)) return [];

        let filtered = [...transactions];

        if (homePageSearchTerm) {
            const lowerSearchTerm = homePageSearchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                t.comment?.toLowerCase().includes(lowerSearchTerm) ||
                t.category?.name?.toLowerCase().includes(lowerSearchTerm) ||
                t.amount.toString().includes(lowerSearchTerm)
            );
        }

        return filtered
            .sort((a,b) => new Date(b.date) - new Date(a.date) || (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, homePageSearchTerm ? filtered.length : 5); // Показываем все найденные или 5 последних
    }, [transactions, homePageSearchTerm]);

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

                    <div className={styles.homePageDateFilterContainer}>
                        <DateRangeFilter
                            onFilterApply={handleDateRangeApplyForHomepage}
                            initialStartDate={dateRange.startDate}
                            initialEndDate={dateRange.endDate}
                        />
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

                    <CashFlowSummary chartData={cashFlowSummaryChartData} selectedPeriodLabel={getPeriodLabel()} />

                    <section className={`${styles.dashboardSection} ${styles.lastTransactionsSection}`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Last Transactions</h2>
                            <div className={styles.homePageSearchWrapper}>
                                <LuSearch className={styles.homePageSearchIcon} />
                                <input
                                    type="text"
                                    placeholder="Поиск транзакций..."
                                    value={homePageSearchTerm}
                                    onChange={(e) => setHomePageSearchTerm(e.target.value)}
                                    className={styles.homePageSearchInput}
                                />
                            </div>
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
                            <div className={styles.placeholderContent}>
                                {homePageSearchTerm ? 'Транзакции по вашему запросу не найдены.' : 'Нет транзакций для отображения.'}
                            </div>
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