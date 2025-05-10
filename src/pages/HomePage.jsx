import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import CashFlowSummary from '../components/CashFlowSummary';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';

import { FaWallet, FaPlus } from 'react-icons/fa';
// Заменяем LuEdit3 и LuTrash2 (если LuTrash2 тоже не работает, ее тоже можно заменить на FiTrash2)
import { LuPiggyBank, LuTrendingUp, LuTrash2 } from 'react-icons/lu';
import { FiMoreHorizontal, FiEdit } from 'react-icons/fi'; // <--- ДОБАВЛЯЕМ FiEdit, УБИРАЕМ LuEdit3 ИЗ LU

const HomePage = ({
                      transactions = [],
                      categories = [],
                      addTransaction,
                      deleteTransaction,
                      updateTransaction,
                      addCategory
                  }) => {
    // ... (остальной код компонента: useState, summaryData, cashFlowSummaryChartData, handleOpenModal, etc. остается без изменений)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const summaryData = [
        { title: 'Cash balance', amount: '$3240.21', icon: <FaWallet />, iconBg: '#1F2937', iconColor: '#FFFFFF' },
        { title: 'Total spent', amount: '$250.80', icon: <LuTrendingUp />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
        { title: 'Savings', amount: '$810.32', icon: <LuPiggyBank />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
    ];

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

                    <CashFlowSummary chartData={cashFlowSummaryChartData} />

                    <section className={`${styles.dashboardSection} ${styles.lastTransactionsSection}`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Last Transactions</h2>
                        </div>
                        {transactions && transactions.length > 0 ? (
                            <ul className={styles.transactionList}>
                                {transactions.slice(0, 5).map(t => (
                                    <li key={t.id} className={`${styles.transactionItem} ${t.type === 'income' ? styles.incomeItem : styles.expenseItem}`}>
                                        <div className={styles.transactionDetails}>
                                            <span className={styles.transactionCategoryName}>{t.category?.name || 'Без категории'}</span>
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
                                                <FiEdit size={14} /> {/* <--- ИСПОЛЬЗУЕМ FiEdit ВМЕСТО LuEdit3 */}
                                            </button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Удалить">
                                                <LuTrash2 size={14} /> {/* Оставляем LuTrash2, если она работает. Если нет, можно заменить на FiTrash2 */}
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