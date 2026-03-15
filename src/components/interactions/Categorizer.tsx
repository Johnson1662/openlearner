'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  label: string;
  color: string;
  items: string[];
}

interface DraggableItem {
  id: string;
  label: string;
  categoryId?: string;
}

interface CategorizerProps {
  items: DraggableItem[];
  categories: Category[];
  onCategorize: (items: DraggableItem[]) => void;
  checkCorrectness?: (itemId: string, categoryId: string) => boolean;
}

export default function Categorizer({
  items,
  categories,
  onCategorize,
  checkCorrectness
}: CategorizerProps) {
  const [selectedItem, setSelectedItem] = useState<DraggableItem | null>(null);
  const [uncategorized, setUncategorized] = useState<DraggableItem[]>(() => {
    const categorizedIds = new Set(categories.flatMap(c => c.items));
    return items.filter(i => !categorizedIds.has(i.id));
  });
  const [categorized, setCategorized] = useState<Record<string, DraggableItem[]>>(() => {
    const initial: Record<string, DraggableItem[]> = {};
    categories.forEach(cat => {
      const catItems = cat.items
        .map(itemId => items.find(i => i.id === itemId))
        .filter((i): i is DraggableItem => i !== undefined);
      if (catItems.length > 0) {
        initial[cat.id] = catItems;
      }
    });
    return initial;
  });

  const handleItemClick = (item: DraggableItem) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedItem) return;

    setUncategorized(prev => prev.filter(i => i.id !== selectedItem.id));
    setCategorized(prev => {
      const newState: Record<string, DraggableItem[]> = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = newState[key].filter(i => i.id !== selectedItem.id);
      });
      newState[categoryId] = [...(newState[categoryId] || []), { ...selectedItem, categoryId }];
      return newState;
    });

    const allItems = [
      ...uncategorized.filter(i => i.id !== selectedItem.id),
      ...Object.values(categorized).flat().filter(i => i.id !== selectedItem.id),
      { ...selectedItem, categoryId }
    ];
    onCategorize(allItems);
    setSelectedItem(null);
  };

  const handleRemoveFromCategory = (item: DraggableItem) => {
    setCategorized(prev => {
      const newState: Record<string, DraggableItem[]> = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = newState[key].filter(i => i.id !== item.id);
      });
      return newState;
    });
    setUncategorized(prev => [...prev, { ...item, categoryId: undefined }]);

    const allItems = [
      ...uncategorized,
      { ...item, categoryId: undefined },
      ...Object.values(categorized).flat().filter(i => i.id !== item.id)
    ];
    onCategorize(allItems);
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-muted rounded-2xl p-6 min-h-[120px]">
        <p className="text-sm text-duo-textSoft font-medium mb-4">
          {selectedItem ? `已选择: ${selectedItem.label} - 点击分类放置` : '点击选择项目，然后点击分类放置：'}
        </p>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="popLayout">
            {uncategorized.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleItemClick(item)}
                className={`px-4 py-3 rounded-xl shadow-md border-2 cursor-pointer transition-all ${
                  selectedItem?.id === item.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-duo-gray bg-background hover:border-primary/50'
                }`}
              >
                <span className="text-duo-text font-medium">{item.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {uncategorized.length === 0 && (
          <motion.p 
            className="text-center text-duo-textMuted py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            所有项目已分类 ✓
          </motion.p>
        )}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`rounded-2xl p-4 min-h-[200px] transition-all cursor-pointer ${
              selectedItem ? 'hover:ring-4 hover:ring-primary/30 hover:ring-opacity-50' : ''
            }`}
            style={{ backgroundColor: `${category.color}20` }}
          >
            <div 
              className="flex items-center gap-2 mb-4 pb-3 border-b-2"
              style={{ borderColor: category.color }}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="font-bold text-duo-text">{category.label}</span>
              <span className="ml-auto text-sm text-duo-textSoft">
                {categorized[category.id]?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {(categorized[category.id] || []).map((item) => {
                  const isCorrect = checkCorrectness 
                      ? checkCorrectness(item.id, category.id)
                      : undefined;

                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromCategory(item);
                      }}
                      className={`
                        px-3 py-2 rounded-lg shadow-sm border-2 cursor-pointer
                        ${isCorrect === true ? 'border-duo-green/60 bg-duo-greenBg' : ''}
                        ${isCorrect === false ? 'border-duo-red/60 bg-duo-redLight' : ''}
                        ${isCorrect === undefined ? 'border-duo-gray bg-background hover:border-duo-red/40' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-duo-text font-medium">{item.label}</span>
                        {isCorrect === true && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-duo-green"
                          >
                            ✓
                          </motion.span>
                        )}
                        {isCorrect === false && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-duo-red"
                          >
                            ✗
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {(categorized[category.id]?.length || 0) === 0 && (
              <div className="h-20 flex items-center justify-center border-2 border-dashed border-duo-gray rounded-xl">
                <span className="text-duo-textMuted text-sm">点击放置到此处</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
