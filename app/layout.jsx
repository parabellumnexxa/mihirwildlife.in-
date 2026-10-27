import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ClientProtectionProvider from '@/components/ClientProtectionProvider';

export const metadata = {
  title: 'Mihir Ranva — Wildlife Photography & Field Research',
  description:
    'Dedicated wildlife photographer, conservationist, and researcher documenting avian behavior and the wild fauna of Gujarat, India.',
  keywords: [
    'Wildlife Photography',
    'Mihir Ranva',
    'Gujarat Wildlife',
    'Gir Forest',
    'Asiatic Lions',
    'Avian Research',
    'Junagadh Wetlands',
    'Conservation',
  ],
  authors: [{ name: 'Mihir Ranva' }],
  creator: 'Mihir Ranva',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mihirwildlife.in',
    title: 'Mihir Ranva — Wildlife Photography & Field Research',
    description:
      'Dedicated wildlife photographer and researcher documenting the raw beauty, predatory dynamics, and biodiversity of Gujarat.',
    siteName: 'Mihir Ranva Wildlife Portfolio',
    images: [
      {
        url: 'https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1200/lion_pride_9_de9akv.jpg',
        width: 1200,
        height: 800,
        alt: 'Mihir Ranva Wildlife Photography',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mihir Ranva — Wildlife Photography & Field Research',
    description:
      'Dedicated wildlife photographer and researcher documenting the raw beauty and biodiversity of Gujarat.',
    images: [
      'https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_1200/lion_pride_9_de9akv.jpg',
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#050505] text-[#F5F5F5] antialiased selection:bg-[#C9A25E] selection:text-black">
        <ClientProtectionProvider>
          {children}
          <Toaster position="bottom-right" theme="dark" />
        </ClientProtectionProvider>
      </body>
    </html>
  );
}
