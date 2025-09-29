import { readdir, stat, unlink, rmdir } from 'fs/promises';
import { join } from 'path';

async function cleanupAvatars() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
  
  try {
    console.log('🧹 Starting avatar cleanup...');
    
    try {
      await stat(uploadsDir);
    } catch (error) {
      console.log('📁 Uploads directory does not exist, creating...');
      const { mkdir } = await import('fs/promises');
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
      return;
    }

    const items = await readdir(uploadsDir);
    
    if (items.length === 0) {
      console.log('📁 No files to clean up');
      return;
    }

    console.log(`📊 Found ${items.length} items in uploads directory`);

    let deletedFiles = 0;
    let deletedDirs = 0;

    for (const item of items) {
      const itemPath = join(uploadsDir, item);
      const itemStat = await stat(itemPath);

      if (itemStat.isDirectory()) {
        const dirContents = await readdir(itemPath);
        
        if (dirContents.length === 0) {
          await rmdir(itemPath);
          deletedDirs++;
          console.log(`🗑️  Deleted empty directory: ${item}`);
        } else {
          for (const file of dirContents) {
            const filePath = join(itemPath, file);
            const fileStat = await stat(filePath);
            
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            if (fileStat.mtime.getTime() < thirtyDaysAgo) {
              await unlink(filePath);
              deletedFiles++;
              console.log(`🗑️  Deleted old file: ${item}/${file}`);
            }
          }
          
          const remainingContents = await readdir(itemPath);
          if (remainingContents.length === 0) {
            await rmdir(itemPath);
            deletedDirs++;
            console.log(`🗑️  Deleted empty directory after cleanup: ${item}`);
          }
        }
      } else {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (itemStat.mtime.getTime() < thirtyDaysAgo) {
          await unlink(itemPath);
          deletedFiles++;
          console.log(`🗑️  Deleted old file: ${item}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupAvatars()
    .then(() => {
      console.log('🎉 Avatar cleanup finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Avatar cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupAvatars };
