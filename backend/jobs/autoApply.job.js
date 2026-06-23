
// 'use strict';
// // backend/jobs/autoApply.cron.js

// const cron = require('node-cron');
// const { runAutoApply } = require('../services/autoApply.service');
// const { User } = require('../models');
// const logger = require('../utils/logger');

// /**
//  * Auto-apply cron job
//  * Runs every hour to check for matching jobs for all eligible users
//  */
// function startAutoApplyCron(io = null) {
  
//   /**
//    * Main function to process all users with auto-apply enabled
//    */
//   const processAllUsers = async () => {
//     logger.info('⏰ Running auto-apply cron job...');
    
//     try {
//       // Get all users with auto-apply enabled
//       const users = await User.findAll({
//         where: {
//           autoApplyEnabled: true,
//           status: 'active',
//           planKey: ['pro', 'elite'], // Only Pro and Elite plans
//         },
//         attributes: ['id', 'fullName', 'email'],
//       });
      
//       logger.info(`📋 Found ${users.length} users with auto-apply enabled`);
      
//       let totalApplied = 0;
//       let totalSkipped = 0;
      
//       for (const user of users) {
//         try {
//           const result = await runAutoApply(user.id, { dryRun: false, maxBatch: 5 });
          
//           if (result.applied && result.applied.length > 0) {
//             logger.info(`✅ User ${user.email}: applied to ${result.applied.length} jobs`);
//             totalApplied += result.applied.length;
            
//             // Send notification to user via socket if available
//             if (io) {
//               io.to(`user-${user.id}`).emit('auto_apply_completed', {
//                 applied: result.applied.length,
//                 jobs: result.applied.map(j => ({ title: j.title, company: j.company, score: j.score })),
//               });
//             }
//           }
          
//           if (result.skipped && result.skipped.length > 0) {
//             totalSkipped += result.skipped.length;
//           }
          
//           // Small delay between users to avoid rate limiting
//           await new Promise(resolve => setTimeout(resolve, 1000));
          
//         } catch (error) {
//           logger.error(`❌ Error processing user ${user.email}:`, error.message);
//         }
//       }
      
//       logger.info(`✅ Auto-apply job completed: ${totalApplied} applied, ${totalSkipped} skipped`);
      
//     } catch (error) {
//       logger.error('❌ Auto-apply cron job failed:', error.message);
//     }
//   };
  
//   // Run every hour at minute 0
//   cron.schedule('0 * * * *', async () => {
//     await processAllUsers();
//   });
  
//   // Also run 30 minutes past each hour for more frequent checks
//   cron.schedule('30 * * * *', async () => {
//     await processAllUsers();
//   });
  
//   logger.info('✅ Auto-apply cron job scheduled (every hour and half-hour)');
  
//   // Run immediately on startup (after 10 seconds)
//   setTimeout(() => {
//     logger.info('🚀 Running initial auto-apply check...');
//     processAllUsers();
//   }, 10000);
// }

// module.exports = { startAutoApplyCron };

'use strict';
// backend/jobs/autoApply.cron.js

const cron = require('node-cron');
const { runAutoApply } = require('../services/autoApply.service');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Auto-apply cron job
 * Runs every 2 minutes to check for matching jobs for all eligible users
 */
function startAutoApplyCron(io = null) {

  /**
   * Main function to process all users with auto-apply enabled
   */
  const processAllUsers = async () => {
    logger.info('⏰ Running auto-apply cron job...');

    try {
      // Get all users with auto-apply enabled
      const users = await User.findAll({
        where: {
          autoApplyEnabled: true,
          status: 'active',
          planKey: ['pro', 'elite'], // Only Pro and Elite plans
        },
        attributes: ['id', 'fullName', 'email'],
      });

      logger.info(`📋 Found ${users.length} users with auto-apply enabled`);

      let totalApplied = 0;
      let totalSkipped = 0;

      for (const user of users) {
        try {
          const result = await runAutoApply(user.id, { dryRun: false, maxBatch: 5 });

          if (result.applied && result.applied.length > 0) {
            logger.info(`✅ User ${user.email}: applied to ${result.applied.length} jobs`);
            totalApplied += result.applied.length;

            // Send notification to user via socket if available
            if (io) {
              io.to(`user-${user.id}`).emit('auto_apply_completed', {
                applied: result.applied.length,
                jobs: result.applied.map(j => ({ title: j.title, company: j.company, score: j.score })),
              });
            }
          }

          if (result.skipped && result.skipped.length > 0) {
            totalSkipped += result.skipped.length;
          }

          // Small delay between users to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          logger.error(`❌ Error processing user ${user.email}:`, error.message);
        }
      }

      logger.info(`✅ Auto-apply job completed: ${totalApplied} applied, ${totalSkipped} skipped`);

    } catch (error) {
      logger.error('❌ Auto-apply cron job failed:', error.message);
    }
  };

  // ✅ Run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    await processAllUsers();
  });

  logger.info('✅ Auto-apply cron job scheduled (every 2 minutes)');

  // Run immediately on startup (after 10 seconds)
  setTimeout(() => {
    logger.info('🚀 Running initial auto-apply check...');
    processAllUsers();
  }, 10000);
}

module.exports = { startAutoApplyCron };