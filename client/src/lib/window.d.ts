interface Window {
  googleTranslateElementInit: () => void;
  google: {
    translate: {
      TranslateElement: {
        InlineLayout: {
          SIMPLE: number;
          HORIZONTAL: number;
          VERTICAL: number;
        };
        new (options: {
          pageLanguage: string;
          includedLanguages?: string;
          layout?: number;
          autoDisplay?: boolean;
        }, elementId: string): any;
      };
    };
  };
}