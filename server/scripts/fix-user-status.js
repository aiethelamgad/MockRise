/**
 * Script to fix users with missing/null status field
 * This ensures all users have a proper status set according to their role
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config({ path: '../.env' });

async function fixUserStatuses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        // Find all users with missing or null status
        const usersToFix = await User.find({
            $or: [
                { status: { $exists: false } },
                { status: null }
            ]
        });

        console.log(`Found ${usersToFix.length} users with missing/null status`);

        let updatedCount = 0;
        for (const user of usersToFix) {
            // Set status according to role (matching schema default)
            if (user.role === 'interviewer') {
                user.status = 'pending_verification';
            } else {
                user.status = 'approved';
            }
            
            // Update isApproved to match
            user.isApproved = user.status === 'approved';
            
            await user.save();
            updatedCount++;
            console.log(`Updated user ${user.email || user._id}: status=${user.status}, role=${user.role}`);
        }

        console.log(`\n✅ Successfully updated ${updatedCount} users`);
        
        // Show stats
        const stats = {
            total: await User.countDocuments(),
            approved: await User.countDocuments({ status: 'approved' }),
            pending: await User.countDocuments({ status: 'pending_verification' }),
            rejected: await User.countDocuments({ status: 'rejected' }),
            noStatus: await User.countDocuments({ 
                $or: [
                    { status: { $exists: false } },
                    { status: null }
                ]
            })
        };
        
        console.log('\n📊 Current User Stats:');
        console.log(`  Total: ${stats.total}`);
        console.log(`  Approved: ${stats.approved}`);
        console.log(`  Pending: ${stats.pending}`);
        console.log(`  Rejected: ${stats.rejected}`);
        console.log(`  No Status: ${stats.noStatus}`);

        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixUserStatuses();

