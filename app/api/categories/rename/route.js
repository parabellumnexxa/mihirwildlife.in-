import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin, unauthorizedResponse } from '@/lib/auth';

export async function POST(request) {
  try {
    if (!verifyAdmin(request)) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const oldName = String(body.oldName || '').trim();
    const newName = String(body.newName || '').trim();

    if (!oldName) {
      return NextResponse.json({ detail: 'Current category name is required.' }, { status: 400 });
    }
    if (!newName) {
      return NextResponse.json({ detail: 'New category name is required.' }, { status: 400 });
    }

    // Load site settings
    let site = await db.site_settings.findOne({ id: 'site' });
    if (!site) {
      site = {
        id: 'site',
        categories: ['Birds', 'Wildlife', 'Behavior', 'Ecosystems'],
      };
    }

    const currentCategories = Array.isArray(site.categories) && site.categories.length > 0
      ? site.categories
      : ['Birds', 'Wildlife', 'Behavior', 'Ecosystems'];

    // Check collision with another category (case-insensitive, ignoring oldName)
    const collision = currentCategories.some(
      (c) => c.toLowerCase() === newName.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
    );
    if (collision) {
      return NextResponse.json({ detail: `Category "${newName}" already exists.` }, { status: 400 });
    }

    // If identical, return early without error
    if (oldName === newName) {
      return NextResponse.json({
        success: true,
        message: 'No changes made.',
        oldName,
        newName,
        updatedPhotosCount: 0,
        site,
      });
    }

    // Replace oldName with newName in categories array (preserving index position)
    let foundIndex = currentCategories.findIndex((c) => c === oldName);
    if (foundIndex === -1) {
      foundIndex = currentCategories.findIndex((c) => c.toLowerCase() === oldName.toLowerCase());
    }

    let updatedCategories;
    if (foundIndex !== -1) {
      updatedCategories = [...currentCategories];
      updatedCategories[foundIndex] = newName;
    } else {
      updatedCategories = [...currentCategories, newName];
    }

    // Persist updated site categories
    const updatedSite = { ...site, categories: updatedCategories, id: 'site' };
    await db.site_settings.updateOne({ id: 'site' }, { $set: { categories: updatedCategories } });

    // Update all photos that had oldName (matching exact or case-insensitive)
    const allPhotos = await db.photos.find({});
    let updatedPhotosCount = 0;
    for (const photo of allPhotos) {
      if (photo.category === oldName || (photo.category && photo.category.toLowerCase() === oldName.toLowerCase())) {
        await db.photos.updateOne({ id: photo.id }, { $set: { category: newName } });
        updatedPhotosCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Category "${oldName}" renamed to "${newName}".`,
      oldName,
      newName,
      updatedPhotosCount,
      site: updatedSite,
    });
  } catch (err) {
    return NextResponse.json({ detail: err.message }, { status: 500 });
  }
}
