import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import AchievementBadge from '../app/components/ui/AchievementBadge';

describe('AchievementBadge Component', () => {
  const mockAchievement = {
    id: 'first-story',
    title: 'First Story',
    description: 'Published your first story',
    icon: '📖',
    rarity: 'common' as const,
    unlockedAt: new Date('2024-01-15'),
    progress: 100,
    category: 'writing'
  };

  const mockLockedAchievement = {
    id: 'story-master',
    title: 'Story Master',
    description: 'Publish 50 stories',
    icon: '👑',
    rarity: 'legendary' as const,
    unlockedAt: null,
    progress: 60,
    category: 'writing'
  };

  it('renders unlocked achievement correctly', () => {
    render(<AchievementBadge achievement={mockAchievement} />);
    
    expect(screen.getByText('First Story')).toBeInTheDocument();
    expect(screen.getByText('Published your first story')).toBeInTheDocument();
    expect(screen.getByText('📖')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
  });

  it('renders locked achievement correctly', () => {
    render(<AchievementBadge achievement={mockLockedAchievement} />);
    
    expect(screen.getByText('Story Master')).toBeInTheDocument();
    expect(screen.getByText('Publish 50 stories')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    
    // Should show locked styling
    const badge = screen.getByRole('button');
    expect(badge).toHaveClass('opacity-50');
  });

  it('shows different rarity styles', () => {
    const rarities = [
      { ...mockAchievement, rarity: 'common' as const },
      { ...mockAchievement, rarity: 'rare' as const },
      { ...mockAchievement, rarity: 'epic' as const },
      { ...mockAchievement, rarity: 'legendary' as const }
    ];

    rarities.forEach((achievement, index) => {
      const { container } = render(<AchievementBadge achievement={achievement} />);
      const badge = container.querySelector('.achievement-badge');
      
      switch (achievement.rarity) {
        case 'common':
          expect(badge).toHaveClass('border-gray-300');
          break;
        case 'rare':
          expect(badge).toHaveClass('border-blue-400');
          break;
        case 'epic':
          expect(badge).toHaveClass('border-purple-400');
          break;
        case 'legendary':
          expect(badge).toHaveClass('border-yellow-400');
          break;
      }
    });
  });

  it('displays progress bar for locked achievements', () => {
    render(<AchievementBadge achievement={mockLockedAchievement} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows unlock date for completed achievements', () => {
    render(<AchievementBadge achievement={mockAchievement} />);
    
    expect(screen.getByText(/Unlocked on/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(
      <AchievementBadge 
        achievement={mockAchievement} 
        onClick={mockOnClick} 
      />
    );
    
    const badge = screen.getByRole('button');
    fireEvent.click(badge);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockAchievement);
  });

  it('shows tooltip on hover', async () => {
    render(<AchievementBadge achievement={mockAchievement} showTooltip />);
    
    const badge = screen.getByRole('button');
    fireEvent.mouseEnter(badge);
    
    // Wait for tooltip to appear
    await screen.findByText('Published your first story');
  });

  it('renders in compact mode', () => {
    render(<AchievementBadge achievement={mockAchievement} compact />);
    
    // In compact mode, description should not be visible
    expect(screen.queryByText('Published your first story')).not.toBeInTheDocument();
    
    // But title should still be there
    expect(screen.getByText('First Story')).toBeInTheDocument();
  });

  it('shows different categories correctly', () => {
    const categories = [
      { ...mockAchievement, category: 'writing' },
      { ...mockAchievement, category: 'reading' },
      { ...mockAchievement, category: 'social' },
      { ...mockAchievement, category: 'milestone' }
    ];

    categories.forEach((achievement) => {
      render(<AchievementBadge achievement={achievement} />);
      
      // Each category should have appropriate styling or indicators
      const badge = screen.getByRole('button');
      expect(badge).toBeInTheDocument();
    });
  });

  it('handles animation props', () => {
    render(
      <AchievementBadge 
        achievement={mockAchievement} 
        animated
        glowing
      />
    );
    
    const badge = screen.getByRole('button');
    expect(badge).toHaveClass('animate-pulse');
    expect(badge).toHaveClass('shadow-lg');
  });

  it('displays achievement requirements', () => {
    const achievementWithRequirements = {
      ...mockLockedAchievement,
      requirements: {
        current: 30,
        target: 50,
        unit: 'stories'
      }
    };

    render(<AchievementBadge achievement={achievementWithRequirements} />);
    
    expect(screen.getByText('30 / 50 stories')).toBeInTheDocument();
  });

  it('shows streak achievements differently', () => {
    const streakAchievement = {
      ...mockAchievement,
      type: 'streak',
      streak: 7,
      title: '7-Day Writing Streak'
    };

    render(<AchievementBadge achievement={streakAchievement} />);
    
    expect(screen.getByText('7-Day Writing Streak')).toBeInTheDocument();
    // Streak achievements might have special styling
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<AchievementBadge achievement={mockAchievement} loading />);
    
    // Should show skeleton or loading indicator
    const skeleton = screen.getByTestId('achievement-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('supports custom styling', () => {
    render(
      <AchievementBadge 
        achievement={mockAchievement} 
        className="custom-class"
        style={{ backgroundColor: 'red' }}
      />
    );
    
    const badge = screen.getByRole('button');
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveStyle({ backgroundColor: 'red' });
  });

  it('shows achievement points/XP', () => {
    const achievementWithXP = {
      ...mockAchievement,
      xpReward: 100
    };

    render(<AchievementBadge achievement={achievementWithXP} />);
    
    expect(screen.getByText('100 XP')).toBeInTheDocument();
  });

  it('handles accessibility correctly', () => {
    render(<AchievementBadge achievement={mockAchievement} />);
    
    const badge = screen.getByRole('button');
    expect(badge).toHaveAttribute('aria-label');
    expect(badge).toHaveAttribute('tabIndex', '0');
    
    // Should be keyboard accessible
    fireEvent.keyDown(badge, { key: 'Enter' });
    fireEvent.keyDown(badge, { key: ' ' });
  });
});