import { db } from '@/lib/db';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let site = await db.site_settings.findOne({ id: 'site' });
  if (!site) {
    site = {
      id: 'site',
      logo_url: 'https://res.cloudinary.com/uq0zgy3i/image/upload/Brown_2_bsk3ns.png',
      hero_image_url:
        'https://res.cloudinary.com/uq0zgy3i/image/upload/q_auto,f_auto,w_2200/lion_pride_9_de9akv.jpg',
      about_image_url:
        'https://customer-assets.emergentagent.com/job_ffe20947-a722-4c4e-91fc-0363cc8eaee7/artifacts/0d85h6jz_about%20Photo.jpg',
      contact_email: 'mihirwildlife@gmail.com',
      categories: ['Birds', 'Wildlife', 'Behavior', 'Ecosystems'],
      collections: {},
      blog_url: '/blog',
      show_blog: true,
    };
  }

  return <HomeClient site={site} />;
}
