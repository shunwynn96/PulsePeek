
import { Button } from "@/components/ui/button";

interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ["All", "Technology", "Business", "Sports", "Entertainment", "Health"];

const categoryColors = {
  All: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
  Technology: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-800/50",
  Business: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-800/50",
  Sports: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-800/50",
  Entertainment: "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-200 dark:hover:bg-pink-800/50",
  Health: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800/50",
};

const CategoryTabs = ({ selectedCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-1 mb-8">
      {categories.map((category) => (
        <Button
          key={category}
          variant="outline"
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2 rounded-full transition-all duration-200 border-0 ${
            selectedCategory === category
              ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
              : ""
          } ${categoryColors[category as keyof typeof categoryColors]}`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryTabs;
