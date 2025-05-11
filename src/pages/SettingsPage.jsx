import React, { useState, useMemo } from 'react';
import homePageStyles from './HomePage.module.css';
import styles from './SettingsPage.module.css';
import { LuTrash2, LuCheck, LuX, LuSearch } from 'react-icons/lu';
import { FiEdit3, FiPlusCircle } from 'react-icons/fi';
import { logAction, logStateChange, logError } from '../utils/logger';

const SettingsPage = ({ categories, addCategory, deleteCategory, updateCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#808080');
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddCategory = async (e) => {
        e.preventDefault();
        logAction('SettingsPage', 'handleAddCategory', { name: newCategoryName, color: newCategoryColor });
        if (newCategoryName.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        const newCatData = {
            name: newCategoryName,
            color: newCategoryColor
        };
        try {
            const newCategory = await addCategory(newCatData);
            if (newCategory) {
                setNewCategoryName('');
                setNewCategoryColor('#808080');
            }
        } catch (err) {
            logError('SettingsPage', 'handleAddCategory', err);
        }
    };

    const handleStartEdit = (category) => {
        logAction('SettingsPage', 'handleStartEdit', { categoryId: category.id });
        setEditingCategory({
            id: category.id,
            name: category.name,
            color: category.color || '#808080',
            icon: category.icon
        });
    };

    const handleCancelEdit = () => {
        logAction('SettingsPage', 'handleCancelEdit');
        setEditingCategory(null);
    };

    const handleSaveEdit = async () => {
        if (!editingCategory || editingCategory.name.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        logAction('SettingsPage', 'handleSaveEdit', { category: editingCategory });
        const categoryDataToUpdate = {
            name: editingCategory.name.trim(),
            color: editingCategory.color || "#808080",
            icon: editingCategory.icon
        };
        try {
            const success = await updateCategory(editingCategory.id, categoryDataToUpdate);
            if (success) {
                setEditingCategory(null);
            }
        } catch (err) {
            logError('SettingsPage', 'handleSaveEdit', err);
        }
    };

    const handleEditFieldChange = (field, value) => {
        const oldEditingCategory = editingCategory;
        setEditingCategory(prev => {
            const newState = { ...prev, [field]: value };
            logStateChange('SettingsPage', `editingCategory.${field}`, value, oldEditingCategory ? oldEditingCategory[field] : undefined);
            return newState;
        });
    };

    const handleDeleteCategory = async (categoryId) => {
        logAction('SettingsPage', 'handleDeleteCategory', { categoryId });
        if (window.confirm('Вы уверены, что хотите удалить эту категорию? Это действие не может быть отменено.')) {
            try {
                await deleteCategory(categoryId);
            } catch (err) {
                logError('SettingsPage', 'handleDeleteCategory', err);
            }
        }
    };

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        if (!searchTerm.trim()) {
            return categories;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return categories.filter(category =>
            category.name.toLowerCase().includes(lowerSearchTerm)
        );
    }, [categories, searchTerm]);

    return (
        <div className={homePageStyles.pageContentWrapper}>
            <h1 className={homePageStyles.pageMainTitle}>Настройки Категорий</h1>

            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Добавить новую категорию</h2>
                <form onSubmit={handleAddCategory} className={styles.addCategoryForm}>
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Название категории"
                        className={styles.categoryInput}
                        required
                    />
                    <div className={styles.colorInputGroup}>
                        <label htmlFor="newCategoryColor" className={styles.colorLabel}>Цвет:</label>
                        <input
                            type="color"
                            id="newCategoryColor"
                            value={newCategoryColor}
                            onChange={(e) => setNewCategoryColor(e.target.value)}
                            className={styles.categoryColorInput}
                        />
                    </div>
                    <button type="submit" className={styles.addButton}>
                        <FiPlusCircle size={18} /> Добавить
                    </button>
                </form>
            </section>

            <section className={styles.settingsSection}>
                <div className={styles.sectionHeaderWithFilter}>
                    <h2 className={styles.sectionTitle}>Существующие категории</h2>
                    <div className={styles.filterInputWrapper}>
                        <LuSearch className={styles.filterInputIcon} size={16} />
                        <input
                            type="text"
                            placeholder="Поиск категорий..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.filterInput}
                        />
                    </div>
                </div>
                {filteredCategories && filteredCategories.length > 0 ? (
                    <ul className={styles.categoryList}>
                        {filteredCategories.map(category => (
                            <li key={category.id} className={styles.categoryItem}>
                                {editingCategory && editingCategory.id === category.id ? (
                                    <div className={styles.editForm}>
                                        <input
                                            type="text"
                                            value={editingCategory.name}
                                            onChange={(e) => handleEditFieldChange('name', e.target.value)}
                                            className={styles.categoryInput}
                                            required
                                        />
                                        <input
                                            type="color"
                                            value={editingCategory.color}
                                            onChange={(e) => handleEditFieldChange('color', e.target.value)}
                                            className={styles.categoryColorInputSmall}
                                        />
                                        <div className={styles.editActions}>
                                            <button onClick={handleSaveEdit} className={styles.actionButton} title="Сохранить">
                                                <LuCheck size={18} />
                                            </button>
                                            <button onClick={handleCancelEdit} className={`${styles.actionButton} ${styles.cancelButton}`} title="Отмена">
                                                <LuX size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.categoryInfo}>
                                            <span
                                                className={styles.categoryIconPreview}
                                                style={{ backgroundColor: category.color || '#cccccc' }}
                                                title={`Цвет: ${category.color || 'не задан'}`}
                                            >
                                            </span>
                                            <span className={styles.categoryName}>{category.name}</span>
                                        </div>
                                        <div className={styles.categoryActions}>
                                            <button onClick={() => handleStartEdit(category)} className={styles.actionButton} title="Редактировать">
                                                <FiEdit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteCategory(category.id)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Удалить">
                                                <LuTrash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noCategoriesMessage}>
                        {searchTerm ? 'Категории по вашему запросу не найдены.' : 'Категорий пока нет. Добавьте первую!'}
                    </p>
                )}
            </section>
        </div>
    );
};

export default SettingsPage;