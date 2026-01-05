interface CopyrightBarProps {
  leftText?: string;
  rightText?: string;
  year?: number;
  config: {
    store: {
      name: string;
    };
  };
}

export const CopyrightBar = ({
  leftText,
  rightText,
  year,
  config,
}: CopyrightBarProps) => {
  return (
    <section className="w-full border-t border-secondary/20 p-4 text-center text-xs text-secondary">
      {(leftText || rightText) && (
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-secondary md:flex-row">
          <p>
            {leftText ?? `© ${year} ${config.store.name}. All rights reserved.`}
          </p>
          {rightText && <p className="text-xs">{rightText}</p>}
        </div>
      )}
    </section>
  );
};

export default CopyrightBar;
