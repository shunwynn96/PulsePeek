import { ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageDropdown = () => {
  const { currentLanguage, setLanguage, supportedLanguages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.name}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
      >
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language)}
            className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};