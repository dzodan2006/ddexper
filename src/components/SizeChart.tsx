
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

const measurements = [
  { label: 'OBIM GRUDI', values: [80, 84, 88, 92, 96, 100, 106, 112] },
  { label: 'OBIM STRUKA', values: [62, 66, 70, 74, 78, 82, 88, 94] },
  { label: 'OBIM BOKOVA', values: [90, 94, 98, 102, 106, 110, 116, 122] },
  { label: 'DUŽINA RUKAVA', values: [60, 61.5, 62, 62.5, 63, 63.5, 63.5, 63.5] },
  { label: 'UNUTRAŠNJA DUŽINA NOGAVICE', values: [79, 79, 79.5, 79.5, 80, 80, 80.5, 80.5] },
  { label: 'ŠIRINA RAMENA', values: [38, 39, 40, 41, 42, 43, 44.5, 47.5] },
];

const sizes = [34, 36, 38, 40, 42, 44, 46, 48];

export default function SizeChart({ isOpen, onClose }: SizeChartProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-full max-w-4xl bg-[#000000] border border-zinc-900 rounded-[2rem] shadow-2xl z-[101] overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-5 md:p-8 flex items-center justify-between border-b border-zinc-900">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase italic">Tabela veličina</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <table className="w-full text-[10px] md:text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900">
                      <th className="p-3 md:p-4 border-b border-zinc-800 font-bold text-zinc-400 sticky left-0 bg-zinc-900 z-10 min-w-[120px] md:w-48 uppercase tracking-widest text-[9px] md:text-[11px]"></th>
                      {sizes.map((size) => (
                        <th key={size} className="p-3 md:p-4 border-b border-zinc-800 font-bold text-center text-white min-w-[50px] md:min-w-[60px]">
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/30'}>
                        <td className="p-3 md:p-4 border-b border-zinc-900 font-medium text-zinc-400 sticky left-0 bg-[#000000] shadow-[2px_0_5px_rgba(0,0,0,0.2)] uppercase tracking-tight text-[9px] md:text-[11px]">
                          {row.label}
                        </td>
                        {row.values.map((val, vIdx) => (
                          <td key={vIdx} className="p-3 md:p-4 border-b border-zinc-900 text-center text-zinc-500 font-mono">
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-4 bg-zinc-900/50 rounded-2xl text-[10px] text-zinc-500 italic border border-zinc-900">
                * Sve mere su izražene u centimetrima (cm). Preporučujemo da merite direktno preko donjeg veša kako biste dobili najpreciznije rezultate.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
