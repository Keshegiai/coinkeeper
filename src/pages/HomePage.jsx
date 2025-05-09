import React, { useState } from 'react';
import styles from './HomePage.module.css'; // CSS-модули для HomePage
import CashFlowSummary from '../components/CashFlowSummary'; // Компонент для секции "Your cash flow"
import Modal from '../components/Modal'; // Компонент модального окна
import TransactionForm from '../components/TransactionForm'; // Компонент формы транзакции

// Иконки (убедись, что эти или твои альтернативы импортированы и работают)
import { FaWallet, FaPlus } from 'react-icons/fa';
import { LuPiggyBank, LuTrendingUp } from 'react-icons/lu'; // LuTrendingUp для "Total spent"
import { FiMoreHorizontal } from 'react-icons/fi'; // Для кнопки опций Wallet

// Компонент HomePage теперь ожидает props из App.jsx
const HomePage = ({
                      transactions,
                      categories,
                      addTransaction,
                      deleteTransaction,
                      updateTransaction,
                      addCategory
                  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null); // Для отслеживания редактируемой транзакции

    // Данные для карточек общей информации
    const summaryData = [
        { title: 'Cash balance', amount: '$3240.21', icon: <FaWallet />, iconBg: '#1F2937', iconColor: '#FFFFFF' },
        { title: 'Total spent', amount: '$250.80', icon: <LuTrendingUp />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
        { title: 'Savings', amount: '$810.32', icon: <LuPiggyBank />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
    ];

    // Примерные данные для графика на главной странице (для CashFlowSummary)
    // В реальном приложении эти данные должны вычисляться на основе 'transactions'
    const cashFlowSummaryChartData = [
        { date: 'Jul 14', income: 0, expenses: 300 },
        { date: 'Jul 15', income: 700, expenses: 450 },
        { date: 'Jul 18', income: 1200, expenses: 200 },
        { date: 'Jul 20', income: 1700, expenses: 700 },
        { date: 'Jul 22', income: 800, expenses: 900 },
        { date: 'Jul 24', income: 1300, expenses: 300 },
        { date: 'Jul 26', income: 600, expenses: 500 },
    ];

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
            updateTransaction({ ...editingTransaction, ...transactionData });
        } else {
            addTransaction(transactionData);
        }
        handleCloseModal();
    };

    return (
        <> {/* Используем React Fragment, так как Modal рендерится на верхнем уровне */}
            <div className={styles.dashboardGrid}>
                {/* Основная (левая) колонка */}
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

                    {/* Секция "Your cash flow" с кликабельным графиком */}
                    <CashFlowSummary chartData={cashFlowSummaryChartData} />

                    {/* Секция "Last Transactions" (пока заглушка, как мы договорились) */}
                    <section className={styles.dashboardSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Last Transactions</h2>
                            <a href="#" className={styles.sectionLink}>Check All &gt;</a>
                        </div>
                        {/* Отображение транзакций (простой список для примера) */}
                        {transactions && transactions.length > 0 ? (
                            <ul className={styles.simpleTransactionList}>
                                {transactions.slice(0, 5).map(t => ( // Показываем только первые 5 для примера
                                    <li key={t.id} className={t.type === 'income' ? styles.incomeItem : styles.expenseItem}>
                                        <span>{t.date}</span>
                                        <span>{t.category?.name || t.category}</span>
                                        <span className={styles.commentText}>{t.comment}</span>
                                        <span className={styles.amount}>{t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</span>
                                        <div className={styles.transactionActions}>
                                            <button onClick={() => handleOpenModal(t)} className={styles.actionButtonSmall} title="Редактировать">Edit</button>
                                            <button onClick={() => deleteTransaction(t.id)} className={`${styles.actionButtonSmall} ${styles.deleteButtonSmall}`} title="Удалить">Del</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.transactionsListPlaceholder}>No transactions yet.</div>
                        )}
                    </section>
                </div>

                {/* Правая колонка */}
                <aside className={styles.rightColumn}>
                    <section className={styles.dashboardSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Wallet</h2>
                            <button className={styles.optionsButton} aria-label="Wallet options">
                                <FiMoreHorizontal size={20}/>
                            </button>
                        </div>
                        <div className={styles.walletCardPlaceholder}>Wallet Card Placeholder</div>
                    </section>
                    {/* Секция "Recent transactions" была удалена */}
                </aside>
            </div>

            {/* Модальное окно для добавления/редактирования транзакции */}
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