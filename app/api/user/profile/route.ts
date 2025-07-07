import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/utils/db';
import User from '@/models/User';
import { profileUpdateSchema } from '@/utils/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id)
      .select('-password -__v')
      .populate('mentorId', 'name email');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid profile data',
          errors: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData = validation.data;
    
    // Update age group if age is being updated
    if (updateData.age) {
      if (updateData.age < 13) {
        updateData.ageGroup = 'under-13';
      } else if (updateData.age <= 17) {
        updateData.ageGroup = '13-17';
      } else {
        updateData.ageGroup = '18-plus';
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}