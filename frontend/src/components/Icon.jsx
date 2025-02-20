import { lazy, Suspense } from 'react';
import dynamicIconImports from "lucide-react/dynamicIconImports";

const fallback = <div className="w-6 h-6" />;

const Icon = ({ name, style, ...props }) => {
  try {
    // Ensure dynamicIconImports[name] is a function that returns a promise
    const LucideIcon = lazy(() => {
      const iconImport = dynamicIconImports[name || "circle"];
      console.log(name);
      
      if (typeof iconImport !== 'function') {
        throw new Error(`Icon with name "${name}" does not have a valid import function.`);
      }

      return iconImport(); // Ensure it returns a promise resolving to a component
    });

    return (
      <Suspense fallback={fallback}>
        <LucideIcon style={style} {...props} />
      </Suspense>
    );
  } catch (error) {
    console.log(error);
    return fallback; // Show fallback if the icon import fails
  }
};

export default Icon;
