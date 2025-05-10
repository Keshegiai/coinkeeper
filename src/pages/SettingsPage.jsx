import React, { useState } from 'react';
import homePageStyles from './HomePage.module.css';
import styles from './SettingsPage.module.css';
import { LuTrash2, LuCheck, LuX } from 'react-icons/lu';
import { FiEdit3, FiPlusCircle } from 'react-icons/fi';

const SettingsPage = ({ categories, addCategory, deleteCategory, updateCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#808080');

    const [editingCategory, setEditingCategory] = useState(null);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (newCategoryName.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        const newCatData = {
            name: newCategoryName,
            color: newCategoryColor
        };
        const newCategory = await addCategory(newCatData);
        if (newCategory) {
            setNewCategoryName('');
            setNewCategoryColor('#808080');
        }
    };

    const handleStartEdit = (category) => {
        setEditingCategory({
            id: category.id,
            name: category.name,
            color: category.color || '#808080',
            icon: category.icon // Сохраняем иконку, если она есть, но не даем редактировать
        });
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
    };

    const handleSaveEdit = async () => {
        if (!editingCategory || editingCategory.name.trim() === '') {
            alert('Название категории не может быть пустым.');
            return;
        }
        const categoryDataToUpdate = {
            name: editingCategory.name.trim(),
            color: editingCategory.color || "#808080",
            icon: editingCategory.icon // Передаем существующую иконку, т.к. не редактируем ее здесь
        };
        const success = await updateCategory(editingCategory.id, categoryDataToUpdate);
        if (success) {
            setEditingCategory(null);
        }
    };

    const handleEditFieldChange = (field, value) => {
        setEditingCategory(prev => ({ ...prev, [field]: value }));
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
                <h2 className={styles.sectionTitle}>Существующие категории</h2>
                {categories && categories.length > 0 ? (
                    <ul className={styles.categoryList}>
                        {categories.map(category => (
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
                        {/* Если иконка все еще есть в данных, можно ее как-то отобразить или первую букву имени */}
                          {/* category.icon ? <DynamicIcon name={category.icon} /> : category.name.charAt(0).toUpperCase() */}
                      </span>
                                            <span className={styles.categoryName}>{category.name}</span>
                                        </div>
                                        <div className={styles.categoryActions}>
                                            <button onClick={() => handleStartEdit(category)} className={styles.actionButton} title="Редактировать">
                                                <FiEdit3 size={16} />
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
                    <p className={styles.noCategoriesMessage}>Категорий пока нет. Добавьте первую!</p>
                )}
            </section>
        </div>
    );
};

export default SettingsPage;