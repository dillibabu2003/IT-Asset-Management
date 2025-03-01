import { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from "lucide-react/dynamicIconImports";

const fallback = <div className="w-6 h-6" />;

const loadIcon = (name) => lazy(dynamicIconImports[name]);

const Icon = ({ name, style, ...props }) => {
  const LucideIcon = useMemo(() => loadIcon(name || "circle"), [name]);

  try {
    return (
      <Suspense fallback={fallback}>
        <LucideIcon style={style} {...props} />
      </Suspense>
    );
  } catch (error) {
    console.log(error);
    console.log(`Icon ${name} not found`);
    
    return fallback; // Show fallback if the icon import fails
  }
};

export default Icon;