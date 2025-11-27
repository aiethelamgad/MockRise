/**
 * Script to check user statuses and verify stats calculation
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../src/models/User');

async function checkUserStats() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
        if (!mongoUri) {
            throw new Error('MongoDB URI not found in environment variables. Please set MONGODB_URI, MONGO_URI, or DATABASE_URL');
        }
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected\n');

        // Get all users
        const allUsers = await User.find({}).select('email role status name').lean();
        
        console.log(`Total users: ${allUsers.length}\n`);
        console.log('User breakdown:');
        console.log('='.repeat(80));
        
        const statusCounts = {
            approved: 0,
            pending_verification: 0,
            rejected: 0,
            null: 0,
            undefined: 0
        };
        
        const roleStatusBreakdown = {};
        
        allUsers.forEach((user, index) => {
            const status = user.status;
            const statusKey = status === null ? 'null' : (status === undefined ? 'undefined' : status);
            
            if (!statusCounts[statusKey]) {
                statusCounts[statusKey] = 0;
            }
            statusCounts[statusKey]++;
            
            // Role-status breakdown
            const key = `${user.role}_${statusKey}`;
            if (!roleStatusBreakdown[key]) {
                roleStatusBreakdown[key] = 0;
            }
            roleStatusBreakdown[key]++;
            
            console.log(`${index + 1}. ${user.email || 'No email'} | Role: ${user.role} | Status: ${status === null ? 'null' : (status === undefined ? 'undefined' : status)}`);
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('\nStatus Counts:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count}`);
        });
        
        console.log('\nRole-Status Breakdown:');
        Object.entries(roleStatusBreakdown).forEach(([key, count]) => {
            console.log(`  ${key}: ${count}`);
        });
        
        // Calculate stats using the same logic as the controller
        // Active: approved OR undefined/null (all undefined users are treated as active)
        const activeQuery = {
            $or: [
                { status: 'approved' },
                { status: { $exists: false } },
                { status: null }
            ]
        };
        
        // Inactive: only pending_verification or rejected (undefined users are NOT counted as inactive)
        const inactiveQuery = {
            status: { $in: ['pending_verification', 'rejected'] }
        };
        
        const calculatedStats = {
            total: await User.countDocuments(),
            active: await User.countDocuments(activeQuery),
            inactive: await User.countDocuments(inactiveQuery),
            approved: await User.countDocuments({ status: 'approved' }),
            pending: await User.countDocuments({ status: 'pending_verification' }),
            rejected: await User.countDocuments({ status: 'rejected' }),
            nullStatus: await User.countDocuments({ 
                $or: [
                    { status: { $exists: false } },
                    { status: null }
                ]
            })
        };
        
        console.log('\n' + '='.repeat(80));
        console.log('\nCalculated Stats (using controller logic):');
        console.log(`  Total: ${calculatedStats.total}`);
        console.log(`  Active: ${calculatedStats.active}`);
        console.log(`  Inactive: ${calculatedStats.inactive}`);
        console.log(`  Approved (explicit): ${calculatedStats.approved}`);
        console.log(`  Pending: ${calculatedStats.pending}`);
        console.log(`  Rejected: ${calculatedStats.rejected}`);
        console.log(`  Null/Undefined Status: ${calculatedStats.nullStatus}`);
        
        // Manual calculation
        let manualActive = 0;
        let manualInactive = 0;
        
        allUsers.forEach(user => {
            if (user.status === 'approved') {
                manualActive++;
            } else if (user.status === 'pending_verification' || user.status === 'rejected') {
                manualInactive++;
            } else if (user.status === null || user.status === undefined) {
                // Null/undefined status: non-interviewers = active, interviewers = inactive
                if (user.role !== 'interviewer') {
                    manualActive++;
                } else {
                    manualInactive++;
                }
            }
        });
        
        console.log('\nManual Calculation:');
        console.log(`  Active: ${manualActive}`);
        console.log(`  Inactive: ${manualInactive}`);
        
        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserStats();

