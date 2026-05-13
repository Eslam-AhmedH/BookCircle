using BookCircle.Core.Entities;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookCircle.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId)
        => await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    public async Task<Notification?> GetByIdAsync(int id)
        => await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id);

    public async Task AddAsync(Notification notification)
        => await _context.Notifications.AddAsync(notification);

    public void Update(Notification notification)
        => _context.Notifications.Update(notification);

    public async Task MarkAllReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in notifications)
            n.IsRead = true;

        _context.Notifications.UpdateRange(notifications);
    }
}
