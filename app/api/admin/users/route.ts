import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectDB } from '@/utils/db';
import User from '@/models/User';
import Story from '@/models/Story';
import Comment from '@/models/Comment';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const permanent = searchParams.get('permanent') === 'true';
    const reason = searchParams.get('reason') || '';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (permanent) {
      // Permanent deletion - remove all user data
      
      // Delete user's stories
      await Story.deleteMany({ author: userId });
      
      // Delete user's comments
      await Comment.deleteMany({ author: userId });
      
      // Remove user from likes arrays
      await Story.updateMany(
        { likes: userId },
        { $pull: { likes: userId } }
      );
      
      // Delete the user
      await User.findByIdAndDelete(userId);
      
      return NextResponse.json({
        message: 'User permanently deleted',
        deletedData: {
          user: true,
          stories: true,
          comments: true,
          likes: true
        }
      });
      
    } else {
      // Soft deletion - deactivate account and anonymize content
      
      // Update user status
      user.status = 'deleted';
      user.deletedAt = new Date();
      user.deletedBy = session.user.id;
      user.deletionReason = reason;
      
      // Anonymize personal data
      user.email = `deleted_${userId}@deleted.local`;
      user.name = 'Deleted User';
      user.bio = '';
      user.avatar = '';
      
      // Add to admin actions
      if (!user.adminActions) user.adminActions = [];
      user.adminActions.push({
        action: 'delete',
        adminId: session.user.id,
        adminName: session.user.name,
        reason: reason || 'Account deletion',
        timestamp: new Date()
      });
      
      await user.save();
      
      // Anonymize stories (keep content but remove personal attribution)
      await Story.updateMany(
        { author: userId },
        { 
          visibility: 'private',
          title: 'Story by Deleted User',
          tags: []
        }
      );
      
      return NextResponse.json({
        message: 'User account deactivated and data anonymized',
        deletedData: {
          user: 'anonymized',
          stories: 'anonymized',
          comments: 'kept',
          likes: 'kept'
        }
      });
    }

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Bulk operations (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { operation, userIds, data } = await request.json();

    if (!operation || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Operation and user IDs are required' },
        { status: 400 }
      );
    }

    let result;
    
    switch (operation) {
      case 'bulk_update_role':
        if (!data.role) {
          return NextResponse.json({ error: 'Role is required' }, { status: 400 });
        }
        
        // Prevent changing own role from admin
        const filteredIds = userIds.filter(id => id !== session.user.id);
        
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { 
            role: data.role,
            updatedAt: new Date(),
            $push: {
              adminActions: {
                action: 'bulk_role_update',
                adminId: session.user.id,
                adminName: session.user.name,
                changes: { role: { to: data.role } },
                reason: data.reason || 'Bulk role update',
                timestamp: new Date()
              }
            }
          }
        );
        break;
        
      case 'bulk_update_status':
        if (!data.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            status: data.status,
            updatedAt: new Date(),
            $push: {
              adminActions: {
                action: 'bulk_status_update',
                adminId: session.user.id,
                adminName: session.user.name,
                changes: { status: { to: data.status } },
                reason: data.reason || 'Bulk status update',
                timestamp: new Date()
              }
            }
          }
        );
        break;
        
      case 'bulk_send_email':
        if (!data.subject || !data.template) {
          return NextResponse.json({ error: 'Subject and template are required' }, { status: 400 });
        }
        
        const users = await User.find({ _id: { $in: userIds } }).select('email name');
        
        const emailPromises = users.map(user => 
          sendEmail({
            to: user.email,
            subject: data.subject,
            template: data.template,
            data: {
              name: user.name,
              ...data.templateData
            }
          }).catch(error => {
            console.error(`Failed to send email to ${user.email}:`, error);
            return { error: true, email: user.email };
          })
        );
        
        const emailResults = await Promise.all(emailPromises);
        const failures = emailResults.filter(result => result && result.error);
        
        result = {
          sent: users.length - failures.length,
          failed: failures.length,
          failures: failures.map(f => f.email)
        };
        break;
        
      case 'bulk_export':
        const exportUsers = await User.find({ _id: { $in: userIds } })
          .select('-password -resetPasswordToken -resetPasswordExpires')
          .lean();
          
        // Add user statistics
        const usersWithStats = await Promise.all(
          exportUsers.map(async (user) => {
            const [storiesCount, commentsCount] = await Promise.all([
              Story.countDocuments({ author: user._id }),
              Comment.countDocuments({ author: user._id })
            ]);
            
            return {
              ...user,
              stats: { storiesCount, commentsCount }
            };
          })
        );
        
        result = {
          users: usersWithStats,
          exportedAt: new Date().toISOString(),
          exportedBy: session.user.name
        };
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      operation,
      result,
      affectedUsers: userIds.length
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [storiesCount, commentsCount, likesReceived] = await Promise.all([
          Story.countDocuments({ author: user._id }),
          Comment.countDocuments({ author: user._id }),
          Story.aggregate([
            { $match: { author: user._id } },
            { $project: { likesCount: { $size: '$likes' } } },
            { $group: { _id: null, total: { $sum: '$likesCount' } } }
          ])
        ]);

        return {
          ...user,
          stats: {
            storiesCount,
            commentsCount,
            likesReceived: likesReceived[0]?.total || 0
          }
        };
      })
    );

    // Get summary statistics
    const summaryStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          mentors: { $sum: { $cond: [{ $eq: ['$role', 'mentor'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          suspendedUsers: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } }
        }
      }
    ]);

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      },
      summary: summaryStats[0] || {
        totalUsers: 0,
        students: 0,
        mentors: 0,
        admins: 0,
        activeUsers: 0,
        suspendedUsers: 0
      },
      filters: {
        search,
        role,
        status,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userData = await request.json();
    const { name, email, role, ageGroup, sendWelcomeEmail = true } = userData;

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create user
    const newUser = new User({
      name,
      email,
      role,
      ageGroup,
      status: 'active',
      emailVerified: true, // Admin created users are auto-verified
      createdBy: session.user.id,
      tempPassword: true // Flag to force password reset on first login
    });

    // Set password
    await newUser.setPassword(tempPassword);
    await newUser.save();

    // Send welcome email with temporary credentials
    if (sendWelcomeEmail) {
      try {
        await sendEmail({
          to: email,
          subject: 'Welcome to Mintoons - Your Account Has Been Created',
          template: 'admin-user-created',
          data: {
            name,
            email,
            tempPassword,
            role,
            loginUrl: `${process.env.NEXTAUTH_URL}/login`
          }
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail user creation if email fails
      }
    }

    // Return user without sensitive data
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return NextResponse.json({
      user: userResponse,
      tempPassword: sendWelcomeEmail ? undefined : tempPassword // Only return if email wasn't sent
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Update user (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { userId, updates, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion from admin
    if (userId === session.user.id && updates.role && updates.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    // Track what changed for audit log
    const changes: any = {};
    const allowedUpdates = ['name', 'email', 'role', 'status', 'ageGroup', 'bio'];
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined && updates[key] !== user[key]) {
        changes[key] = { from: user[key], to: updates[key] };
        user[key] = updates[key];
      }
    }

    // Add admin action to user's history
    if (Object.keys(changes).length > 0) {
      if (!user.adminActions) user.adminActions = [];
      user.adminActions.push({
        action: 'update',
        adminId: session.user.id,
        adminName: session.user.name,
        changes,
        reason: reason || 'Admin update',
        timestamp: new Date()
      });
    }

    user.updatedAt = new Date();
    await user.save();

    // Send notification email for important changes
    if (changes.status || changes.role) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Account Update Notification',
          template: 'account-updated',
          data: {
            name: user.name,
            changes,
            reason: reason || 'Administrative update'
          }
        });
      } catch (emailError) {
        console.error('Failed to send update notification:', emailError);
      }
    }

    // Return updated user without sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return NextResponse.json({
      user: userResponse,
      changes
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB