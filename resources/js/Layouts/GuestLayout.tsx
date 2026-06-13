import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 text-gray-800 pt-6 sm:justify-center sm:pt-0 relative overflow-hidden bg-mesh-radial font-sans">
            
            {/* Ambient glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
                <Link href="/" className="flex flex-col items-center gap-1.5 group select-none">
                    <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight group-hover:scale-105 transition-all">
                        bocado!
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Gestión en Tiempo Real
                    </span>
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white border border-gray-150/70 px-8 py-8 shadow-xl sm:max-w-md sm:rounded-3xl relative z-10 transition-all">
                {children}
            </div>
        </div>
    );
}
