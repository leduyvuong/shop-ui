import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-3 w-3 rounded-full bg-primary"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: index * 0.1 }}
          />
        ))}
      </div>
      <p className="text-sm font-medium">{label}...</p>
    </div>
  );
}
