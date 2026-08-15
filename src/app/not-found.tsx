import Link from "next/link";
export default function NotFound() { return <main className="grid min-h-[70svh] place-items-center px-5 text-center"><div><p className="eyebrow">404</p><h1 className="mt-4 font-serif text-6xl">Esta página não faz parte da coleção.</h1><Link href="/" className="button-dark mt-8">Voltar ao início</Link></div></main>; }
