import React, { useState } from 'react'; // <--- Добавляем useState
import styles from './HomePage.module.css';
import CashFlowSummary from '../components/CashFlowSummary';
import Modal from '../components/Modal'; // <--- ИМПОРТ Modal
import TransactionForm from '../components/TransactionForm'; // <--- ИМПОРТ TransactionForm
// Мы пока не будем использовать LastTransactionsSection, так как его реализация была отложена.
// Вместо этого, мы просто отобразим транзакции списком для проверки.

import { FaWallet, FaPlus } from 'react-icons/fa'; // <--- Добавляем FaPlus для кнопки
import { LuPiggyBank, LuTrendingUp } from 'react-icons/lu';
import { FiMoreHorizontal } from 'react-icons/fi';

// Принимаем transactions и addTransaction из App.jsx через props
const HomePage = ({
                      transactions,
                      categories,
                      addTransaction,
                      deleteTransaction,
                      updateTransaction,
                      addCategory
                  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null); // Для редактирования

    const summaryData = [
        // ... summaryData ...
        { title: 'Cash balance', amount: '$3240.21', icon: <FaWallet />, iconBg: '#1F2937', iconColor: '#FFFFFF' },
        { title: 'Total spent', amount: '$250.80', icon: <LuTrendingUp />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
        { title: 'Savings', amount: '$810.32', icon: <LuPiggyBank />, iconBg: '#E5E7EB', iconColor: '#4B5563' },
    ];

    const handleOpenModal = (transaction = null) => {
        setEditingTransaction(transaction); // null для новой, объект для редактирования
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null); // Сбрасываем редактируемую транзакцию
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
        <> {/* Обертка для HomePage и Modal */}
            <div className={styles.dashboardGrid}>
                <div className={styles.mainColumn}>
                    <div className={styles.pageHeader}> {/* Новый контейнер для заголовка и кнопки */}
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

                    <CashFlowSummary />

                    {/* Отображение транзакций (пока просто списком для теста, позже - через LastTransactionsSection) */}
                    <section className={styles.dashboardSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Транзакции</h2>
                        </div>
                        {transactions.length > 0 ? (
                            <ul className={styles.simpleTransactionList}>
                                {transactions.map(t => (
                                    <li key={t.id} className={t.type === 'income' ? styles.incomeItem : styles.expenseItem}>
                                        <span>{t.date}</span>
                                        <span>{t.category?.name || t.category}</span> {/* Отображаем имя категории */}
                                        <span>{t.comment}</span>
                                        <span className={styles.amount}>{t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}</span>
                                        <div>
                                            <button onClick={() => handleOpenModal(t)} className={styles.actionButton}>Edit</button>
                                            <button onClick={() => deleteTransaction(t.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Del</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Транзакций пока нет.</p>
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
                        <div className={styles.walletCardPlaceholder}>Wallet Card Placeholder</div>
                    </section>
                </aside>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? "Редактировать транзакцию" : "Добавить транзакцию"}>
                <TransactionForm
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                    categories={categories}
                    addCategory={addCategory}
                    initialData={editingTransaction} // Передаем данные для редактирования
                />
            </Modal>
        </>
    );
};

export default HomePage;