export default function Spinner({ text = 'AI is thinking...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
      <div className="spinner" />
      <p className="text-amber-400/80 text-sm font-medium animate-pulse">{text}</p>
    </div>
  );
}
