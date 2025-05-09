import React, { useState } from 'react';
import homePageStyles from './HomePage.module.css'; // Используем для общего макета страницы
import styles from './SettingsPage.module.css'; // Свои стили для страницы настроек

import { LuTrash2, LuCheck, LuX } from 'react-icons/lu'; // Эти, надеюсь, работают
import { FiEdit3, FiPlusCircle } from 'react-icons/fi'; // <--- НОВЫЕ АЛЬТЕРНАТИВНЫЕ ИКОНКИ

const SettingsPage = ({ categories, addCategory, deleteCategory, updateCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategoryName.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        addCategory(newCategoryName);
        setNewCategoryName('');
    };

    const handleStartEdit = (category) => {
        setEditingCategoryId(category.id);
        setEditingCategoryName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setEditingCategoryName('');
    };

    const handleSaveEdit = (categoryId) => {
        if (editingCategoryName.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        const success = updateCategory({ id: categoryId, name: editingCategoryName });
        if (success) {
            setEditingCategoryId(null);
            setEditingCategoryName('');
        }
    };

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
                    />
                    <button type="submit" className={styles.addButton}>
                        <FiPlusCircle size={18} /> {/* <--- ИСПОЛЬЗУЕМ FiPlusCircle */}
                        Добавить
                    </button>
                </form>
            </section>

            <section className={styles.settingsSection}>
                <h2 className={styles.sectionTitle}>Существующие категории</h2>
                {categories.length > 0 ? (
                    <ul className={styles.categoryList}>
                        {categories.map(category => (
                            <li key={category.id} className={styles.categoryItem}>
                                {editingCategoryId === category.id ? (
                                    <div className={styles.editForm}>
                                        <input
                                            type="text"
                                            value={editingCategoryName}
                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                            className={styles.categoryInput}
                                        />
                                        <button onClick={() => handleSaveEdit(category.id)} className={styles.actionButton} title="Сохранить">
                                            <LuCheck size={18} />
                                        </button>
                                        <button onClick={handleCancelEdit} className={`${styles.actionButton} ${styles.cancelButton}`} title="Отмена">
                                            <LuX size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className={styles.categoryName}>{category.name}</span>
                                        <div className={styles.categoryActions}>
                                            <button onClick={() => handleStartEdit(category)} className={styles.actionButton} title="Редактировать">
                                                <FiEdit3 size={16} /> {/* <--- ИСПОЛЬЗУЕМ FiEdit3 */}
                                            </button>
                                            <button onClick={() => deleteCategory(category.id)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Удалить">
                                                <LuTrash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Категорий пока нет. Добавьте первую!</p>
                )}
            </section>
        </div>
    );
};

export default SettingsPage;