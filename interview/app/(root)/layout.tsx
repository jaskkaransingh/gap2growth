import { ReactNode } from 'react'
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';

const RootLayout = async ({ children }: { children: ReactNode }) => {
    // const isUserAuthenticated = await isAuthenticated();
    // if(!isUserAuthenticated) redirect('/sign-in')

    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex gap-2 items-center">
                    <Image src="/g2g-logo.png" alt="G2G" width={38} height={38}></Image>
                    <h2 className="text-primary-100">G2G</h2>
                </Link>
            </nav>
            {children}
        </div>
    )
}

export default RootLayout
