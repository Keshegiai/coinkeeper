import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import homePageStyles from './HomePage.module.css';
import opPageStyles from './OperationsPage.module.css';
import DateRangeFilter from '../components/DateRangeFilter';
import { FaPlus } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { LuTrash2 } from 'react-icons/lu';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';

const OperationsPage = ({
                            transactions: allTransactions = [],
                            categories = [],
                            addTransaction,
                            deleteTransaction,
                            updateTransaction,
                            addCategory
                        }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const getInitialFilters = () => {
        const today = new Date();
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        return {
            startDate: searchParams.get('startDate') || currentMonthStart.toISOString().split('T')[0],
            endDate: searchParams.get('endDate') || today.toISOString().split('T')[0],
            sortOrder: searchParams.get('sortOrder') || 'date_desc',
            searchTerm: searchParams.get('searchTerm') || '',
            categoryFilter: searchParams.get('categoryFilter') || 'all',
            typeFilter: searchParams.get('typeFilter') || 'all',
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());

    useEffect(() => {
        const params = {};
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;
        if (filters.searchTerm) params.searchTerm = filters.searchTerm;
        if (filters.categoryFilter && filters.categoryFilter !== 'all') params.categoryFilter = filters.categoryFilter;
        if (filters.typeFilter && filters.typeFilter !== 'all') params.typeFilter = filters.typeFilter;
        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDateRangeApply = (newDateRange) => {
        setFilters(prev => ({
            ...prev,
            startDate: newDateRange.startDate,
            endDate: newDateRange.endDate
        }));
    };

    const filteredAndSortedTransactions = useMemo(() => {
        let processedTransactions = [...allTransactions];

        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            processedTransactions = processedTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= start && transactionDate <= end;
            });
        }

        if (filters.searchTerm) {
            const lowerSearchTerm = filters.searchTerm.toLowerCase();
            processedTransactions = processedTransactions.filter(t =>
                t.comment?.toLowerCase().includes(lowerSearchTerm) ||
                t.category?.name?.toLowerCase().includes(lowerSearchTerm) ||
                t.amount.toString().includes(lowerSearchTerm)
            );
        }

        if (filters.categoryFilter && filters.categoryFilter !== 'all') {
            processedTransactions = processedTransactions.filter(t => t.category.id === filters.categoryFilter);
        }

        if (filters.typeFilter && filters.typeFilter !== 'all') {
            processedTransactions = processedTransactions.filter(t => t.type === filters.typeFilter);
        }

        if (filters.sortOrder === 'date_asc') {
            processedTransactions.sort((a, b) => new Date(a.date) - new Date(b.date) || (a.createdAt || 0) - (b.createdAt || 0));
        } else if (filters.sortOrder === 'date_desc') {
            processedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
        } else if (filters.sortOrder === 'amount_asc') {
            processedTransactions.sort((a, b) => a.amount - b.amount);
        } else if (filters.sortOrder === 'amount_desc') {
            processedTransactions.sort((a, b) => b.amount - a.amount);
        }

        return processedTransactions;
    }, [allTransactions, filters]);

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

    const resetAllFilters = () => {
        const today = new Date();
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setFilters({
            startDate: currentMonthStart.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            sortOrder: 'date_desc',
            searchTerm: '',
            categoryFilter: 'all',
            typeFilter: 'all',
        });
    };

    return (
        <>
            <div className={homePageStyles.pageContentWrapper}>
                <div className={homePageStyles.pageHeader}>
                    <h1 className={homePageStyles.pageMainTitle}>Все операции</h1>
                    <button className={homePageStyles.addTransactionButton} onClick={() => handleOpenModal()}>
                        <FaPlus size={12} /> Добавить транзакцию
                    </button>
                </div>

                <DateRangeFilter
                    onFilterApply={handleDateRangeApply}
                    initialStartDate={filters.startDate}
                    initialEndDate={filters.endDate}
                />

                <div className={opPageStyles.filtersBar}>
                    <input
                        type="text"
                        placeholder="Поиск по комментарию, категории, сумме..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        className={opPageStyles.searchInput}
                    />
                    <select
                        value={filters.categoryFilter}
                        onChange={(e) => handleFilterChange('categoryFilter', e.target.value)}
                        className={opPageStyles.filterSelect}
                    >
                        <option value="all">Все категории</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.typeFilter}
                        onChange={(e) => handleFilterChange('typeFilter', e.target.value)}
                        className={opPageStyles.filterSelect}
                    >
                        <option value="all">Все типы</option>
                        <option value="income">Доходы</option>
                        <option value="expense">Расходы</option>
                    </select>
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className={opPageStyles.filterSelect}
                    >
                        <option value="date_desc">Сначала новые</option>
                        <option value="date_asc">Сначала старые</option>
                        <option value="amount_desc">Сначала дорогие</option>
                        <option value="amount_asc">Сначала дешевые</option>
                    </select>
                    <button onClick={resetAllFilters} className={opPageStyles.resetButton}>Сбросить все</button>
                </div>

                <section className={`${homePageStyles.dashboardSection} ${homePageStyles.lastTransactionsSection}`}>
                    {filteredAndSortedTransactions.length > 0 ? (
                        <ul className={homePageStyles.transactionList}>
                            {filteredAndSortedTransactions.map(t => (
                                <li key={t.id} className={`${homePageStyles.transactionItem} ${t.type === 'income' ? homePageStyles.incomeItem : homePageStyles.expenseItem}`}>
                                    <div className={homePageStyles.transactionDetails}>
                                        <span className={homePageStyles.transactionCategoryName}>{t.category?.name || 'Без категории'}</span>
                                        <span className={homePageStyles.transactionComment}>{t.comment || '-'}</span>
                                    </div>
                                    <div className={homePageStyles.transactionMeta}>
                                        <span className={homePageStyles.transactionAmount}>
                                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                        </span>
                                        <span className={homePageStyles.transactionDateDisplay}>{new Date(t.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className={homePageStyles.transactionActions}>
                                        <button onClick={() => handleOpenModal(t)} className={homePageStyles.actionButton} title="Редактировать">
                                            <FiEdit size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteTransaction(t.id)} className={`${homePageStyles.actionButton} ${homePageStyles.deleteButton}`} title="Удалить">
                                            <LuTrash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={homePageStyles.placeholderContent}>Транзакции по заданным фильтрам не найдены.</div>
                    )}
                </section>
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

export default OperationsPage;