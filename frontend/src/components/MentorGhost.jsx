export default function MentorGhost({ message }) {
  return (
    <div className="glass-card animate-fade-in border-amber-400/30 mt-6">
      <div className="flex items-start gap-4">
        <span className="text-4xl">👻</span>
        <div>
          <h3 className="font-heading text-amber-400 text-lg mb-2">Mentor Ghost Says...</h3>
          <p className="text-gray-300 leading-relaxed italic">{message}</p>
        </div>
      </div>
    </div>
  );
}
