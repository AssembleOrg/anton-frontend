'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

const easeLuxury: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailId = useId();
  const passwordId = useId();

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2200);
    const t2 = setTimeout(() => setStep(2), 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <main className='relative h-[100dvh] w-full select-none overflow-hidden bg-black font-sans text-foreground'>
      {/* CAPA 1: VIDEO ORIGINAL (Sin filtros pesados) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
        transition={{ duration: 1, ease: easeLuxury }}
        className='absolute inset-0 z-0'
      >
        <video
          src='/drone-intro.mp4'
          poster='/1.png'
          muted
          autoPlay
          loop
          playsInline
          className='h-full w-full object-cover'
        />
        {/* Un degradado muy sutil solo para legibilidad, casi invisible */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40' />
      </motion.div>

      <LayoutGroup>
        {/* CAPA 2: EL LOGO (Uso de LayoutId para vuelo perfecto) */}
        <div className='absolute inset-0 z-50 pointer-events-none'>
          {step === 0 ? (
            // POSICIÓN INICIAL: CENTRO
            <motion.div
              layoutId='main-logo'
              transition={{ layout: { duration: 1.25, ease: easeLuxury } }}
              className='absolute inset-0 flex items-center justify-center'
            >
              <LogoContent
                isAnimated={true}
                scale={1.2}
              />
            </motion.div>
          ) : (
            // POSICIÓN FINAL: ESQUINA (Desktop: Left | Mobile: Center)
            <motion.div
              layoutId='main-logo'
              transition={{ layout: { duration: 1.25, ease: easeLuxury } }}
              className='absolute top-8 left-0 w-full md:left-16 md:w-auto flex justify-center md:justify-start'
            >
              <LogoContent
                isAnimated={false}
                scale={0.7}
              />
            </motion.div>
          )}
        </div>

        {/* CAPA 3: EL FORMULARIO */}
        <AnimatePresence>
          {step === 2 && (
            <motion.aside
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeLuxury }}
              // MOBILE: Bottom Card | DESKTOP: Left Sidebar
              className='absolute z-40 flex h-[100dvh] w-full flex-col justify-end overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-24 md:left-0 md:top-0 md:w-[450px] md:items-center md:justify-center md:border-r md:border-white/10 md:bg-transparent md:backdrop-blur-3xl md:px-0 md:pb-0 md:pt-0'
            >
              <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[65dvh] bg-gradient-to-t from-black/70 via-black/25 to-transparent md:hidden' />
              {/* Tarjeta Mobile (Solo blur abajo) */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: easeLuxury, delay: 0.08 }}
                className='relative z-10 mx-auto w-full max-w-[420px] rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-black/55 to-black/25 px-8 pb-8 pt-8 shadow-[0_-30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:mx-auto md:w-full md:max-w-[320px] md:rounded-none md:border-none md:bg-transparent md:[background-image:none] md:px-0 md:pb-0 md:pt-0 md:shadow-none md:backdrop-blur-0'
              >
                <div className='max-w-[320px] mx-auto md:mx-auto text-left'>
                  <span className='text-[10px] tracking-[0.4em] text-brand-light font-medium'>
                    ACCESO ADMIN
                  </span>
                  <h1 className='mt-4 mb-10 text-3xl font-light tracking-[0.1em] text-white'>
                    Ingresar
                  </h1>

                  <form
                    className='space-y-8'
                    onSubmit={(e) => {
                      e.preventDefault();
                      router.push('/home');
                    }}
                  >
                    <div className='flex flex-col gap-2'>
                      <label
                        htmlFor={emailId}
                        className='text-[10px] tracking-widest text-brand-light font-semibold'
                      >
                        EMAIL
                      </label>
                      <input
                        id={emailId}
                        type='email'
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='admin@anton.com'
                        className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] font-light text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand-light/50 focus:ring-1 focus:ring-brand-light/30 md:rounded-none md:border-0 md:border-b md:border-white/20 md:bg-transparent md:px-0 md:py-2 md:text-base md:placeholder:text-white/20 md:focus:border-brand-light md:focus:ring-0'
                      />
                    </div>

                    <div className='flex flex-col gap-2'>
                      <label
                        htmlFor={passwordId}
                        className='text-[10px] tracking-widest text-brand-light font-semibold'
                      >
                        PASSWORD
                      </label>
                      <div className='relative'>
                        <input
                          id={passwordId}
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='••••••••'
                          className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-[14px] font-light text-white placeholder:text-white/25 outline-none transition-colors focus:border-brand-light/50 focus:ring-1 focus:ring-brand-light/30 md:rounded-none md:border-0 md:border-b md:border-white/20 md:bg-transparent md:px-0 md:py-2 md:pr-10 md:text-base md:placeholder:text-white/20 md:focus:border-brand-light md:focus:ring-0'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          aria-pressed={showPassword}
                          aria-label={
                            showPassword
                              ? 'Ocultar password'
                              : 'Mostrar password'
                          }
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white md:right-0'
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type='submit'
                      className='w-full rounded-2xl bg-brand py-4 text-[11px] font-bold tracking-[0.3em] text-white shadow-[0_18px_60px_rgba(75,83,64,0.25)] transition-all duration-500 active:scale-[0.99] md:hover:bg-brand-light md:hover:shadow-[0_0_30px_rgba(75,83,64,0.4)]'
                    >
                      INGRESAR
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </main>
  );
}

// Sub-componente para el Logo para manejar el crossfade limpio
function LogoContent({
  isAnimated,
  scale,
}: {
  isAnimated: boolean;
  scale: number;
}) {
  return (
    <motion.div
      animate={{ scale }}
      transition={{ duration: 1.2, ease: easeLuxury }}
      className='relative w-[min(70vw,400px)] aspect-[1120/380]'
    >
      <AnimatePresence>
        {isAnimated ? (
          <motion.div
            key='gif'
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: easeLuxury }}
            className='absolute inset-0'
          >
            <Image
              src='/logo-gif.gif'
              alt='Anton'
              fill
              unoptimized
              className='object-contain'
            />
          </motion.div>
        ) : (
          <motion.div
            key='png'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, ease: easeLuxury }}
            className='absolute inset-0'
          >
            <Image
              src='/logo_Anton_blanco.png'
              alt='Anton'
              fill
              className='object-contain'
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
